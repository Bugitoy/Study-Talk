"use client";

import { useKindeBrowserClient, LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import NextLayout from "@/components/NextLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, User, Mail, Calendar, CreditCard, Star, Edit3, AlertTriangle } from "lucide-react";
import Loader from "@/components/Loader";
import { Plan } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { UniversityAutocomplete } from "@/components/ui/university-autocomplete";
import { useState } from "react";

interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  plan: Plan;
  customerId: string | null;
  university: string | null;
  universityVerifiedAt: string | null;
  universityChangeCount: number;
  createdAt: string;
  subscription: {
    id: string;
    plan: Plan;
    period: "monthly" | "yearly";
    startDate: string;
    endDate: string;
  } | null;
}

export default function AccountPage() {
  const { user } = useKindeBrowserClient();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // University editing state
  const [isUniversityDialogOpen, setIsUniversityDialogOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState("");

  const { data: userInfo, isLoading, error } = useQuery<UserInfo>({
    queryKey: ["user-info", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      const response = await fetch(`/api/user?userId=${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch user info");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const createPortalSessionMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create portal session");
      }
      
      const data = await response.json();
      return data.url;
    },
    onSuccess: (url) => {
      window.open(url, "_blank");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal",
        variant: "destructive",
      });
    },
  });

  const updateUniversityMutation = useMutation({
    mutationFn: async (university: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      const response = await fetch("/api/user/university", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, university }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update university");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["user-info", user?.id] });
      setIsUniversityDialogOpen(false);
      setSelectedUniversity("");
      toast({
        title: "Success",
        description: "University updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update university",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSubscriptionType = () => {
    if (!userInfo?.subscription) return "Free";
    return userInfo.subscription.plan === "premium" ? "Premium" : "Free";
  };

  const getNextBillingDate = () => {
    if (!userInfo?.subscription) return "N/A";
    return formatDate(userInfo.subscription.endDate);
  };

  const handleUniversityEdit = () => {
    setSelectedUniversity(userInfo?.university || "");
    setIsUniversityDialogOpen(true);
  };

  const handleUniversityUpdate = () => {
    if (!selectedUniversity.trim()) {
      toast({
        title: "Error",
        description: "Please select a university",
        variant: "destructive",
      });
      return;
    }
    updateUniversityMutation.mutate(selectedUniversity.trim());
  };

  const canChangeUniversity = () => {
    if (!userInfo) return false;
    
    // If no university set yet, allow setting
    if (!userInfo.university) return true;
    
    // Check if user has reached the change limit
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    if (userInfo.universityChangeCount >= 2 && 
        userInfo.universityVerifiedAt && 
        new Date(userInfo.universityVerifiedAt) > oneYearAgo) {
      return false;
    }
    
    return true;
  };

  const getUniversityChangeWarning = () => {
    if (!userInfo?.university) {
      return "Set your university. Note that you can only change it once for a long time.";
    }
    
    const changesLeft = Math.max(0, 2 - userInfo.universityChangeCount);
    return `You have ${changesLeft} university change${changesLeft !== 1 ? 's' : ''} remaining this year. Choose carefully.`;
  };

  const isAuthenticated = !!user?.id;
  const isSubscribed = userInfo?.plan === "premium" && userInfo?.customerId;
  const isValidUser = isAuthenticated && userInfo && !error;

  const handleCancelSubscription = () => {
    createPortalSessionMutation.mutate();
  };

  if (isLoading) {
    return (
      <NextLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Account</h1>
            <p className="text-gray-600">
              Manage your Lets Study account and subscription
            </p>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader fullScreen={false} className="w-8 h-8 text-orange-500" />
            <span className="ml-2 text-gray-600">Loading account information...</span>
          </div>
        </div>
      </NextLayout>
    );
  }



  return (
    <NextLayout>
      <div className="max-w-4xl mx-auto">
        <div className={`mb-8 ${!isAuthenticated ? 'text-center' : ''}`}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account</h1>
          <p className="text-gray-600">
            Manage your Lets Study account and subscription
          </p>
        </div>

        <div className={`grid grid-cols-1 gap-8 ${isAuthenticated ? 'lg:grid-cols-3' : 'lg:grid-cols-1 lg:max-w-2xl lg:mx-auto'}`}>
          {/* Profile Section */}
          <div className={isAuthenticated ? "lg:col-span-2" : ""}>
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
                        value={isValidUser ? userInfo.email : ""}
                        readOnly
                        className="bg-gray-50 border-gray-200 text-gray-900"
                        placeholder={!isValidUser ? "Not available" : ""}
                      />
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="username"
                      className="text-sm font-medium text-gray-700"
                    >
                      Name:
                    </Label>
                    <div className="mt-1 relative">
                      <Input
                        id="username"
                        value={isValidUser ? (userInfo.name || "Not provided") : ""}
                        readOnly
                        className="bg-gray-50 border-gray-200 text-gray-900"
                        placeholder={!isValidUser ? "Not available" : ""}
                      />
                      <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="university"
                      className="text-sm font-medium text-gray-700"
                    >
                      University:
                    </Label>
                    <div className="mt-1 relative">
                      <Input
                        id="university"
                        value={isValidUser ? (userInfo.university ?? "Not provided") : "Not available"}
                        readOnly
                        className="bg-gray-50 border-gray-200 text-gray-900"
                        placeholder={!isValidUser ? "Not available" : ""}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        {isValidUser && canChangeUniversity() && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUniversityEdit}
                            className="h-8 px-3 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600"
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        )}
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
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
                        value={isValidUser ? getSubscriptionType() : ""}
                        readOnly
                        className="bg-gray-50 border-gray-200 text-gray-900"
                        placeholder={!isValidUser ? "Not available" : ""}
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
                        value={isValidUser ? formatDate(userInfo.createdAt) : ""}
                        readOnly
                        className="bg-gray-50 border-gray-200 text-gray-900"
                        placeholder={!isValidUser ? "Not available" : ""}
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
                        value={isValidUser ? getNextBillingDate() : ""}
                        readOnly
                        className="bg-gray-50 border-gray-200 text-gray-900"
                        placeholder={!isValidUser ? "Not available" : ""}
                      />
                      <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>


                </div>

                <Separator />

                <div className="flex flex-wrap items-center gap-4">
                  {isValidUser && isSubscribed ? (
                    <>
                      <Button 
                        variant="destructive" 
                        className="rounded-full px-8"
                        onClick={handleCancelSubscription}
                        disabled={createPortalSessionMutation.isPending}
                      >
                        {createPortalSessionMutation.isPending ? (
                          <>
                            <Loader fullScreen={false} className="w-4 h-4 mr-2" />
                            Opening...
                          </>
                        ) : (
                          "Cancel subscription"
                        )}
                      </Button>
                      <LogoutLink>
                        <Button variant="outline" className="rounded-full px-8">
                          Logout
                        </Button>
                      </LogoutLink>
                    </>
                  ) : (
                    isAuthenticated ? (
                      <LogoutLink>
                        <Button variant="outline" className="rounded-full px-8">
                          Logout
                        </Button>
                      </LogoutLink>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">
                          Please sign in to manage your account
                        </p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Picture Section */}
          {isAuthenticated && (
          <div>
            <Card className="rounded-2xl border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="text-center">
                    {isValidUser && userInfo.image ? (
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden">
                        <img
                          src={userInfo.image}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                  <div
                    className="w-32 h-32 mx-auto rounded-full flex items-center justify-center"
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
                    )}

                </div>
              </CardContent>
            </Card>
          </div>
          )}
        </div>
      </div>

      {/* University Selection Dialog */}
      <Dialog open={isUniversityDialogOpen} onOpenChange={setIsUniversityDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              {userInfo?.university ? "Change University" : "Set University"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {getUniversityChangeWarning()}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="university-search" className="text-sm font-medium">
                  Search for your university
                </Label>
                <UniversityAutocomplete
                  value={selectedUniversity}
                  onSelect={setSelectedUniversity}
                  placeholder="Type to search universities..."
                  disabled={updateUniversityMutation.isPending}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUniversityDialogOpen(false)}
              disabled={updateUniversityMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUniversityUpdate}
              disabled={!selectedUniversity.trim() || updateUniversityMutation.isPending}
            >
              {updateUniversityMutation.isPending ? (
                <>
                  <Loader fullScreen={false} className="w-4 h-4 mr-2" />
                  Updating...
                </>
              ) : (
                userInfo?.university ? "Update University" : "Set University"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </NextLayout>
  );
}
