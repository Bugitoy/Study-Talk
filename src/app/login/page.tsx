"use client";

import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Clock, 
  Trophy, 
  MessageSquare, 
  Brain, 
  Video, 
  Zap,
  BookOpen,
  Sparkles,
  Mail,
  Lock,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: "linear-gradient(to bottom right, #FFECD2, #DCEAF7, #FFDECA)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Login Form */}
          <div className="space-y-8">
            <div className="text-center">
   
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Welcome Back
              </h1>

              <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm mt-2">
                <Zap className="w-4 h-4 mr-2" />
                Join the Study Revolution
              </Badge>
              
              <p className="text-lg text-gray-600 mb-8">
                Sign in to continue your learning journey with Study-Talk
              </p>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                <CardDescription>
                  Choose your preferred sign-in method
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <LoginLink>
                  <Button className="w-full bg-orange-200 hover:bg-orange-300 text-gray-900 py-6 text-lg font-medium">
                    <Mail className="w-5 h-5 mr-3" />
                    Continue with Google
                  </Button>
                </LoginLink>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>
                
                <RegisterLink>
                  <Button 
                    variant="outline"
                    className="w-full py-6 mt-3 text-lg font-medium border-2 hover:bg-gray-50"
                  >
                    <Lock className="w-5 h-5 mr-3" />
                    Create New Account
                  </Button>
                </RegisterLink>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-gray-500">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-orange-600 hover:text-orange-700 underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-orange-600 hover:text-orange-700 underline">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Right Side - Features */}
          <div className="hidden lg:block">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Everything You Need to Excel
                </h2>
                <p className="text-lg text-gray-600">
                  Join thousands of students already learning together
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Study Groups</h3>
                    <p className="text-sm text-gray-600">Join live study sessions with students worldwide</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Competitions</h3>
                    <p className="text-sm text-gray-600">Compete in quizzes and track your progress</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Confessions</h3>
                    <p className="text-sm text-gray-600">Share and read student confessions anonymously</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Smart Learning</h3>
                    <p className="text-sm text-gray-600">Track your study time and build streaks</p>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <Link href="/about">
                  <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                    Learn More About Study-Talk
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 