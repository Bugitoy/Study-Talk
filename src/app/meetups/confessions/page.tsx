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

const tabs = [
  { key: "posts", label: "Posts" },
  { key: "hottest", label: "Hottest Confessions" },
  { key: "universities", label: "Universities" },
  { key: "saved", label: "Saved" },
];

interface Post {
  id: string;
  author: string;
  community: string;
  content: string;
  believers: number;
  nonBelievers: number;
  comments: number;
  views: string;
  saved: string;
  createdAt: string;
  avatar?: string;
}

const samplePosts: Post[] = [
  {
    id: "1",
    author: "MickeyMouse",
    community: "Member of Partygoers",
    content: "I once snuck into the library at midnight and rearranged the alphabetic sections just to confuse everyone the next day...",
    believers: 36,
    nonBelievers: 100,
    comments: 12,
    views: "15.1k",
    saved: "5.3k",
    createdAt: "15 hours ago",
  },
  {
    id: "2",
    author: "Anonymous",
    community: "University of Alabama",
    content: "Confessed my love to the campus statue because I thought it was my crush in a costume...",
    believers: 6,
    nonBelievers: 82,
    comments: 3,
    views: "9.4k",
    saved: "2.1k",
    createdAt: "15 hours ago",
  },
];

export default function ConfessionsPage() {
  const [activeTab, setActiveTab] = useState<string>("posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");

  const toggleSave = (id: string) => {
    setSavedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleCreatePost = () => {
    // TODO: integrate with backend; for now just close modal and reset
    console.log("New post", newTitle, newBody);
    setIsPostModalOpen(false);
    setNewTitle("");
    setNewBody("");
  };

  const renderPosts = (posts: Post[]) => (
    <div className="flex flex-col gap-6 mt-6">
      {posts
        .filter((post) =>
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.author.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((post) => (
          <div
            key={post.id}
            className="rounded-[12px] border border-gray-300 bg-white p-4 shadow-sm hover:shadow-md transition-shadow lg:p-6"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              {post.avatar ? (
                <Image
                  src={post.avatar}
                  alt={post.author}
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
                <p className="font-semibold text-gray-800">Posted by {post.author}</p>
                <p className="text-gray-500">{post.community}</p>
              </div>
            </div>
            {/* Content */}
            <p className="text-gray-700 whitespace-pre-line mb-4 line-clamp-3 lg:line-clamp-none">
              {post.content}
            </p>
            {/* Combined Stats & Actions */}
            <div className="flex items-center flex-wrap gap-6 text-sm text-gray-600 mt-4">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" /> {post.believers} Believers
              </div>
              <div className="flex items-center gap-1">
                <ThumbsDown className="w-4 h-4" /> {post.nonBelievers} Non Believers
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" /> {post.comments} Comments
              </div>
              <div className="flex items-center gap-1 cursor-pointer hover:text-gray-800">
                <Share2 className="w-4 h-4" /> Share
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer hover:text-gray-800"
                onClick={() => toggleSave(post.id)}
              >
                <Bookmark
                  className={`w-4 h-4 ${savedPosts.has(post.id) ? 'text-yellow-400' : ''}`}
                  fill={savedPosts.has(post.id) ? '#FACC15' : 'none'}
                />
                {savedPosts.has(post.id) ? 'Saved' : 'Save'}
              </div>
              <div className="ml-auto text-gray-500">
                {post.createdAt}
              </div>
            </div>
          </div>
        ))}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "posts":
        return renderPosts(samplePosts);
      case "hottest":
        // For demo, reuse samplePosts sorted by believers
        return renderPosts([...samplePosts].sort((a, b) => b.believers - a.believers));
      case "universities":
        // Aggregate stats per university
        type UniStats = {
          confessions: number;
          students: Set<string>;
          believers: number;
          nonBelievers: number;
        };

        const uniMap = samplePosts.reduce<Record<string, UniStats>>((acc, post) => {
          if (!acc[post.community]) {
            acc[post.community] = {
              confessions: 0,
              students: new Set<string>(),
              believers: 0,
              nonBelievers: 0,
            };
          }
          const entry = acc[post.community];
          entry.confessions += 1;
          entry.students.add(post.author);
          entry.believers += post.believers;
          entry.nonBelievers += post.nonBelievers;
          return acc;
        }, {});

        const filtered = Object.entries(uniMap).filter(([uni]) =>
          uni.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(([uni, stats]) => (
              <div
                key={uni}
                className="rounded-[12px] border border-gray-300 bg-white p-8 shadow-sm hover:shadow-md h-72 flex flex-col cursor-pointer"
              >
                <div className="mb-[3rem]">
                  <h3 className="font-semibold text-gray-800 text-lg lg:text-xl">
                    {uni}
                  </h3>
                </div>
                <div className="space-y-4 text-gray-600 text-sm">
                  <p>
                    {stats.confessions} confession{stats.confessions !== 1 ? "s" : ""}
                  </p>
                  <p>
                    {stats.students.size} student{stats.students.size !== 1 ? "s" : ""}
                  </p>
                  <p>
                    {stats.believers} believer{stats.believers !== 1 ? "s" : ""}
                  </p>
                  <p>
                    {stats.nonBelievers} non-believer{stats.nonBelievers !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );
      case "saved":
        const savedList = samplePosts.filter((p) => savedPosts.has(p.id));
        return savedList.length ? renderPosts(savedList) : (
          <p className="mt-6 text-center text-gray-600">No saved posts yet.</p>
        );
      default:
        return null;
    }
  };

  return (
    <NextLayout>
      <div className="max-w-5xl mx-auto w-full py-8 px-4">
        <h1 className="text-8xl font-extrabold text-gray-800 mb-6 text-center">
          Confessions
        </h1>
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
          <button
            className="flex items-center gap-2 bg-yellow-300 rounded-[12px] px-4 py-2 font-semibold text-gray-800 hover:bg-yellow-400 transition-colors"
            onClick={() => setIsPostModalOpen(true)}
          >
            <Plus className="w-4 h-8" />
            Make a post
          </button>
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
