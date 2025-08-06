'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Confession } from './useInfiniteConfessions';

export type { Confession };
import { useVoteState } from './useVoteState';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

interface UnifiedConfessionsState {
  posts: Confession[];
  hottest: Confession[];
  saved: Confession[];
  myPosts: Confession[];
  loading: {
    posts: boolean;
    hottest: boolean;
    saved: boolean;
    myPosts: boolean;
  };
  hasMore: {
    posts: boolean;
    hottest: boolean;
    saved: boolean;
    myPosts: boolean;
  };
  nextCursor: {
    posts: string | null;
    hottest: string | null;
    saved: string | null;
    myPosts: string | null;
  };
}

export function useUnifiedConfessions() {
  const { getVoteState, updateVoteState, completeVote, isVotePending, subscribeToVoteState } = useVoteState();
  const { user } = useKindeBrowserClient();
  
  const [state, setState] = useState<UnifiedConfessionsState>({
    posts: [],
    hottest: [],
    saved: [],
    myPosts: [],
    loading: {
      posts: true,
      hottest: true,
      saved: false,
      myPosts: false,
    },
    hasMore: {
      posts: true,
      hottest: true,
      saved: true,
      myPosts: true,
    },
    nextCursor: {
      posts: null,
      hottest: null,
      saved: null,
      myPosts: null,
    },
  });

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Fetch confessions for a specific tab
  const fetchConfessions = useCallback(async (
    tab: 'posts' | 'hottest' | 'saved' | 'myPosts',
    cursor?: string,
    append = false
  ) => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, [tab]: true }
      }));

      let endpoint = '';
      let params = new URLSearchParams();

      switch (tab) {
        case 'posts':
          endpoint = '/api/confessions/infinite';
          params.set('sortBy', 'recent');
          break;
        case 'hottest':
          endpoint = '/api/confessions/infinite';
          params.set('sortBy', 'hot');
          break;
        case 'saved':
          endpoint = '/api/confessions/saved';
          break;
        case 'myPosts':
          endpoint = '/api/confessions/user';
          params.set('sortBy', 'recent');
          break;
      }

      if (cursor) params.set('cursor', cursor);

      const response = await fetch(`${endpoint}?${params}`);
      if (!response.ok) throw new Error(`Failed to fetch ${tab} confessions`);

      const data = await response.json();
      const confessions = data.confessions || data;

      // Sync with global vote state
      const syncedConfessions = confessions.map((confession: Confession) => {
        const globalState = getVoteState(confession.id);
        if (globalState && globalState.lastUpdated > Date.now() - 30000) {
          return {
            ...confession,
            believeCount: globalState.believeCount,
            doubtCount: globalState.doubtCount,
            userVote: globalState.userVote,
          };
        }
        return confession;
      });

      setState(prev => ({
        ...prev,
        [tab]: append ? [...prev[tab], ...syncedConfessions] : syncedConfessions,
        loading: { ...prev.loading, [tab]: false },
        hasMore: { ...prev.hasMore, [tab]: data.hasMore ?? true },
        nextCursor: { ...prev.nextCursor, [tab]: data.nextCursor ?? null },
      }));

      // Update saved IDs if fetching saved confessions
      if (tab === 'saved') {
        setSavedIds(new Set(syncedConfessions.map((c: Confession) => c.id)));
      }

    } catch (error) {
      console.error(`Error fetching ${tab} confessions:`, error);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, [tab]: false }
      }));
    }
  }, [getVoteState]);

  // Vote on confession (unified across all tabs)
  const voteOnConfession = useCallback(async (confessionId: string, voteType: 'BELIEVE' | 'DOUBT') => {
    // Check if user is authenticated
    if (!user?.id) {
      console.log('User not authenticated, cannot vote');
      return;
    }
    
    try {
      // Find confession in any tab to get current state
      const allConfessions = [...state.posts, ...state.hottest, ...state.saved, ...state.myPosts];
      const currentConfession = allConfessions.find(c => c.id === confessionId);
      if (!currentConfession) return;

      const currentUserVote = currentConfession.userVote || null;
      let action: 'vote' | 'unvote';

      if (currentUserVote === voteType) {
        action = 'unvote';
      } else {
        action = 'vote';
      }

      if (isVotePending(confessionId, voteType)) return;

      const stateUpdated = updateVoteState(
        confessionId,
        voteType,
        action,
        currentConfession.believeCount,
        currentConfession.doubtCount,
        currentUserVote
      );

      if (!stateUpdated) return;

      // Apply optimistic update to ALL tabs immediately
      const globalState = getVoteState(confessionId);
      if (globalState) {
        const updateConfessions = (confessions: Confession[]) =>
          confessions.map(confession =>
            confession.id === confessionId
              ? {
                  ...confession,
                  believeCount: globalState.believeCount,
                  doubtCount: globalState.doubtCount,
                  userVote: globalState.userVote,
                }
              : confession
          );

        setState(prev => ({
          ...prev,
          posts: updateConfessions(prev.posts),
          hottest: updateConfessions(prev.hottest),
          saved: updateConfessions(prev.saved),
          myPosts: updateConfessions(prev.myPosts),
        }));
      }

      // API call
      const requestBody = action === 'unvote'
        ? { confessionId, action: 'unvote' }
        : { confessionId, voteType, action: 'vote' };

      const response = await fetch('/api/confessions/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        completeVote(confessionId, voteType, false);
        // Revert optimistic update
        const revertConfessions = (confessions: Confession[]) =>
          confessions.map(confession =>
            confession.id === confessionId
              ? {
                  ...confession,
                  believeCount: currentConfession.believeCount,
                  doubtCount: currentConfession.doubtCount,
                  userVote: currentUserVote,
                }
              : confession
          );

        setState(prev => ({
          ...prev,
          posts: revertConfessions(prev.posts),
          hottest: revertConfessions(prev.hottest),
          saved: revertConfessions(prev.saved),
          myPosts: revertConfessions(prev.myPosts),
        }));

        throw new Error('Failed to vote on confession');
      }

      completeVote(confessionId, voteType, true);
      return await response.json();

    } catch (error) {
      completeVote(confessionId, voteType, false);
      throw error;
    }
  }, [state, isVotePending, updateVoteState, getVoteState, completeVote]);

  // Save/unsave confession
  const toggleSave = useCallback(async (confessionId: string) => {
    // Check if user is authenticated
    if (!user?.id) {
      console.log('User not authenticated, cannot save confession');
      return;
    }
    
    try {
      const isCurrentlySaved = savedIds.has(confessionId);
      const action = isCurrentlySaved ? 'unsave' : 'save';

      const response = await fetch('/api/confessions/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confessionId, action }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} confession`);

      if (isCurrentlySaved) {
        setSavedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(confessionId);
          return newSet;
        });
        setState(prev => ({
          ...prev,
          saved: prev.saved.filter(c => c.id !== confessionId),
        }));
      } else {
        setSavedIds(prev => new Set(Array.from(prev).concat([confessionId])));
        // Refresh saved confessions to get the full confession data
        await fetchConfessions('saved');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      throw error;
    }
  }, [savedIds, fetchConfessions]);

  // Subscribe to vote state changes
  useEffect(() => {
    const unsubscribe = subscribeToVoteState((confessionId, voteState) => {
      const updateConfessions = (confessions: Confession[]) =>
        confessions.map(confession =>
          confession.id === confessionId
            ? voteState
              ? {
                  ...confession,
                  believeCount: voteState.believeCount,
                  doubtCount: voteState.doubtCount,
                  userVote: voteState.userVote,
                }
              : confession
            : confession
        );

      setState(prev => ({
        ...prev,
        posts: updateConfessions(prev.posts),
        hottest: updateConfessions(prev.hottest),
        saved: updateConfessions(prev.saved),
        myPosts: updateConfessions(prev.myPosts),
      }));
    });

    return unsubscribe;
  }, [subscribeToVoteState]);

  // Initial load
  useEffect(() => {
    // Always fetch public tabs
    fetchConfessions('posts');
    fetchConfessions('hottest');
    
    // Only fetch authenticated tabs if user is logged in
    if (user?.id) {
      fetchConfessions('saved');
      fetchConfessions('myPosts');
    } else {
      // User is not authenticated, set authenticated tabs to empty
      setState(prev => ({
        ...prev,
        saved: [],
        myPosts: [],
        loading: { ...prev.loading, saved: false, myPosts: false },
        hasMore: { ...prev.hasMore, saved: false, myPosts: false },
        nextCursor: { ...prev.nextCursor, saved: null, myPosts: null },
      }));
    }
  }, [fetchConfessions, user?.id]);

  // Load more for a specific tab
  const loadMore = useCallback((tab: 'posts' | 'hottest' | 'saved' | 'myPosts') => {
    if (state.loading[tab] || !state.hasMore[tab] || !state.nextCursor[tab]) return;
    fetchConfessions(tab, state.nextCursor[tab], true);
  }, [state, fetchConfessions]);

  // Refresh a specific tab
  const refresh = useCallback((tab: 'posts' | 'hottest' | 'saved' | 'myPosts') => {
    fetchConfessions(tab);
  }, [fetchConfessions]);

  return {
    // State
    posts: state.posts,
    hottest: state.hottest,
    saved: state.saved,
    myPosts: state.myPosts,
    loading: state.loading,
    hasMore: state.hasMore,
    
    // Actions
    voteOnConfession,
    toggleSave,
    loadMore,
    refresh,
    isConfessionSaved: (confessionId: string) => savedIds.has(confessionId),
    
    // Create confession function
    createConfession: async (data: { title: string; content: string; university?: string; isAnonymous?: boolean }) => {
      // Check if user is authenticated
      if (!user?.id) {
        throw new Error('You must be logged in to create a confession');
      }
      
      try {
        const response = await fetch('/api/confessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create confession');
        }

        const newConfession = await response.json();

        // Add the new confession to the posts list
        setState(prev => ({
          ...prev,
          posts: [newConfession, ...prev.posts],
          myPosts: [newConfession, ...prev.myPosts],
        }));

        return newConfession;
      } catch (error) {
        console.error('Error creating confession:', error);
        throw error;
      }
    },

    // Delete confession function
    deleteConfession: async (confessionId: string) => {
      try {
        const response = await fetch(`/api/confessions/${confessionId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete confession');
        }

        // Remove the confession from all lists
        setState(prev => ({
          ...prev,
          posts: prev.posts.filter(c => c.id !== confessionId),
          hottest: prev.hottest.filter(c => c.id !== confessionId),
          saved: prev.saved.filter(c => c.id !== confessionId),
          myPosts: prev.myPosts.filter(c => c.id !== confessionId),
        }));

        return { message: 'Confession deleted successfully' };
      } catch (error) {
        console.error('Error deleting confession:', error);
        throw error;
      }
    },
    updateCommentCount: () => {},
    newPostsCount: 0,
    shouldShowNewPostsBanner: false,
  };
} 