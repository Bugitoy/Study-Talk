"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import NextLayout from "@/components/NextLayout";
import { ArrowLeft, User as UserIcon, ThumbsUp, ThumbsDown, MessageCircle, Share2, Bookmark, Flag, Copy, Twitter, Facebook, Link as LinkIcon } from "lucide-react";
import Image from "next/image";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useSavedConfessions } from "@/hooks/useSavedConfessions";
import { CommentSection } from "@/components/CommentSection";
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Head from "next/head";

interface Confession {
  id: string;
  title: string;
  content: string;
  authorId: string;
  universityId?: string;
  isAnonymous: boolean;
  viewCount: number;
  hotScore: number;
  believeCount: number;
  doubtCount: number;
  commentCount: number;
  savedCount: number;
  userVote?: 'BELIEVE' | 'DOUBT' | null;
  author: {
    id: string;
    name?: string;
    image?: string;
    university?: string;
  };
  university?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ConfessionPostPage() {
  const { user } = useKindeBrowserClient();
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const confessionId = params.id as string;
  
  const [confession, setConfession] = useState<Confession | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCommentSection, setOpenCommentSection] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportType, setReportType] = useState('INAPPROPRIATE_BEHAVIOR');
  
  const { toggleSave, isConfessionSaved } = useSavedConfessions(user?.id);

  const reportTypes = [
    { value: 'INAPPROPRIATE_BEHAVIOR', label: 'Inappropriate Behavior' },
    { value: 'HARASSMENT', label: 'Harassment' },
    { value: 'SPAM', label: 'Spam' },
    { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content' },
    { value: 'OTHER', label: 'Other' },
  ];

  useEffect(() => {
    const fetchConfession = async () => {
      try {
        const res = await fetch(`/api/confessions/${confessionId}?userId=${user?.id || ''}`);
        if (res.ok) {
          const data = await res.json();
          setConfession(data);
        } else {
          toast({
            title: "Error",
            description: "Confession not found",
            variant: "destructive",
          });
          router.push('/meetups/confessions');
        }
      } catch (error) {
        console.error('Error fetching confession:', error);
        toast({
          title: "Error",
          description: "Failed to load confession",
          variant: "destructive",
        });
        router.push('/meetups/confessions');
      } finally {
        setLoading(false);
      }
    };

    if (confessionId) {
      fetchConfession();
    }
  }, [confessionId, user?.id, router, toast]);

  const handleVote = async (voteType: 'BELIEVE' | 'DOUBT') => {
    if (!user?.id || !confession) return;
    
    try {
      const res = await fetch('/api/confessions/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          confessionId: confession.id,
          voteType,
        }),
      });

      if (res.ok) {
        const updatedVote = await res.json();
        setConfession(prev => {
          if (!prev) return prev;
          
          // Update vote counts
          let newBelieveCount = prev.believeCount;
          let newDoubtCount = prev.doubtCount;
          
          // Remove previous vote if exists
          if (prev.userVote === 'BELIEVE') newBelieveCount--;
          if (prev.userVote === 'DOUBT') newDoubtCount--;
          
          // Add new vote
          if (voteType === 'BELIEVE') newBelieveCount++;
          if (voteType === 'DOUBT') newDoubtCount++;
          
          return {
            ...prev,
            believeCount: newBelieveCount,
            doubtCount: newDoubtCount,
            userVote: voteType,
          };
        });
      }
    } catch (error) {
      console.error("Failed to vote:", error);
      toast({
        title: "Error",
        description: "Failed to vote",
        variant: "destructive",
      });
    }
  };

  const handleToggleSave = async () => {
    if (!user?.id || !confession) return;
    
    try {
      await toggleSave(confession.id);
      toast({
        title: "Success",
        description: isConfessionSaved(confession.id) ? "Removed from saved" : "Added to saved",
      });
    } catch (error) {
      console.error("Failed to toggle save:", error);
      toast({
        title: "Error",
        description: "Failed to save confession",
        variant: "destructive",
      });
    }
  };

  const handleReport = async () => {
    if (!user?.id || !confession || !reportReason.trim()) {
      toast({
        title: "Error",
        description: "Please fill all fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const res = await fetch(`/api/confessions/${confession.id}/report`, {
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
        setShowReportDialog(false);
        setReportReason('');
        setReportType('INAPPROPRIATE_BEHAVIOR');
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
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Success",
        description: "Link copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const shareOnSocialMedia = (platform: string) => {
    if (!confession) return;
    
    const url = `${window.location.origin}/meetups/confessions/post/${confession.id}`;
    const text = `${confession.title} - Check out this confession!`;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
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

  if (loading) {
    return (
      <NextLayout>
        <div className="max-w-4xl mx-auto w-full py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </NextLayout>
    );
  }

  if (!confession) {
    return (
      <NextLayout>
        <div className="max-w-4xl mx-auto w-full py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Confession Not Found</h1>
            <p className="text-gray-600 mb-6">The confession you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push('/meetups/confessions')}>
              Back to Confessions
            </Button>
          </div>
        </div>
      </NextLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{confession.title} - Confession | Thanodi</title>
        <meta name="description" content={confession.content.substring(0, 160)} />
        <meta property="og:title" content={confession.title} />
        <meta property="og:description" content={confession.content.substring(0, 160)} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${typeof window !== 'undefined' ? window.location.origin : ''}/meetups/confessions/post/${confession.id}`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={confession.title} />
        <meta name="twitter:description" content={confession.content.substring(0, 160)} />
        <link rel="canonical" href={`${typeof window !== 'undefined' ? window.location.origin : ''}/meetups/confessions/post/${confession.id}`} />
      </Head>
      
      <NextLayout>
        <div className="max-w-4xl mx-auto w-full py-8 px-4">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>

          {/* Confession Card */}
          <div className="rounded-[12px] border border-gray-300 bg-white p-6 shadow-sm lg:p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              {confession.author?.image && !confession.isAnonymous ? (
                <Image
                  src={confession.author.image}
                  alt={confession.author.name || "User"}
                  width={48}
                  height={48}
                  className="rounded-[8px] object-cover"
                />
              ) : (
                <span className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-[8px]">
                  <UserIcon className="w-8 h-8 text-gray-500" />
                </span>
              )}
              <div>
                <p className="font-semibold text-gray-800 text-lg">
                  Posted by {confession.isAnonymous ? "Anonymous" : (confession.author?.name || "Unknown")}
                </p>
                <p className="text-gray-500">
                  {confession.university?.name || "Unknown University"}
                </p>
                <p className="text-sm text-gray-400">
                  {formatTimeAgo(confession.createdAt)} • {confession.viewCount} views
                </p>
              </div>
            </div>
            
            {/* Title */}
            <h1 className="font-bold text-2xl text-gray-900 mb-4">{confession.title}</h1>
            
            {/* Content */}
            <p className="text-gray-700 whitespace-pre-line mb-6 text-lg leading-relaxed">
              {confession.content}
            </p>
            
            {/* Stats & Actions */}
            <div className="flex items-center flex-wrap gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleVote('BELIEVE')}
                  className={`flex items-center gap-1 transition-colors ${
                    confession.userVote === 'BELIEVE' 
                      ? 'text-green-600 font-semibold' 
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  <ThumbsUp className={`w-5 h-5 ${confession.userVote === 'BELIEVE' ? 'fill-current' : ''}`} />
                  {confession.believeCount} Believers
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleVote('DOUBT')}
                  className={`flex items-center gap-1 transition-colors ${
                    confession.userVote === 'DOUBT' 
                      ? 'text-red-600 font-semibold' 
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  <ThumbsDown className={`w-5 h-5 ${confession.userVote === 'DOUBT' ? 'fill-current' : ''}`} />
                  {confession.doubtCount} Non Believers
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setOpenCommentSection(!openCommentSection)}
                  className={`flex items-center gap-1 transition-colors ${
                    openCommentSection
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" /> {confession.commentCount} Comments
                </button>
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer hover:text-gray-800"
                onClick={() => setShowShareDialog(true)}
              >
                <Share2 className="w-5 h-5" /> Share
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer hover:text-gray-800"
                onClick={handleToggleSave}
              >
                <Bookmark
                  className={`w-5 h-5 ${isConfessionSaved(confession.id) ? 'text-yellow-400' : ''}`}
                  fill={isConfessionSaved(confession.id) ? '#FACC15' : 'none'}
                />
                {isConfessionSaved(confession.id) ? 'Saved' : 'Save'}
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer hover:text-red-600"
                onClick={() => setShowReportDialog(true)}
              >
                <Flag className="w-5 h-5" /> Report
              </div>
            </div>
            
            {/* Comments Section */}
            {openCommentSection && (
              <CommentSection
                confessionId={confession.id}
                isVisible={openCommentSection}
                onClose={() => setOpenCommentSection(false)}
                updateCommentCount={() => {
                  setConfession(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : null);
                }}
              />
            )}
          </div>

          {/* Share Dialog */}
          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Confession</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => copyToClipboard(`${window.location.origin}/meetups/confessions/post/${confession.id}`)}
                    variant="outline"
                    className="justify-start"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    onClick={() => shareOnSocialMedia('twitter')}
                    variant="outline"
                    className="justify-start"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Share on Twitter
                  </Button>
                  <Button
                    onClick={() => shareOnSocialMedia('facebook')}
                    variant="outline"
                    className="justify-start"
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Share on Facebook
                  </Button>
                  <Button
                    onClick={() => shareOnSocialMedia('whatsapp')}
                    variant="outline"
                    className="justify-start"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Share on WhatsApp
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Report Dialog */}
          <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Report Confession</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Type of Report</label>
                  <select
                    className="w-full border border-gray-300 rounded p-2"
                    value={reportType}
                    onChange={e => setReportType(e.target.value)}
                  >
                    {reportTypes.map(rt => (
                      <option key={rt.value} value={rt.value}>{rt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Reason</label>
                  <textarea
                    className="w-full border border-gray-300 rounded p-2"
                    rows={4}
                    placeholder="Describe the issue..."
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowReportDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReport}
                    disabled={!reportReason.trim()}
                  >
                    Submit Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </NextLayout>
    </>
  );
} 