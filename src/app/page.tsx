"use client";

import Link from "next/link";
import NextLayout from "@/components/NextLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Star, Volume2, Search, Globe, Users, Award } from "lucide-react";

export default function HomePage() {
  return (
    <NextLayout>
        
        <div className="max-w-6xl mx-auto flex flex-col">
          {/* Hero Section */}
          <div className="text-center py-16 lg:py-24">
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6">
              Welcome to{" "}
              <span className="text-yellow-500">Lets Study</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your bridge between Setswana and English languages. Discover, learn, and master both languages with our comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/meetups">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-4 text-lg rounded-lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explore Meetups
            </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="border-2 border-gray-300 hover:border-yellow-500 px-8 py-4 text-lg rounded-lg">
                  Learn More
            </Button>
              </Link>
                </div>
              </div>

          {/* Features Section */}
          <div className="py-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-12">
              Why Choose Lets Study?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-yellow-600" />
                </div>
                  <CardTitle className="text-xl">Comprehensive Search</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">
                    Connect with other language learners and join study groups. Find your perfect learning community.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Volume2 className="w-8 h-8 text-yellow-600" />
                </div>
                  <CardTitle className="text-xl">Audio Pronunciation</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">
                    Listen to correct pronunciations with our integrated audio system. Perfect your accent and speaking skills.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-yellow-600" />
                          </div>
                  <CardTitle className="text-xl">Save Favorites</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">
                    Save your favorite confessions and experiences. Build your personal collection.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-yellow-600" />
                          </div>
                  <CardTitle className="text-xl">Bilingual Support</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">
                    Seamlessly switch between English to Setswana and Setswana to English translations.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-yellow-600" />
                        </div>
                  <CardTitle className="text-xl">Community Driven</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">
                    Built for the community, by the community. Continuously updated with new features and improvements.
                  </p>
                      </CardContent>
                    </Card>

              <Card className="border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-yellow-600" />
                  </div>
                  <CardTitle className="text-xl">Premium Features</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">
                    Unlock advanced features with our premium subscription. Enhanced search, unlimited saves, and more.
                  </p>
                </CardContent>
              </Card>
                    </div>
                </div>

          {/* CTA Section */}
          <div className="py-16 text-center">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 lg:p-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already improving their language skills with Lets Study.
              </p>
              <Link href="/meetups">
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg rounded-lg">
                  Start Exploring Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
    </NextLayout>
  );
}
