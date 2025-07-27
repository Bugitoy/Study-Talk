"use client";

import React, { useState } from "react";
import { Share2, Copy, Twitter, Facebook, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  confessionId: string;
  confessionTitle: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export default function ShareButton({ 
  confessionId, 
  confessionTitle, 
  className = "",
  variant = "ghost",
  size = "default"
}: ShareButtonProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { toast } = useToast();

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
    const url = `${window.location.origin}/meetups/confessions/post/${confessionId}`;
    const text = `${confessionTitle} - Check out this confession!`;
    
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

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setShowShareDialog(true)}
        title="Share"
      >
        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden md:inline">Share</span>
      </Button>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Confession</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => copyToClipboard(`${window.location.origin}/meetups/confessions/post/${confessionId}`)}
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
    </>
  );
} 