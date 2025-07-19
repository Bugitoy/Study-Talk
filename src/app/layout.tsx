import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryProvider } from "./providers";
import ErrorBoundary from "@/components/ErrorBoundary";
import DevErrorHandler from "@/components/DevErrorHandler";
import StreamVideoProvider from "./StreamClientProvider";
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { SocketProvider } from "./SocketProvider";

export const metadata: Metadata = {
  title: "Lets Study - Language Learning Platform",
  description: "Your bridge between Setswana and English languages",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Alata, sans-serif" }}>
        <DevErrorHandler />
        <ErrorBoundary>
          <ReactQueryProvider>
              <TooltipProvider>
                <StreamVideoProvider>
                  <SocketProvider>
                    <Toaster />
                    <Sonner />
                    {children}
                  </SocketProvider>
                </StreamVideoProvider>
              </TooltipProvider>
          </ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
