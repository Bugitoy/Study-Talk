"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function NextLayout({ children }: LayoutProps) {
  const pathname = usePathname();
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
        <header className="border-2 border-gray-300 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom right, #F7D379, #F9B288)",
                  }}
                >
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span
                  className="text-xl font-bold text-gray-900"
                  style={{ fontFamily: "Alata, sans-serif" }}
                >
                  Study-Talk
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-8">
                <Link
                  href="/meetups"
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-orange-600",
                    isActive("/meetups") ? "text-orange-600" : "text-gray-600",
                  )}
                  style={{ fontFamily: "Alata, sans-serif" }}
                >
                  Meetups
                </Link>
                <Link
                  href="/pricing"
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-orange-600",
                    isActive("/pricing") ? "text-orange-600" : "text-gray-600",
                  )}
                  style={{ fontFamily: "Alata, sans-serif" }}
                >
                  Pricing
                </Link>
                <Link
                  href="/about"
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-orange-600",
                    isActive("/about") ? "text-orange-600" : "text-gray-600",
                  )}
                  style={{ fontFamily: "Alata, sans-serif" }}
                >
                  About
                </Link>
                {user?.isAdmin && (
                  <Link href="/admin/reports"
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-orange-600",
                    isActive("/admin/reports") ? "text-orange-600" : "text-orange-300",
                  )}
                  style={{ fontFamily: "Alata, sans-serif" }}
                  >
                    Admin
                  </Link>
                )}
              </nav>

              {/* Mobile Menu Button */}
              <div className="lg:hidden flex items-center space-x-2">
                <Link href="/account" className="mr-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full hover:bg-gray-100"
                  >
                    <User className="w-4 h-4" />
                    <span className="sr-only">Account</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </div>

              {/* Desktop User Icon */}
              <Link href="/account" className="hidden lg:block">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full hover:bg-gray-100"
                >
                  <User className="w-5 h-5" />
                  <span className="sr-only">Account</span>
                </Button>
              </Link>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <nav className="lg:hidden mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/meetups"
                    className={cn(
                      "text-base font-medium transition-colors hover:text-orange-600 py-2 px-3 rounded-lg hover:bg-gray-50",
                      isActive("/meetups") ? "text-orange-600 bg-orange-50" : "text-gray-600",
                    )}
                    style={{ fontFamily: "Alata, sans-serif" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Meetups
                  </Link>
                  <Link
                    href="/pricing"
                    className={cn(
                      "text-base font-medium transition-colors hover:text-orange-600 py-2 px-3 rounded-lg hover:bg-gray-50",
                      isActive("/pricing") ? "text-orange-600 bg-orange-50" : "text-gray-600",
                    )}
                    style={{ fontFamily: "Alata, sans-serif" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/about"
                    className={cn(
                      "text-base font-medium transition-colors hover:text-orange-600 py-2 px-3 rounded-lg hover:bg-gray-50",
                      isActive("/about") ? "text-orange-600 bg-orange-50" : "text-gray-600",
                    )}
                    style={{ fontFamily: "Alata, sans-serif" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  {user?.isAdmin && (
                    <Link
                      href="/admin/reports"
                      className={cn(
                        "text-base font-medium transition-colors hover:text-orange-600 py-2 px-3 rounded-lg hover:bg-gray-50",
                        isActive("/admin/reports") ? "text-orange-600 bg-orange-50" : "text-orange-300",
                      )}
                      style={{ fontFamily: "Alata, sans-serif" }}
                      onClick={() => setIsMobileMenuOpen(false)}
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
      <main className="container mx-auto px-4 py-8 text-blue-300">
        {children}
      </main>
    </div>
  );
}
