import Link from "next/link";
import NextLayout from "@/components/NextLayout";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <NextLayout>
      <main 
        className="min-h-[50vh] flex items-center justify-center"
        role="main"
        aria-labelledby="error-heading"
      >
        <div 
          className="text-center space-y-6"
          role="region"
          aria-label="Error page content"
        >
          <div className="space-y-2">
            <h1 
              id="error-heading"
              className="text-6xl font-bold text-gray-900"
              aria-label="Error 404"
            >
              404
            </h1>
            <h2 
              className="text-2xl font-semibold text-gray-700"
              aria-describedby="error-heading"
            >
              Page not found
            </h2>
            <p 
              className="text-gray-500 max-w-md mx-auto"
              aria-describedby="error-heading"
            >
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>
          </div>

          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            role="group"
            aria-label="Navigation options"
          >
            <Link href="/">
              <Button 
                size="lg" 
                className="rounded-full"
                aria-describedby="error-heading"
              >
                Go Home
              </Button>
            </Link>
            <Link href="/about">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full"
                aria-describedby="error-heading"
              >
                About Study-Talk
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </NextLayout>
  );
}
