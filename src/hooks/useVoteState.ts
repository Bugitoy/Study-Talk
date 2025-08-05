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

// Subscription system for real-time updates
type VoteStateListener = (confessionId: string, voteState: VoteState | null) => void;
const voteStateListeners = new Set<VoteStateListener>();

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
    const newVoteState = {
      confessionId,
      userVote: newUserVote,
      believeCount: Math.max(0, currentBelieveCount + believeChange),
      doubtCount: Math.max(0, currentDoubtCount + doubtChange),
      isPending: true,
      lastUpdated: Date.now(),
    };
    
    globalVoteState.set(confessionId, newVoteState);

    // Mark as pending
    pendingVotes.add(voteKey);

    // Notify all listeners of the vote state change
    voteStateListeners.forEach(listener => {
      try {
        listener(confessionId, newVoteState);
      } catch (error) {
        console.error('Error in vote state listener:', error);
      }
    });

    // Force re-render of all components using this hook
    forceUpdate({});

    return true; // Vote state updated successfully
  }, []);

  const completeVote = useCallback((confessionId: string, voteType: 'BELIEVE' | 'DOUBT', success: boolean) => {
    const voteKey = `${confessionId}-${voteType}`;
    
    let finalState: VoteState | null = null;
    
    if (success) {
      // Keep the optimistic update
      const currentState = globalVoteState.get(confessionId);
      if (currentState) {
        finalState = {
          ...currentState,
          isPending: false,
        };
        globalVoteState.set(confessionId, finalState);
      }
    } else {
      // Remove the optimistic update on failure
      globalVoteState.delete(confessionId);
      finalState = null;
    }

    // Remove from pending votes
    pendingVotes.delete(voteKey);

    // Notify all listeners of the vote state change
    voteStateListeners.forEach(listener => {
      try {
        listener(confessionId, finalState);
      } catch (error) {
        console.error('Error in vote state listener:', error);
      }
    });

    // Force re-render
    forceUpdate({});
  }, []);

  const clearVoteState = useCallback((confessionId: string) => {
    globalVoteState.delete(confessionId);
    // Remove any pending votes for this confession
    const voteKeysToDelete = Array.from(pendingVotes).filter(voteKey => voteKey.startsWith(confessionId));
    voteKeysToDelete.forEach(voteKey => pendingVotes.delete(voteKey));
    forceUpdate({});
  }, []);

  const isVotePending = useCallback((confessionId: string, voteType: 'BELIEVE' | 'DOUBT') => {
    return pendingVotes.has(`${confessionId}-${voteType}`);
  }, []);

  const subscribeToVoteState = useCallback((listener: VoteStateListener) => {
    voteStateListeners.add(listener);
    return () => {
      voteStateListeners.delete(listener);
    };
  }, []);

  const notifyVoteStateChange = useCallback((confessionId: string, voteState: VoteState | null) => {
    voteStateListeners.forEach(listener => {
      try {
        listener(confessionId, voteState);
      } catch (error) {
        console.error('Error in vote state listener:', error);
      }
    });
  }, []);

  const syncAllVoteStates = useCallback(() => {
    // Notify all listeners of all current vote states
    globalVoteState.forEach((voteState, confessionId) => {
      voteStateListeners.forEach(listener => {
        try {
          listener(confessionId, voteState);
        } catch (error) {
          console.error('Error in vote state listener during sync:', error);
        }
      });
    });
  }, []);

  return {
    getVoteState,
    updateVoteState,
    completeVote,
    clearVoteState,
    isVotePending,
    subscribeToVoteState,
    notifyVoteStateChange,
    syncAllVoteStates,
  };
} 