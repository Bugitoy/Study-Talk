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
import { ConfessionListSkeleton } from "@/components/ConfessionSkeleton";
import { CommentSection } from "@/components/CommentSection";
import ShareButton from "@/components/ShareButton";
import { UserReputationBadge } from '@/components/UserReputationBadge';

export default function UniversityConfessionsPage() {
  const { user } = useKindeBrowserClient();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const universityId = params.id as string;
  const universityName = searchParams.get('name') || 'University';
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'recent' | 'hot'>('recent');
  const [openCommentSections, setOpenCommentSections] = useState<Set<string>>(new Set());

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
    updateCommentCount,
  } = useInfiniteConfessions({ 
    universityId,
    sortBy, 
    search: searchQuery,
    autoRefresh: true
  });
  
  const { 
    toggleSave,
    isConfessionSaved 
  } = useSavedConfessions();

  const handleVote = async (confessionId: string, voteType: 'BELIEVE' | 'DOUBT') => {
    try {
      await voteOnConfession(confessionId, voteType);
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };
  
  const handleToggleSave = async (confessionId: string) => {
    try {
      await toggleSave(confessionId);
    } catch (error) {
      console.error("Failed to toggle save:", error);
    }
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
          className="rounded-[12px] border border-gray-300 bg-white p-3 sm:p-4 lg:p-6 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.01] relative"
          style={{ 
            animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
          }}
        >
          {/* Shield Badge - Top Right Corner */}
          {!post.isAnonymous && (
            <div className="absolute top-3 right-3 z-10">
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
            <div className="text-xs sm:text-sm lg:text-base">
              <p className="font-semibold text-gray-800">
                Posted by {post.isAnonymous ? "Anonymous" : (post.author?.name || "Unknown")}
              </p>
              <p className="text-gray-500">
                {post.university?.name || universityName}
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
                  handleVote(post.id, 'BELIEVE');
                }}
                className={`flex items-center gap-1 transition-colors ${
                  post.userVote === 'BELIEVE' 
                    ? 'text-green-600 font-semibold' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
                title={`${post.believeCount} Believers`}
              >
                <ThumbsUp className={`w-4 h-4 sm:w-5 sm:h-5 ${post.userVote === 'BELIEVE' ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{post.believeCount}</span>
                <span className="hidden md:inline"> Believers</span>
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(post.id, 'DOUBT');
                }}
                className={`flex items-center gap-1 transition-colors ${
                  post.userVote === 'DOUBT' 
                    ? 'text-red-600 font-semibold' 
                    : 'text-gray-600 hover:text-red-600'
                }`}
                title={`${post.doubtCount} Non Believers`}
              >
                <ThumbsDown className={`w-4 h-4 sm:w-5 sm:h-5 ${post.userVote === 'DOUBT' ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{post.doubtCount}</span>
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
                <span className="hidden sm:inline">{post.commentCount}</span>
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
                className="flex items-center gap-1 cursor-pointer hover:text-gray-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSave(post.id);
                }}
                title={isConfessionSaved(post.id) ? 'Saved' : 'Save'}
              >
                <Bookmark
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${isConfessionSaved(post.id) ? 'text-yellow-400' : ''}`}
                  fill={isConfessionSaved(post.id) ? '#FACC15' : 'none'}
                />
                <span className="hidden md:inline">{isConfessionSaved(post.id) ? 'Saved' : 'Save'}</span>
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

  return (
    <NextLayout>
      <div className="max-w-5xl mx-auto w-full py-4 sm:py-8 px-4">
        {/* Header with Back Button */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 relative">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-extrabold text-gray-800">
            {universityName} Confessions
          </h1>
          {/* New posts banner - DISABLED */}
          {/* {shouldShowNewPostsBanner && (
            <NewPostsBanner 
              newPostsCount={newPostsCount}
              onLoadNewPosts={loadNewPosts}
            />
          )} */}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search confessions..."
            className="flex-1 min-w-0 px-3 sm:px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-base sm:text-lg shadow-sm transition-colors"
          />
          
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('recent')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                sortBy === 'recent'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy('hot')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
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