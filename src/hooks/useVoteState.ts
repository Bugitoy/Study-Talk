import { useState, useCallback, useRef } from 'react';

interface VoteState {
  confessionId: string;
  userVote: 'BELIEVE' | 'DOUBT' | null;
  believeCount: number;
  doubtCount: number;
  isPending: boolean;
  lastUpdated: number;
}

interface VoteUpdate {
  confessionId: string;
  voteType: 'BELIEVE' | 'DOUBT';
  action: 'vote' | 'unvote';
}

// Global state to track votes across all components
const globalVoteState = new Map<string, VoteState>();
const pendingVotes = new Set<string>(); // Track confessionId + voteType combinations

export function useVoteState() {
  const [, forceUpdate] = useState({});

  const getVoteState = useCallback((confessionId: string): VoteState | null => {
    return globalVoteState.get(confessionId) || null;
  }, []);

  const updateVoteState = useCallback((
    confessionId: string, 
    voteType: 'BELIEVE' | 'DOUBT', 
    action: 'vote' | 'unvote',
    currentBelieveCount: number,
    currentDoubtCount: number,
    currentUserVote: 'BELIEVE' | 'DOUBT' | null
  ) => {
    const voteKey = `${confessionId}-${voteType}`;
    
    // Prevent duplicate pending votes
    if (pendingVotes.has(voteKey)) {
      return false; // Vote already in progress
    }

    // Calculate new state
    let newUserVote: 'BELIEVE' | 'DOUBT' | null;
    let believeChange = 0;
    let doubtChange = 0;

    if (action === 'unvote') {
      newUserVote = null;
      if (voteType === 'BELIEVE') believeChange = -1;
      if (voteType === 'DOUBT') doubtChange = -1;
    } else {
      newUserVote = voteType;
      
      if (currentUserVote === 'BELIEVE') {
        believeChange = -1;
        doubtChange = 1;
      } else if (currentUserVote === 'DOUBT') {
        believeChange = 1;
        doubtChange = -1;
      } else {
        if (voteType === 'BELIEVE') believeChange = 1;
        if (voteType === 'DOUBT') doubtChange = 1;
      }
    }

    // Update global state
    globalVoteState.set(confessionId, {
      confessionId,
      userVote: newUserVote,
      believeCount: Math.max(0, currentBelieveCount + believeChange),
      doubtCount: Math.max(0, currentDoubtCount + doubtChange),
      isPending: true,
      lastUpdated: Date.now(),
    });

    // Mark as pending
    pendingVotes.add(voteKey);

    // Force re-render of all components using this hook
    forceUpdate({});

    return true; // Vote state updated successfully
  }, []);

  const completeVote = useCallback((confessionId: string, voteType: 'BELIEVE' | 'DOUBT', success: boolean) => {
    const voteKey = `${confessionId}-${voteType}`;
    
    if (success) {
      // Keep the optimistic update
      const currentState = globalVoteState.get(confessionId);
      if (currentState) {
        globalVoteState.set(confessionId, {
          ...currentState,
          isPending: false,
        });
      }
    } else {
      // Remove the optimistic update on failure
      globalVoteState.delete(confessionId);
    }

    // Remove from pending votes
    pendingVotes.delete(voteKey);

    // Force re-render
    forceUpdate({});
  }, []);

  const clearVoteState = useCallback((confessionId: string) => {
    globalVoteState.delete(confessionId);
    // Remove any pending votes for this confession
    for (const voteKey of pendingVotes) {
      if (voteKey.startsWith(confessionId)) {
        pendingVotes.delete(voteKey);
      }
    }
    forceUpdate({});
  }, []);

  const isVotePending = useCallback((confessionId: string, voteType: 'BELIEVE' | 'DOUBT') => {
    return pendingVotes.has(`${confessionId}-${voteType}`);
  }, []);

  return {
    getVoteState,
    updateVoteState,
    completeVote,
    clearVoteState,
    isVotePending,
  };
} 