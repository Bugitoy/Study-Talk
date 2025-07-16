'use client';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

interface NewPostsBannerProps {
  newPostsCount: number;
  onLoadNewPosts: () => void;
  className?: string;
}

export function NewPostsBanner({ 
  newPostsCount, 
  onLoadNewPosts, 
  className = '' 
}: NewPostsBannerProps) {
  if (newPostsCount === 0) return null;

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <Button
        onClick={onLoadNewPosts}
        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg border-2 border-background animate-pulse hover:animate-none transition-all duration-300 hover:scale-105"
        size="sm"
      >
        <ArrowUp className="w-4 h-4 mr-2" />
        {newPostsCount === 1 
          ? 'New confession available'
          : `${newPostsCount} new confessions available`
        }
      </Button>
    </div>
  );
} 