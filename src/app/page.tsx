"use client";

import Link from "next/link";
import NextLayout from "@/components/NextLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Star, Volume2, Search, Globe, Users, Award } from "lucide-react";

export default function HomePage() {
  return (
    <NextLayout>
        
        <div className="max-w-6xl mx-auto flex flex-col px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center py-8 sm:py-12 lg:py-16 xl:py-24">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6">
              Welcome to{" "}
              <span className="text-yellow-500">Lets Study</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Your bridge between Setswana and English languages. Discover, learn, and master both languages with our comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link href="/meetups" className="w-full sm:w-auto">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-lg w-full sm:w-auto">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Explore Meetups
                </Button>
              </Link>
              <Link href="/about" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="border-2 border-gray-300 hover:border-yellow-500 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-lg w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-8 sm:py-12 lg:py-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12 px-4">
              Why Choose Lets Study?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <Card className="border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Search className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Comprehensive Search</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-4 sm:px-6">
                  <p className="text-sm sm:text-base text-gray-600">
                    Connect with other language learners and join study groups. Find your perfect learning community.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Volume2 className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Audio Pronunciation</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-4 sm:px-6">
                  <p className="text-sm sm:text-base text-gray-600">
                    Listen to correct pronunciations with our integrated audio system. Perfect your accent and speaking skills.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Save Favorites</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-4 sm:px-6">
                  <p className="text-sm sm:text-base text-gray-600">
                    Save your favorite confessions and experiences. Build your personal collection.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Bilingual Support</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-4 sm:px-6">
                  <p className="text-sm sm:text-base text-gray-600">
                    Seamlessly switch between English to Setswana and Setswana to English translations.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Community Driven</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-4 sm:px-6">
                  <p className="text-sm sm:text-base text-gray-600">
                    Built for the community, by the community. Continuously updated with new features and improvements.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Award className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Premium Features</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-4 sm:px-6">
                  <p className="text-sm sm:text-base text-gray-600">
                    Unlock advanced features with our premium subscription. Enhanced search, unlimited saves, and more.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-8 sm:py-12 lg:py-16 text-center">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 mx-4 sm:mx-0">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-lg sm:text-xl text-gray-800 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                Join thousands of users who are already improving their language skills with Lets Study.
              </p>
              <Link href="/meetups" className="inline-block w-full sm:w-auto">
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-lg w-full sm:w-auto">
                  Start Exploring Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
    </NextLayout>
  );
}
