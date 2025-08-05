'use client';
import { useEffect, useCallback } from 'react';

export function useTabVisibility(onTabVisible?: () => void) {
  const handleVisibilityChange = useCallback(() => {
    if (!document.hidden && onTabVisible) {
      // Small delay to ensure any pending state updates are processed
      setTimeout(() => {
        onTabVisible();
      }, 50);
    }
  }, [onTabVisible]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return {
    isVisible: !document.hidden,
  };
} 