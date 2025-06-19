"use client";

import NextLayout from "@/components/NextLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X, User, Mail, Calendar, CreditCard, Star } from "lucide-react";

export default function AccountPage() {
  const userInfo = {
    email: "user@example.com",
    username: "thanodi_user",
    subscriptionType: "Premium",
    customerSince: "January 2024",
    nextBillingDate: "March 15, 2024",
  };

  return (
    <NextLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account</h1>
          <p className="text-gray-600">
            Manage your Thanodi account and subscription
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl border border-gray-200 shadow-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">
                    Your account details:
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-gray-600">Click here to edit your info</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email:
                    </Label>
                    <div className="mt-1 relative">
                      <Input
                        id="email"
                        type="email"
                        value={userInfo.email}
                        readOnly
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="username"
                      className="text-sm font-medium text-gray-700"
                    >
                      Username:
                    </Label>
                    <div className="mt-1 relative">
                      <Input
                        id="username"
                        value={userInfo.username}
                        readOnly
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                      <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="subscription"
                      className="text-sm font-medium text-gray-700"
                    >
                      Subscription type:
                    </Label>
                    <div className="mt-1 relative">
                      <Input
                        id="subscription"
                        value={userInfo.subscriptionType}
                        readOnly
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                      <Star className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-yellow-500" />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="customer-since"
                      className="text-sm font-medium text-gray-700"
                    >
                      Customer since:
                    </Label>
                    <div className="mt-1 relative">
                      <Input
                        id="customer-since"
                        value={userInfo.customerSince}
                        readOnly
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="billing-date"
                      className="text-sm font-medium text-gray-700"
                    >
                      Next billing date:
                    </Label>
                    <div className="mt-1 relative">
                      <Input
                        id="billing-date"
                        value={userInfo.nextBillingDate}
                        readOnly
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                      <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Button variant="destructive" className="rounded-full px-8">
                    Cancel subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Picture Section */}
          <div>
            <Card className="rounded-2xl border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <div
                    className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundImage:
                        "linear-gradient(to bottom right, #FFECD2, #FFDECA)",
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        backgroundImage:
                          "linear-gradient(to bottom right, #F7D379, #F9B288)",
                      }}
                    >
                      <User className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">
                    Profile Picture
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a photo to personalize your account
                  </p>

                  <Button variant="outline" className="rounded-full">
                    Upload Photo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </NextLayout>
  );
}
