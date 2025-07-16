'use client';
import { useEffect, useRef, useCallback } from 'react';
import Loader from '@/components/Loader';
import { ConfessionListSkeleton } from '@/components/ConfessionSkeleton';

interface InfiniteScrollContainerProps {
  children: React.ReactNode;
  hasMore: boolean;
  loadMore: () => void;
  loading?: boolean;
  loadingMore?: boolean;
  threshold?: number;
  className?: string;
}

export function InfiniteScrollContainer({
  children,
  hasMore,
  loadMore,
  loading = false,
  loadingMore = false,
  threshold = 200,
  className = '',
}: InfiniteScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || isLoadingRef.current || !hasMore || loadingMore) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom <= threshold) {
      isLoadingRef.current = true;
      loadMore();
      // Reset loading flag after a brief delay
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 500);
    }
  }, [hasMore, loadMore, loadingMore, threshold]);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use passive listener for better performance
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also check on resize in case content changes
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  // Check if we need to load more content when content changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container || loading) return;

    // Small delay to ensure DOM has updated
    const timeoutId = setTimeout(() => {
      handleScroll();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [children, handleScroll, loading]);

  return (
    <div
      ref={containerRef}
      className={`h-full overflow-y-auto ${className}`}
      style={{ 
        scrollBehavior: 'smooth',
        // Enable momentum scrolling on iOS
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {children}
      
      {/* Loading indicator at the bottom */}
      {loadingMore && (
        <div className="mt-6">
          <ConfessionListSkeleton count={2} />
        </div>
      )}
      
      {/* End of content indicator */}
      {!hasMore && !loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-center text-muted-foreground">
            <div className="text-sm">🎉 You've reached the end!</div>
            <div className="text-xs mt-1">No more confessions to load</div>
          </div>
        </div>
      )}
    </div>
  );
} 