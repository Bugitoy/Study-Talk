"use client";

import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

type PaymentLinkProps = {
  href: string;
  paymentLink?: string;
  text: string;
  variant?: "default" | "outline";
  className?: string;
};

const PaymentLink = ({ href, paymentLink, text, variant = "default", className }: PaymentLinkProps) => {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant }),
        className
      )}
      onClick={() => {
        if (paymentLink) {
          localStorage.setItem("stripePaymentLink", paymentLink);
        }
      }}
    >
      {text}
    </Link>
  );
};

export default PaymentLink;
