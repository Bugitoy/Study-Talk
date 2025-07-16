"use client";

import React, { useState } from "react";
import NextLayout from "@/components/NextLayout";
import { User as UserIcon, ThumbsUp, ThumbsDown, MessageCircle, Share2, Bookmark, Plus } from "lucide-react";
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
import { NewPostsBanner } from "@/components/NewPostsBanner";
import { ConfessionListSkeleton } from "@/components/ConfessionSkeleton";

const tabs = [
  { key: "posts", label: "Posts" },
  { key: "hottest", label: "Hottest Confessions" },
  { key: "universities", label: "Universities" },
  { key: "saved", label: "Saved" },
];

export default function ConfessionsPage() {
  const { user } = useKindeBrowserClient();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<string>("posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);

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
    incrementView,
    refresh: refreshConfessions
  } = useInfiniteConfessions({ 
    sortBy, 
    search: searchQuery,
    autoRefresh: true 
  });
  
  const { 
    savedConfessions, 
    loading: savedLoading,
    toggleSave,
    isConfessionSaved 
  } = useSavedConfessions(user?.id);
  
  const { universities, loading: universitiesLoading } = useUniversities();

  const handleCreatePost = async () => {
    if (!user?.id || !newTitle.trim() || !newBody.trim()) return;
    
    try {
      await createConfession({
        title: newTitle.trim(),
        content: newBody.trim(),
        authorId: user.id,
                 university: (user as any).university || undefined,
        isAnonymous,
      });
      
      // Reset form and close modal
      setNewTitle("");
      setNewBody("");
      setIsAnonymous(true);
      setIsPostModalOpen(false);
      
      // Refresh confessions
      refreshConfessions();
    } catch (error) {
      console.error("Failed to create confession:", error);
    }
  };
  
  const handleVote = async (confessionId: string, voteType: 'BELIEVE' | 'DOUBT') => {
    if (!user?.id) return;
    
    try {
      await voteOnConfession(confessionId, voteType, user.id);
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
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const renderPosts = (posts: Confession[]) => (
    <div className="flex flex-col gap-6 mt-6">
      {posts.map((post, index) => (
          <div
            key={post.id}
            className="rounded-[12px] border border-gray-300 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.01] lg:p-6"
            style={{ 
              animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
            }}
            onClick={() => incrementView(post.id)}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              {post.author?.image && !post.isAnonymous ? (
                <Image
                  src={post.author.image}
                  alt={post.author.name || "User"}
                  width={40}
                  height={40}
                  className="rounded-[8px] object-cover"
                />
              ) : (
                <span className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-[8px]">
                  <UserIcon className="w-6 h-6 text-gray-500" />
                </span>
              )}
              <div className="text-sm lg:text-base">
                <p className="font-semibold text-gray-800">
                  Posted by {post.isAnonymous ? "Anonymous" : (post.author?.name || "Unknown")}
                </p>
                <p className="text-gray-500">
                                     {post.university?.name || (post.author as any)?.university || "Unknown University"}
                </p>
              </div>
            </div>
            
            {/* Title */}
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{post.title}</h3>
            
            {/* Content */}
            <p className="text-gray-700 whitespace-pre-line mb-4 line-clamp-3 lg:line-clamp-none">
              {post.content}
            </p>
            
            {/* Combined Stats & Actions */}
            <div className="flex items-center flex-wrap gap-6 text-sm text-gray-600 mt-4">
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(post.id, 'BELIEVE');
                  }}
                  className="flex items-center gap-1 hover:text-green-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" /> {post.believeCount} Believers
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(post.id, 'DOUBT');
                  }}
                  className="flex items-center gap-1 hover:text-red-600 transition-colors"
                >
                  <ThumbsDown className="w-4 h-4" /> {post.doubtCount} Non Believers
                </button>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" /> {post.commentCount} Comments
              </div>
              <div className="flex items-center gap-1">
                👁️ {formatNumber(post.viewCount)} Views
              </div>
              <div className="flex items-center gap-1 cursor-pointer hover:text-gray-800">
                <Share2 className="w-4 h-4" /> Share
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer hover:text-gray-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSave(post.id);
                }}
              >
                <Bookmark
                  className={`w-4 h-4 ${isConfessionSaved(post.id) ? 'text-yellow-400' : ''}`}
                  fill={isConfessionSaved(post.id) ? '#FACC15' : 'none'}
                />
                {isConfessionSaved(post.id) ? 'Saved' : 'Save'}
              </div>
              <div className="ml-auto text-gray-500">
                {formatTimeAgo(post.createdAt)}
              </div>
            </div>
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
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((uni) => (
              <div
                key={uni.id}
                className="rounded-[12px] border border-gray-300 bg-white p-8 shadow-sm hover:shadow-md h-72 flex flex-col cursor-pointer"
                onClick={() => router.push(`/meetups/confessions/university/${uni.id}?name=${encodeURIComponent(uni.name)}`)}
              >
                <div className="mb-[3rem]">
                  <h3 className="font-semibold text-gray-800 text-lg lg:text-xl">
                    {uni.name}
                  </h3>
                </div>
                <div className="space-y-4 text-gray-600 text-sm">
                  <p>
                    {uni.confessionCount} confession{uni.confessionCount !== 1 ? "s" : ""}
                  </p>
                  <p>
                    {uni.studentCount} student{uni.studentCount !== 1 ? "s" : ""}
                  </p>
                  <p>
                    {formatNumber(uni.totalViews)} total views
                  </p>
                  <p>
                    {formatNumber(uni.totalVotes)} total votes
                  </p>
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
      <div className="max-w-5xl mx-auto w-full py-8 px-4">
        <div className="relative">
          <h1 className="text-8xl font-extrabold text-gray-800 mb-6 text-center">
            Confessions
          </h1>
          {/* New posts banner */}
          {shouldShowNewPostsBanner && (
            <NewPostsBanner 
              newPostsCount={newPostsCount}
              onLoadNewPosts={loadNewPosts}
            />
          )}
        </div>
        {/* Tab Bar */}
        <div className="flex gap-[4rem] border-b border-gray-300 mb-4 overflow-x-auto justify-center items-center">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                "py-2 text-lg font-medium whitespace-nowrap transition-colors",
                activeTab === tab.key ? "border-b-4 border-black text-gray-900" : "text-gray-500 hover:text-gray-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Search Bar + Make Post Button */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "universities"
                ? "Search for a university"
                : "Search for a post"
            }
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-lg shadow-sm transition-colors"
          />
          {user && (
            <button
            className="flex items-center gap-2 bg-yellow-300 rounded-[12px] px-4 py-2 font-semibold text-gray-800 hover:bg-yellow-400 transition-colors"
            onClick={() => setIsPostModalOpen(true)}
          >
            <Plus className="w-4 h-8" />
            Make a post
          </button>
          )}
        </div>
        {/* Content */}
        {renderContent()}

        {/* Post Creation Modal */}
        <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
          <DialogContent className="backdrop-blur-md bg-white/90 rounded-[12px] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Create a confession</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="rounded-[8px]"
              />
              <Textarea
                placeholder="Write your confession..."
                rows={6}
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                className="rounded-[8px]"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-600">
                  Post anonymously
                </label>
              </div>
            </div>
            <DialogFooter className="mt-6 flex justify-end gap-4">
              <Button
                variant="outline"
                className="rounded-[8px]"
                onClick={() => setIsPostModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-yellow-300 hover:bg-yellow-400 text-gray-800 rounded-[8px]"
                onClick={handleCreatePost}
                disabled={!newTitle.trim() || !newBody.trim()}
              >
                Post
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </NextLayout>
  );
}
