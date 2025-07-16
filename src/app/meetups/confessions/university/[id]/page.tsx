"use client";

import React, { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import NextLayout from "@/components/NextLayout";
import { ArrowLeft, User as UserIcon, ThumbsUp, ThumbsDown, MessageCircle, Share2, Bookmark } from "lucide-react";
import Image from "next/image";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useInfiniteConfessions, Confession } from "@/hooks/useInfiniteConfessions";
import { useSavedConfessions } from "@/hooks/useSavedConfessions";
import { InfiniteScrollContainer } from "@/components/InfiniteScrollContainer";
import { NewPostsBanner } from "@/components/NewPostsBanner";
import { ConfessionListSkeleton } from "@/components/ConfessionSkeleton";

export default function UniversityConfessionsPage() {
  const { user } = useKindeBrowserClient();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const universityId = params.id as string;
  const universityName = searchParams.get('name') || 'University';
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'recent' | 'hot'>('recent');

  const { 
    confessions, 
    loading: confessionsLoading,
    loadingMore,
    hasMore,
    newPostsCount,
    shouldShowNewPostsBanner,
    loadMore,
    loadNewPosts,
    voteOnConfession,
    incrementView,
  } = useInfiniteConfessions({ 
    universityId,
    sortBy, 
    search: searchQuery,
    autoRefresh: true 
  });
  
  const { 
    toggleSave,
    isConfessionSaved 
  } = useSavedConfessions(user?.id);

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
          className="confession-card rounded-[12px] border border-gray-300 bg-white p-4 shadow-sm lg:p-6"
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
                {post.university?.name || universityName}
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

  return (
    <NextLayout>
      <div className="max-w-5xl mx-auto w-full py-8 px-4">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6 relative">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-6xl font-extrabold text-gray-800">
            {universityName} Confessions
          </h1>
          {/* New posts banner */}
          {shouldShowNewPostsBanner && (
            <NewPostsBanner 
              newPostsCount={newPostsCount}
              onLoadNewPosts={loadNewPosts}
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search confessions..."
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-lg shadow-sm transition-colors"
          />
          
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                sortBy === 'recent'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy('hot')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                sortBy === 'hot'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Hot
            </button>
          </div>
        </div>

        {/* Content */}
        <InfiniteScrollContainer
          hasMore={hasMore}
          loadMore={loadMore}
          loading={confessionsLoading}
          loadingMore={loadingMore}
          className="mt-6"
        >
          {confessionsLoading ? (
            <ConfessionListSkeleton count={5} />
          ) : confessions.length > 0 ? (
            renderPosts(confessions)
          ) : (
            <div className="text-center text-gray-600 py-8">
              <p className="text-xl mb-4">No confessions found for {universityName}</p>
              <p>Be the first to share a confession from this university!</p>
            </div>
          )}
        </InfiniteScrollContainer>
      </div>
    </NextLayout>
  );
} 