import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/db/prisma";
import Stripe from "stripe";
import { Plan } from "@prisma/client";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = await stripe.checkout.sessions.retrieve(
          (event.data.object as Stripe.Checkout.Session).id,
          {
            expand: ["line_items"],
          },
        );
        const customerId = session.customer as string;
        const customerDetails = session.customer_details;

        if (customerDetails?.email) {
          const user = await prisma.user.findUnique({
            where: { email: customerDetails.email },
          });
          if (!user) throw new Error("User not found");

          if (!user.customerId) {
            await prisma.user.update({
              where: { id: user.id },
              data: { customerId },
            });
          }

          const lineItems = session.line_items?.data || [];

          for (const item of lineItems) {
            const priceId = item.price?.id;
            const isSubscription = item.price?.type === "recurring";

            if (isSubscription) {
              let endDate = new Date();
              let plan: "plus" | "premium" = "plus";
              let period: "monthly" | "yearly" = "monthly";

              // Determine plan and period based on price ID
              if (priceId === process.env.STRIPE_PLUS_MONTHLY_PRICE_ID) {
                endDate.setMonth(endDate.getMonth() + 1);
                plan = "plus";
                period = "monthly";
              } else if (priceId === process.env.STRIPE_PLUS_YEARLY_PRICE_ID) {
                endDate.setFullYear(endDate.getFullYear() + 1);
                plan = "plus";
                period = "yearly";
              } else if (priceId === process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID) {
                endDate.setMonth(endDate.getMonth() + 1);
                plan = "premium";
                period = "monthly";
              } else if (priceId === process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID) {
                endDate.setFullYear(endDate.getFullYear() + 1);
                plan = "premium";
                period = "yearly";
              } else {
                throw new Error(`Invalid priceId: ${priceId}`);
              }

              // Create or update subscription
              await prisma.subscription.upsert({
                where: { userId: user.id },
                create: {
                  userId: user.id,
                  startDate: new Date(),
                  endDate: endDate,
                  plan: plan as Plan,
                  period: period,
                },
                update: {
                  plan: plan as Plan,
                  period: period,
                  startDate: new Date(),
                  endDate: endDate,
                },
              });

              await prisma.user.update({
                where: { id: user.id },
                data: { plan: plan as Plan },
              });
            } else {
              // Handle one-time purchases if needed
              console.log("One-time purchase detected:", priceId);
            }
          }
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = await stripe.subscriptions.retrieve((event.data.object as Stripe.Subscription).id);
        const user = await prisma.user.findUnique({
          where: { customerId: subscription.customer as string },
        });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { plan: "free" },
          });
        } else {
          console.error("User not found for the subscription deleted event.");
          throw new Error("User not found for the subscription deleted event.");
        }

        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error("Error handling event", error);
    return new Response("Webhook Error", { status: 400 });
  }

  return new Response("Webhook received", { status: 200 });
}
