import NextLayout from "@/components/NextLayout";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import PaymentLink from "@/components/PaymentLink";

enum PopularPlanType {
  NO = 0,
  YES = 1,
}

interface PricingProps {
  title: string;
  popular: PopularPlanType;
  price: number;
  description: string;
  buttonText: string;
  benefitList: string[];
  href: string;
  billing: string;
  paymentLink?: string;
}

const pricingList: PricingProps[] = [
  {
    title: "Free",
    popular: 0,
    price: 0,
    description:
      "Perfect for getting started with basic language learning features.",
    buttonText: "Get Started",
    benefitList: [
      "Basic meetup access",
      "Limited daily interactions",
      "Basic study groups",
      "Community support",
      "Mobile access",
    ],
    href: "/api/auth/login",
    billing: "/month",
  },
  {
    title: "Premium",
    popular: 1,
    price: 10,
    description:
                      "Unlock the full power of Study-Talk with unlimited access and premium features.",
    buttonText: "Buy Now",
    benefitList: [
      "Unlimited meetup access",
      "Advanced study features",
      "Premium study groups",
      "Save unlimited content",
      "Priority support",
      "Offline access",
    ],
    href: "/api/auth/login",
    paymentLink: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PLAN_LINK,
    billing: "/month",
  },
  {
    title: "Enterprise",
    popular: 0,
    price: 99,
    description:
      "Complete access for educational institutions and organizations.",
    buttonText: "Buy Now",
    benefitList: [
      "Everything in Premium",
      "Multi-user accounts",
      "Custom study collections",
      "Advanced analytics",
      "API access",
      "Priority support",
    ],
    href: "/api/auth/login",
    paymentLink: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PLAN_LINK,
    billing: "/year",
  },
];

export default function PricingPage() {
  return (
    <NextLayout>
      <main id="main-content" role="main" className="container py-24 sm:py-32">
        {/* Skip to main content link for keyboard users */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50">
          Skip to main content
        </a>

        <section aria-labelledby="pricing-heading" id="pricing">
          <header className="text-center mb-12">
            <h1 id="pricing-heading" className="text-3xl md:text-4xl font-bold">
              Get
              <span className="bg-gradient-to-b from-orange-400 to-orange-600 uppercase text-transparent bg-clip-text">
                {" "}
                Unlimited{" "}
              </span>
              Access
            </h1>
            <h2 className="text-xl text-center text-muted-foreground pt-4 pb-8">
              Choose the perfect plan for your language learning journey.
            </h2>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" role="list" aria-label="Pricing plans">
            {pricingList.map((pricing: PricingProps) => (
              <Card
                key={pricing.title}
                className={
                  pricing.popular === PopularPlanType.YES
                    ? "drop-shadow-xl shadow-black/10 dark:shadow-white/10 border-2 border-orange-200"
                    : ""
                }
                role="listitem"
                aria-labelledby={`${pricing.title.toLowerCase()}-plan-title`}
              >
                <CardHeader>
                  <CardTitle className="flex item-center justify-between" id={`${pricing.title.toLowerCase()}-plan-title`}>
                    {pricing.title}
                    {pricing.popular === PopularPlanType.YES ? (
                      <Badge
                        variant="secondary"
                        className="text-sm text-primary bg-orange-100 text-orange-700"
                        aria-label="Most popular plan"
                      >
                        Most popular
                      </Badge>
                    ) : null}
                  </CardTitle>
                  <div>
                    <span className="text-3xl font-bold" aria-label={`${pricing.price} dollars`}>${pricing.price}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      {pricing.billing}
                    </span>
                  </div>

                  <CardDescription>{pricing.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <PaymentLink
                    href={pricing.href}
                    text={pricing.buttonText}
                    paymentLink={pricing.paymentLink}
                  />
                </CardContent>

                <hr className="w-4/5 m-auto mb-4" aria-hidden="true" />

                <CardFooter className="flex">
                  <div className="space-y-4" role="list" aria-label={`${pricing.title} plan benefits`}>
                    {pricing.benefitList.map((benefit: string) => (
                      <span key={benefit} className="flex items-center" role="listitem">
                        <Check className="text-orange-500" aria-hidden="true" />
                        <span className="ml-2">{benefit}</span>
                      </span>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </NextLayout>
  );
}
