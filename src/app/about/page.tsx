"use client";

import NextLayout from "@/components/NextLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Clock, 
  Trophy, 
  MessageSquare, 
  Brain, 
  Video, 
  Target,
  Zap,
  Heart,
  Star,
  BookOpen,
  Globe,
  TrendingUp,
  Award,
  Lightbulb
} from "lucide-react";

export default function AboutPage() {
  return (
    <NextLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm">
            <Zap className="w-4 h-4 mr-2" />
            Our Mission
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            About Study-Talk
          </h1>
          <h2 className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Revolutionizing how students learn, connect, and grow together in the digital age.
          </h2>
          </div>

        {/* Mission Section */}
        <section className="mb-16 sm:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h3>
              <div className="prose text-gray-700 leading-relaxed space-y-4">
                <p>
                  Study-Talk was born from a simple yet powerful idea: learning is better together. 
                  We believe that every student deserves access to a global community of learners, 
                  where they can collaborate, compete, and grow together.
                </p>
                <p>
                  Whether you're studying for exams, working on projects, or just want to connect 
                  with like-minded students, Study-Talk provides the tools and community you need 
                  to succeed in your academic journey.
                </p>
                <p>
                  Our platform combines the best of social learning, gamification, and technology 
                  to create an engaging and effective study experience that keeps students motivated 
                  and connected.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-8">
              <div className="text-center">
                <Globe className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-gray-900 mb-2">Global Community</h4>
                <p className="text-gray-600">
                  Connect with students from over 100 countries, sharing knowledge and experiences across borders.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Makes Us Special */}
        <section className="mb-16 sm:mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              What makes Study-Talk special
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We've built a comprehensive platform that addresses every aspect of modern learning and student life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Collaborative Learning */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-bold">Collaborative Learning</CardTitle>
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
                    Topic-based groups
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    Real-time collaboration
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Progress Tracking */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-bold">Progress Tracking</CardTitle>
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

            {/* Gamified Learning */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-bold">Gamified Learning</CardTitle>
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

            {/* Student Community */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-bold">Student Community</CardTitle>
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

            {/* Knowledge Testing */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-bold">Knowledge Testing</CardTitle>
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

            {/* Global Connections */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-bold">Global Connections</CardTitle>
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
        </section>

        {/* Our Values */}
        <section className="mb-16 sm:mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Our Values
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do at Study-Talk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <Heart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-900 mb-2">Community First</h4>
              <p className="text-gray-600">
                We believe in the power of community. Every feature is designed to bring students together and foster meaningful connections.
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-900 mb-2">Results Driven</h4>
              <p className="text-gray-600">
                We focus on measurable outcomes. Our tools help you track progress and achieve your academic goals.
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <Lightbulb className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-900 mb-2">Innovation</h4>
              <p className="text-gray-600">
                We constantly innovate to provide the best learning experience, combining technology with proven educational methods.
              </p>
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="mb-16 sm:mb-20">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 sm:p-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Our Impact
              </h3>
              <p className="text-orange-100 text-lg">
                See how Study-Talk is transforming education worldwide.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">100+</div>
                <div className="text-orange-100">Early Adopters</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">500+</div>
                <div className="text-orange-100">Study Hours</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">25+</div>
                <div className="text-orange-100">Countries</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">1K+</div>
                <div className="text-orange-100">Messages Shared</div>
              </div>
            </div>
          </div>
        </section>

        {/* Join Us */}
        <section className="text-center">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 sm:p-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Join the Study-Talk Community
              </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Ready to transform your learning experience? Be part of our growing community of students who are studying smarter and connecting better.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/meetups" className="inline-block">
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                  <BookOpen className="w-5 h-5 inline mr-2" />
                  Start Studying Now
                </button>
              </a>
              <a href="/pricing" className="inline-block">
                <button className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-3 rounded-lg font-medium transition-colors">
                  View Plans
                </button>
              </a>
            </div>
          </div>
        </section>
      </div>
    </NextLayout>
  );
}
