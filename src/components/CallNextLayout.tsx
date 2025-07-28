"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function CallNextLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useCurrentUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Hide navbar on meeting room page
  const hideNavbar = pathname.startsWith('/meetups/study-groups/meeting');

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, #FFECD2, #DCEAF7, #FFDECA)",
      }}
    >
      {!hideNavbar && (
        <header className="border-2 border-gray-300 bg-white/80 backdrop-blur-sm" role="banner">
          <div className="mx-auto px-4 py-4 max-w-screen-2xl">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link 
                href="/" 
                className="flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded" 
                aria-label="Study-Talk Homepage"
              >
                <Image
                  src="/Images/logo.svg"
                  alt="Study-Talk Logo"
                  width={50}
                  height={50}
                  className="w-10 h-10"
                />
                <span
                  className="text-xl font-bold text-gray-900"
                  style={{ fontFamily: "Alata, sans-serif" }}
                >
                  Study-Talk
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
                <Link
                  href="/meetups"
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded",
                    isActive("/meetups") ? "text-orange-600" : "text-gray-600",
                  )}
                  style={{ fontFamily: "Alata, sans-serif" }}
                  aria-current={isActive("/meetups") ? "page" : undefined}
                >
                  Meetups
                </Link>
                <Link
                  href="/pricing"
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded",
                    isActive("/pricing") ? "text-orange-600" : "text-gray-600",
                  )}
                  style={{ fontFamily: "Alata, sans-serif" }}
                  aria-current={isActive("/pricing") ? "page" : undefined}
                >
                  Pricing
                </Link>
                <Link
                  href="/about"
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded",
                    isActive("/about") ? "text-orange-600" : "text-gray-600",
                  )}
                  style={{ fontFamily: "Alata, sans-serif" }}
                  aria-current={isActive("/about") ? "page" : undefined}
                >
                  About
                </Link>
                {user?.isAdmin && (
                  <Link
                    href="/admin/reports"
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded",
                      isActive("/admin/reports") ? "text-orange-600" : "text-orange-300",
                    )}
                    style={{ fontFamily: "Alata, sans-serif" }}
                    aria-current={isActive("/admin/reports") ? "page" : undefined}
                  >
                    Admin
                  </Link>
                )}
              </nav>

              {/* Mobile Menu Button */}
              <div className="lg:hidden flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                  aria-label="Account settings"
                  onClick={() => router.push('/account')}
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-menu"
                  aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Menu className="w-5 h-5" aria-hidden="true" />
                  )}
                </Button>
              </div>

              {/* Desktop User Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex w-10 h-10 rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                aria-label="Account settings"
                onClick={() => router.push('/account')}
              >
                <User className="w-5 h-5" aria-hidden="true" />
              </Button>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <nav 
                className="lg:hidden mt-4 pt-4 border-t border-gray-200" 
                role="navigation" 
                aria-label="Mobile navigation"
                id="mobile-menu"
              >
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/meetups"
                    className={cn(
                      "text-base font-medium transition-colors hover:text-orange-600 py-2 px-3 rounded-lg hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                      isActive("/meetups") ? "text-orange-600 bg-orange-50" : "text-gray-600",
                    )}
                    style={{ fontFamily: "Alata, sans-serif" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={isActive("/meetups") ? "page" : undefined}
                  >
                    Meetups
                  </Link>
                  <Link
                    href="/pricing"
                    className={cn(
                      "text-base font-medium transition-colors hover:text-orange-600 py-2 px-3 rounded-lg hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                      isActive("/pricing") ? "text-orange-600 bg-orange-50" : "text-gray-600",
                    )}
                    style={{ fontFamily: "Alata, sans-serif" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={isActive("/pricing") ? "page" : undefined}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/about"
                    className={cn(
                      "text-base font-medium transition-colors hover:text-orange-600 py-2 px-3 rounded-lg hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                      isActive("/about") ? "text-orange-600 bg-orange-50" : "text-gray-600",
                    )}
                    style={{ fontFamily: "Alata, sans-serif" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={isActive("/about") ? "page" : undefined}
                  >
                    About
                  </Link>
                  {user?.isAdmin && (
                    <Link
                      href="/admin/reports"
                      className={cn(
                        "text-base font-medium transition-colors hover:text-orange-600 py-2 px-3 rounded-lg hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                        isActive("/admin/reports") ? "text-orange-600 bg-orange-50" : "text-orange-300",
                      )}
                      style={{ fontFamily: "Alata, sans-serif" }}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-current={isActive("/admin/reports") ? "page" : undefined}
                    >
                      Admin
                    </Link>
                  )}
                </div>
              </nav>
            )}
          </div>
        </header>
      )}
      <main className="mx-auto px-4 pt-2 sm:pt-8 pb-8 max-w-screen-6xl text-blue-300">
        {children}
      </main>
    </div>
  );
}
