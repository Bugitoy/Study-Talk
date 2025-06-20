import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryProvider } from "./providers";
import { WordsProvider } from "@/lib/words-context";

export const metadata: Metadata = {
  title: "Thanodi - Setswana English Dictionary",
  description: "Your bridge between Setswana and English languages",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Alata, sans-serif" }}>
        <ReactQueryProvider>
          <WordsProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {children}
            </TooltipProvider>
          </WordsProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
