"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Clock, 
  Trophy, 
  MessageSquare, 
  Brain, 
  Video, 
  Zap,
  BookOpen,
  Sparkles
} from "lucide-react";
import NextLayout from "@/components/NextLayout";

export default function HomePage() {
  return (
    <NextLayout>
      {/* Hero Section */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm">
              <Zap className="w-4 h-4 mr-2" />
              Join the Study Revolution
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Study Smarter,{" "}
              <span className="text-orange-300">Connect Better</span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join online study groups, track your progress, compete with peers, and connect with students worldwide. 
              Your ultimate platform for collaborative learning.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/meetups">
                <Button size="lg" className="text-lg px-8 py-4 bg-orange-200 hover:bg-orange-300">
                  <Users className="w-5 h-5 mr-2" />
                  Start Studying Now
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-orange-50/30 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-t-[50px]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              From study groups to competitions, Study-Talk has everything to make your learning journey engaging and effective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Study Groups */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-bold">Study Groups</CardTitle>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <CardDescription>
                  Join live study sessions with students worldwide. Share knowledge, ask questions, and learn together in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Live video study sessions
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Real-time collaboration
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Topic-based groups
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Study Tracking */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-bold">Study Tracking</CardTitle>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <CardDescription>
                  Monitor your study sessions with detailed analytics. Track progress, set goals, and see your improvement over time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Session duration tracking
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Progress analytics
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Study streak monitoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Rankings & Leaderboards */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-bold">Rankings & Leaderboards</CardTitle>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Trophy className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <CardDescription>
                  Compete with peers and climb the leaderboards. See how you rank against other students globally.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Global study rankings
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Weekly challenges
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Achievement badges
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Student Confessions */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-bold">Student Confessions</CardTitle>
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                    <MessageSquare className="w-6 h-6 text-pink-600" />
                  </div>
                </div>
                <CardDescription>
                  Read and share anonymous confessions from students worldwide. Connect through shared experiences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Anonymous sharing
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Community support
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Trending confessions
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Quiz Competitions */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-bold">Quiz Competitions</CardTitle>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <Brain className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <CardDescription>
                  Test your knowledge in exciting quiz competitions. Challenge friends and compete for the top spot.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Live quiz battles
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Multiple subjects
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Real-time scoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Random Chat */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-bold">Random Chat</CardTitle>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <Video className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <CardDescription>
                  Connect with random students worldwide through video chat. Make new friends and practice languages.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Video conversations
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Global connections
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Language practice
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-orange-300 mb-2">100+</div>
              <div className="text-gray-600">Early Adopters</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-orange-300 mb-2">500+</div>
              <div className="text-gray-600">Study Hours</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-orange-300 mb-2">25+</div>
              <div className="text-gray-600">Countries</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-orange-300 mb-2">1K+</div>
              <div className="text-gray-600">Messages Shared</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-orange-300 to-orange-400 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Study Experience?
          </h2>
          <p className="text-lg sm:text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Be part of our growing community of students who are studying smarter and connecting better with Study-Talk.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/meetups">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                <BookOpen className="w-5 h-5 mr-2" />
                Start Your Journey
              </Button>
            </Link>
                <Link href="/pricing">
                <Button size="lg" className="text-lg px-8 py-4 relative overflow-hidden group bg-gradient-to-r from-thanodi-yellow to-thanodi-peach hover:from-thanodi-peach hover:to-thanodi-yellow text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <span className="relative z-10 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    View Plans
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>
          </div>
        </div>
      </section>
    </NextLayout>
  );
}
