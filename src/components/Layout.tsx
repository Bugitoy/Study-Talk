import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, #FFECD2, #DCEAF7, #FFDECA)",
      }}
    >
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
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
                Thanodi
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={cn(
                  "text-lg font-medium transition-colors hover:text-orange-600",
                  isActive("/") ? "text-orange-600" : "text-gray-600",
                )}
                style={{ fontFamily: "Alata, sans-serif" }}
              >
                Dictionary
              </Link>
              <Link
                to="/saved"
                className={cn(
                  "text-lg font-medium transition-colors hover:text-orange-600",
                  isActive("/saved") ? "text-orange-600" : "text-gray-600",
                )}
                style={{ fontFamily: "Alata, sans-serif" }}
              >
                Saved
              </Link>
              <Link
                to="/about"
                className={cn(
                  "text-lg font-medium transition-colors hover:text-orange-600",
                  isActive("/about") ? "text-orange-600" : "text-gray-600",
                )}
                style={{ fontFamily: "Alata, sans-serif" }}
              >
                About
              </Link>
            </nav>

            {/* User Icon */}
            <Link to="/account">
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
          <nav className="md:hidden flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
            <Link
              to="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-orange-600",
                isActive("/") ? "text-orange-600" : "text-gray-600",
              )}
              style={{ fontFamily: "Alata, sans-serif" }}
            >
              Dictionary
            </Link>
            <Link
              to="/saved"
              className={cn(
                "text-sm font-medium transition-colors hover:text-orange-600",
                isActive("/saved") ? "text-orange-600" : "text-gray-600",
              )}
              style={{ fontFamily: "Alata, sans-serif" }}
            >
              Saved
            </Link>
            <Link
              to="/about"
              className={cn(
                "text-sm font-medium transition-colors hover:text-orange-600",
                isActive("/about") ? "text-orange-600" : "text-gray-600",
              )}
              style={{ fontFamily: "Alata, sans-serif" }}
            >
              About
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 text-blue-300">
        {children}
      </main>
    </div>
  );
}
