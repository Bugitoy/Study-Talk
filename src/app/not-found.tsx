"use client";
import Link from "next/link";
import NextLayout from "@/components/NextLayout";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, Info } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <NextLayout>
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-orange-500 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <main 
        id="main-content"
        className="min-h-[50vh] flex items-center justify-center"
        role="main"
        aria-labelledby="error-heading"
      >
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="space-y-4">
            {/* Error icon for visual users */}
            <div className="flex justify-center" aria-hidden="true">
              <AlertTriangle className="w-16 h-16 text-orange-500" />
            </div>
            
            {/* Error number */}
            <h1 
              id="error-heading" 
              className="text-6xl font-bold text-gray-900"
              aria-label="Error 404"
            >
              404
            </h1>
            
            {/* Error title */}
            <h2 className="text-2xl font-semibold text-gray-700">
              Page not found
            </h2>
            
            {/* Error description */}
            <p className="text-gray-500">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. 
              It may have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Action buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            role="group"
            aria-label="Navigation options"
          >
            <Button 
              size="lg" 
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              aria-describedby="go-home-description"
              onClick={() => router.push('/')}
            >
              <Home className="w-4 h-4 mr-2" aria-hidden="true" />
              Go Home
            </Button>
            <span id="go-home-description" className="sr-only">
              Navigate to the homepage
            </span>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              aria-describedby="about-description"
              onClick={() => router.push('/about')}
            >
              <Info className="w-4 h-4 mr-2" aria-hidden="true" />
              About Study-Talk
            </Button>
            <span id="about-description" className="sr-only">
              Navigate to the about page to learn more about Study-Talk
            </span>
          </div>

          {/* Additional help text */}
          <div className="mt-8 text-sm text-gray-400">
            <p>
              If you believe this is an error, please contact our support team.
            </p>
          </div>
        </div>
      </main>
    </NextLayout>
  );
}
