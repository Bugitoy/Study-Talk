"use client";

import React, { useState, useEffect } from "react";
import NextLayout from "@/components/NextLayout";
import { User as UserIcon, ThumbsUp, ThumbsDown, MessageCircle, Bookmark, Plus, Flag } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useInfiniteConfessions, Confession } from "@/hooks/useInfiniteConfessions";
import { useSavedConfessions } from "@/hooks/useSavedConfessions";
import { useUniversities } from "@/hooks/useUniversities";
import { useRouter } from "next/navigation";
import { InfiniteScrollContainer } from "@/components/InfiniteScrollContainer";
import { ConfessionListSkeleton } from "@/components/ConfessionSkeleton";
import { CommentSection } from "@/components/CommentSection";
import { useToast } from '@/hooks/use-toast';
import ShareButton from "@/components/ShareButton";
import { UserReputationBadge } from '@/components/UserReputationBadge';

const tabs = [
  { key: "posts", label: "Posts" },
  { key: "hottest", label: "Hottest" },
  { key: "universities", label: "Universities" },
  { key: "saved", label: "Saved" },
];

export default function ConfessionsPage() {
  const { user } = useKindeBrowserClient();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<string>("posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [openCommentSections, setOpenCommentSections] = useState<Set<string>>(new Set());
  const [userUniversity, setUserUniversity] = useState<string | null>(null);
  
  // Report functionality
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportType, setReportType] = useState('INAPPROPRIATE_BEHAVIOR');
  const [selectedConfessionId, setSelectedConfessionId] = useState('');
  
  const reportTypes = [
    { value: 'INAPPROPRIATE_BEHAVIOR', label: 'Inappropriate Behavior' },
    { value: 'HARASSMENT', label: 'Harassment' },
    { value: 'SPAM', label: 'Spam' },
    { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content' },
    { value: 'OTHER', label: 'Other' },
  ];

  // Hook configurations based on active tab
  const sortBy = activeTab === "hottest" ? "hot" : "recent";
  
  const { 
    confessions, 
    loading: confessionsLoading,
    loadingMore,
    hasMore,
    newPostsCount,
    shouldShowNewPostsBanner,
    loadMore,
    loadNewPosts,
    createConfession,
    voteOnConfession,
    refresh: refreshConfessions,
    updateCommentCount,
  } = useInfiniteConfessions({ 
    sortBy, 
    search: searchQuery,
    autoRefresh: true,
    userId: user?.id
  });
  
  const { 
    savedConfessions, 
    loading: savedLoading,
    toggleSave,
    isConfessionSaved 
  } = useSavedConfessions(user?.id);
  
  const { universities, loading: universitiesLoading } = useUniversities();

  // Fetch user's university information
  useEffect(() => {
    const fetchUserUniversity = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/user?userId=${user.id}`);
        if (response.ok) {
          const userData = await response.json();
          setUserUniversity(userData.university);
        }
      } catch (error) {
        console.error('Failed to fetch user university:', error);
      }
    };

    fetchUserUniversity();
  }, [user?.id]);

  const handleCreatePost = async () => {
    if (!user?.id || !newTitle.trim() || !newBody.trim()) return;
    
    // Client-side validation
    if (newTitle.trim().length > 200) {
      toast({
        title: "Error",
        description: "Title too long (max 200 characters)",
        variant: "destructive",
      });
      return;
    }
    
    if (newBody.trim().length > 5000) {
      toast({
        title: "Error",
        description: "Content too long (max 5000 characters)",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createConfession({
        title: newTitle.trim(),
        content: newBody.trim(),
        authorId: user.id,
        university: userUniversity || undefined,
        isAnonymous,
      });
      
      // Reset form and close modal
      setNewTitle("");
      setNewBody("");
      setIsAnonymous(true);
      setIsPostModalOpen(false);
      
      // Refresh confessions
      refreshConfessions();
      
      toast({
        title: "Success",
        description: "Confession posted successfully!",
      });
    } catch (error) {
      console.error("Failed to create confession:", error);
      toast({
        title: "Error",
        description: "Failed to create confession. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleVote = async (confessionId: string, voteType: 'BELIEVE' | 'DOUBT') => {
    if (!user?.id) return;
    
    try {
      await voteOnConfession(confessionId, voteType);
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };
  
  const handleToggleSave = async (confessionId: string) => {
    if (!user?.id) return;
    
    try {
      await toggleSave(confessionId);
    } catch (error) {
      console.error("Failed to toggle save:", error);
    }
  };
  
  const handleReport = async () => {
    if (!user?.id || !selectedConfessionId || !reportReason.trim()) {
      toast({
        title: "Error",
        description: "Please fill all fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const res = await fetch(`/api/confessions/${selectedConfessionId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reporterId: user.id, 
          reason: reportReason, 
          reportType 
        }),
      });
      
      if (res.ok) {
        toast({
          title: "Success",
          description: "Report submitted successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit report.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to submit report.",
        variant: "destructive",
      });
    }
    
    setShowReportDialog(false);
    setReportReason('');
    setSelectedConfessionId('');
    setReportType('INAPPROPRIATE_BEHAVIOR');
  };

  const toggleCommentSection = (confessionId: string) => {
    setOpenCommentSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(confessionId)) {
        newSet.delete(confessionId);
      } else {
        newSet.add(confessionId);
      }
      return newSet;
    });
  };
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString();
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const renderPosts = (posts: Confession[]) => (
    <div className="flex flex-col gap-4 sm:gap-6 mt-4 sm:mt-6">
      {posts.map((post, index) => (
          <div
            key={post.id}
            className="rounded-[12px] border border-gray-300 bg-white p-3 sm:p-4 lg:p-6 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.01] relative"
            style={{ 
              animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
            }}
          >
            {/* Shield Badge - Top Right Corner */}
            {!post.isAnonymous && (
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
                <UserReputationBadge 
                  userId={post.authorId} 
                  variant="shield"
                  className="hover:scale-110 transition-transform duration-200"
                />
              </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              {post.author?.image && !post.isAnonymous ? (
                <Image
                  src={post.author.image}
                  alt={post.author.name || "User"}
                  width={40}
                  height={40}
                  className="rounded-[8px] object-cover w-8 h-8 sm:w-10 sm:h-10"
                />
              ) : (
                <span className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-200 rounded-[8px]">
                  <UserIcon className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
                </span>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800 text-sm sm:text-base">
                    {post.isAnonymous ? "Anonymous" : (post.author?.name || "Unknown")}
                  </p>
                  {!post.isAnonymous && (
                    <UserReputationBadge userId={post.authorId} />
                  )}
                </div>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {post.university?.name || (post.author as any)?.university || "Unknown University"}
                </p>
              </div>
            </div>
            
            {/* Title */}
            <h3 
              className="font-semibold text-base sm:text-lg text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => router.push(`/meetups/confessions/post/${post.id}`)}
            >
              {post.title}
            </h3>
            
            {/* Content */}
            <p className="text-gray-700 whitespace-pre-line mb-3 sm:mb-4 line-clamp-3 lg:line-clamp-none text-sm sm:text-base">
              {post.content}
            </p>
            
            {/* Combined Stats & Actions */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4">
              {/* Action Buttons */}
              <div className="flex items-center justify-start flex-1 gap-3 sm:gap-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!user) {
                      toast({ title: 'Login Required', description: 'Please log in to vote.', variant: 'destructive' });
                      return;
                    }
                    handleVote(post.id, 'BELIEVE');
                  }}
                  disabled={!user}
                  className={`flex items-center gap-1 transition-colors ${
                    post.userVote === 'BELIEVE' 
                      ? 'text-green-600 font-semibold' 
                      : 'text-gray-600 hover:text-green-600'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={`${post.believeCount} Believers`}
                >
                  <ThumbsUp className={`w-4 h-4 sm:w-5 sm:h-5 ${post.userVote === 'BELIEVE' ? 'fill-current' : ''}`} />
                  <span className="inline">{post.believeCount}</span>
                  <span className="hidden md:inline"> Believers</span>
                </button>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!user) {
                      toast({ title: 'Login Required', description: 'Please log in to vote.', variant: 'destructive' });
                      return;
                    }
                    handleVote(post.id, 'DOUBT');
                  }}
                  disabled={!user}
                  className={`flex items-center gap-1 transition-colors ${
                    post.userVote === 'DOUBT' 
                      ? 'text-red-600 font-semibold' 
                      : 'text-gray-600 hover:text-red-600'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={`${post.doubtCount} Non Believers`}
                >
                  <ThumbsDown className={`w-4 h-4 sm:w-5 sm:h-5 ${post.userVote === 'DOUBT' ? 'fill-current' : ''}`} />
                  <span className="inline">{post.doubtCount}</span>
                  <span className="hidden md:inline"> Non Believers</span>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCommentSection(post.id);
                  }}
                  className={`flex items-center gap-1 transition-colors ${
                    openCommentSections.has(post.id)
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                  title={`${post.commentCount} Comments`}
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="inline">{post.commentCount}</span>
                  <span className="hidden md:inline"> Comments</span>
                </button>
                
                <ShareButton 
                  confessionId={post.id}
                  confessionTitle={post.title}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 cursor-pointer hover:text-gray-800"
                />
                
                <div
                  className={`flex items-center gap-1 cursor-pointer hover:text-gray-800 ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!user) {
                      toast({ title: 'Login Required', description: 'Please log in to save posts.', variant: 'destructive' });
                      return;
                    }
                    handleToggleSave(post.id);
                  }}
                  role="button"
                  tabIndex={0}
                  title={isConfessionSaved(post.id) ? 'Saved' : 'Save'}
                >
                  <Bookmark
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${isConfessionSaved(post.id) ? 'text-yellow-400' : ''}`}
                    fill={isConfessionSaved(post.id) ? '#FACC15' : 'none'}
                  />
                  <span className="hidden md:inline">{isConfessionSaved(post.id) ? 'Saved' : 'Save'}</span>
                </div>
                
                <div
                  className={`flex items-center gap-1 cursor-pointer hover:text-red-600 ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!user) {
                      toast({ title: 'Login Required', description: 'Please log in to report posts.', variant: 'destructive' });
                      return;
                    }
                    setSelectedConfessionId(post.id);
                    setShowReportDialog(true);
                  }}
                  role="button"
                  tabIndex={0}
                  title="Report"
                >
                  <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden md:inline">Report</span>
                </div>
              </div>
              
              {/* Timestamp */}
              <div className="text-gray-500 text-xs sm:text-sm">
                {formatTimeAgo(post.createdAt)}
              </div>
            </div>
            
            {openCommentSections.has(post.id) && (
              <CommentSection 
                confessionId={post.id}
                isVisible={openCommentSections.has(post.id)}
                onClose={() => toggleCommentSection(post.id)}
                updateCommentCount={updateCommentCount}
                user={user}
              />
            )}
          </div>
        ))}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "posts":
        return (
          <InfiniteScrollContainer
            hasMore={hasMore}
            loadMore={loadMore}
            loading={confessionsLoading}
            loadingMore={loadingMore}
            className="mt-6"
          >
            {confessionsLoading ? (
              <ConfessionListSkeleton count={5} />
            ) : (
              renderPosts(confessions)
            )}
          </InfiniteScrollContainer>
        );
        
      case "hottest":
        return (
          <InfiniteScrollContainer
            hasMore={hasMore}
            loadMore={loadMore}
            loading={confessionsLoading}
            loadingMore={loadingMore}
            className="mt-6"
          >
            {confessionsLoading ? (
              <ConfessionListSkeleton count={5} />
            ) : (
              renderPosts(confessions)
            )}
          </InfiniteScrollContainer>
        );
        
      case "universities":
        if (universitiesLoading) {
          return <div className="mt-6 text-center text-gray-600">Loading universities...</div>;
        }
        
        const filteredUniversities = universities.filter(uni =>
          uni.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        return (
          <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredUniversities.map((uni) => (
              <div
                key={uni.id}
                className="rounded-[12px] border border-gray-300 bg-white p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md h-48 sm:h-64 lg:h-72 flex flex-col cursor-pointer"
                onClick={() => router.push(`/meetups/confessions/university/${uni.id}?name=${encodeURIComponent(uni.name)}`)}
              >
                <div className="mb-[2rem] sm:mb-[3rem]">
                  <h3 className="font-semibold text-gray-800 text-base sm:text-lg lg:text-xl">
                    {uni.name}
                  </h3>
                </div>
                
                <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                    <div>{formatNumber(uni.confessionCount)} confessions</div>
                    <div>{formatNumber(uni.studentCount)} students</div>
                    <div>{formatNumber(uni.totalVotes)} votes</div>
                  </div>
                </div>
            ))}
          </div>
        );
        
      case "saved":
        if (savedLoading) {
          return <div className="mt-6 text-center text-gray-600">Loading saved confessions...</div>;
        }
        return savedConfessions.length ? renderPosts(savedConfessions) : (
          <p className="mt-6 text-center text-gray-600">No saved confessions yet.</p>
        );
        
      default:
        return null;
    }
  };

  return (
    <NextLayout>
      <div className="max-w-5xl mx-auto w-full py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-extrabold text-gray-800 mb-4 sm:mb-6 text-center">
            Confessions
          </h1>
          {/* New posts banner - DISABLED */}
          {/* {shouldShowNewPostsBanner && (
            <NewPostsBanner 
              newPostsCount={newPostsCount}
              onLoadNewPosts={loadNewPosts}
            />
          )} */}
        </div>
        {/* Tab Bar */}
        <div className="flex gap-6 sm:gap-6 lg:gap-[4rem] border-b border-gray-300 mb-4 overflow-x-auto justify-center items-center">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                "py-2 text-sm sm:text-base lg:text-lg font-medium whitespace-nowrap transition-colors",
                activeTab === tab.key ? "border-b-4 border-black text-gray-900" : "text-gray-500 hover:text-gray-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Search Bar + Make Post Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "universities"
                ? "Search for a university"
                : "Search for a post"
            }
            className="w-full sm:flex-1 min-w-[200px] px-3 sm:px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-base sm:text-lg shadow-sm transition-colors"
          />
                      <Button
              className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-[12px] px-3 sm:px-4 py-2 font-semibold transition-colors text-sm sm:text-base ${
                user 
                  ? 'bg-yellow-300 text-gray-800 hover:bg-yellow-400' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={() => {
                if (!user) {
                  toast({ title: 'Login Required', description: 'Please log in to create a post.', variant: 'destructive' });
                  return;
                }
                setIsPostModalOpen(true);
              }}
              disabled={!user}
            >
              <Plus className="w-4 h-4 sm:h-8" />
              Make a post
            </Button>
        </div>
        {/* Content */}
        {renderContent()}

        {/* Post Creation Modal */}
        <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
          <DialogContent className="backdrop-blur-md bg-white/90 rounded-[12px] max-w-[95vw] sm:max-w-2xl mx-auto p-4 sm:p-6">
            <DialogHeader className="mb-4 sm:mb-6">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center">Create a confession</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4 mt-2 sm:mt-4">
              <div>
              <Input
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                  className="rounded-[8px] text-sm sm:text-base h-10 sm:h-12"
                  maxLength={200}
              />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {newTitle.length}/200 characters
                </div>
              </div>
              <div>
              <Textarea
                placeholder="Write your confession..."
                  rows={4}
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                  className="rounded-[8px] text-sm sm:text-base resize-none"
                  maxLength={5000}
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {newBody.length}/5000 characters
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 pt-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded w-4 h-4 sm:w-5 sm:h-5"
                />
                <label htmlFor="anonymous" className="text-xs sm:text-sm text-gray-600 cursor-pointer">
                  Post anonymously
                </label>
              </div>
            </div>
            <DialogFooter className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
              <Button
                variant="outline"
                className="rounded-[8px] w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base"
                onClick={() => setIsPostModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-yellow-300 hover:bg-yellow-400 text-gray-800 rounded-[8px] w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base"
                onClick={handleCreatePost}
                disabled={!newTitle.trim() || !newBody.trim()}
              >
                Post
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report Dialog */}
        {showReportDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md shadow-lg">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Report Confession</h2>
              <div className="mb-4">
                <label className="block mb-2 text-gray-800 font-medium">Type of Report</label>
                <select
                  className="w-full border border-gray-300 rounded p-2 text-black"
                  value={reportType}
                  onChange={e => setReportType(e.target.value)}
                >
                  {reportTypes.map(rt => (
                    <option key={rt.value} value={rt.value}>{rt.label}</option>
                  ))}
                </select>
              </div>
              <textarea
                className="w-full border border-gray-300 rounded p-2 mb-4 text-black"
                rows={4}
                placeholder="Describe the issue..."
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
              />
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-black w-full sm:w-auto"
                  onClick={() => {
                    setShowReportDialog(false);
                    setReportReason('');
                    setSelectedConfessionId('');
                    setReportType('INAPPROPRIATE_BEHAVIOR');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full sm:w-auto"
                  onClick={handleReport}
                  disabled={!reportReason.trim()}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </NextLayout>
  );
}
