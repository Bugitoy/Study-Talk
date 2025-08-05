# Vote Race Condition Fix

## Problem Description

Users could exploit a race condition by:
1. Voting on a confession in the "posts" tab
2. Quickly switching to the "hottest" tab while the vote is still processing
3. Voting again on the same confession
4. Result: Vote count appears to increase twice on the client side (e.g., 5 → 7)

This happened because each tab maintained separate state for confessions, and optimistic updates weren't synchronized across tabs.

## Root Cause

- **Separate State**: Each tab (posts, hottest, saved, my-posts) had its own `useInfiniteConfessions` hook instance
- **Optimistic Updates**: Each hook applied optimistic updates independently
- **No Synchronization**: No mechanism to prevent duplicate votes across different tab states
- **Race Condition**: Users could trigger multiple votes before the first API call completed

## Solution Implemented

### 1. Global Vote State Manager (`useVoteState`)

Created a global state manager that tracks votes across all components:

```typescript
// Global state to track votes across all components
const globalVoteState = new Map<string, VoteState>();
const pendingVotes = new Set<string>(); // Track confessionId + voteType combinations

// Subscription system for real-time updates
type VoteStateListener = (confessionId: string, voteState: VoteState | null) => void;
const voteStateListeners = new Set<VoteStateListener>();
```

**Key Features:**
- **Duplicate Prevention**: Tracks pending votes to prevent multiple simultaneous votes
- **Cross-Tab Synchronization**: All tabs share the same vote state
- **Real-time Updates**: Subscription system for immediate vote state changes
- **Optimistic Updates**: Maintains consistent optimistic updates across all components
- **Error Handling**: Reverts optimistic updates on API failures

### 2. Updated Vote Functions

Modified all vote functions to use the global state:

#### Before (Race Condition Prone):
```typescript
// Each hook managed its own state independently
setConfessions(prev => prev.map(confession => {
  if (confession.id === confessionId) {
    return {
      ...confession,
      believeCount: confession.believeCount + believeChange,
      doubtCount: confession.doubtCount + doubtChange,
      userVote: newUserVote,
    };
  }
  return confession;
}));
```

#### After (Race Condition Safe):
```typescript
// Check if vote is already pending
if (isVotePending(confessionId, voteType)) {
  return; // Vote already in progress, ignore this click
}

// Update global vote state (prevents duplicate votes across tabs)
const stateUpdated = updateVoteState(
  confessionId,
  voteType,
  action,
  currentConfession.believeCount,
  currentConfession.doubtCount,
  currentUserVote
);

if (!stateUpdated) {
  return; // Vote already in progress
}
```

### 3. State Synchronization

Added multiple layers of synchronization to ensure all components display consistent vote counts:

#### Real-time Subscription System
```typescript
// Subscribe to vote state changes for real-time updates
useEffect(() => {
  const unsubscribe = subscribeToVoteState((confessionId, voteState) => {
    // Update the confession in saved confessions if it exists
    setSavedConfessions(prev => prev.map(confession => {
      if (confession.id === confessionId) {
        if (voteState) {
          return {
            ...confession,
            believeCount: voteState.believeCount,
            doubtCount: voteState.doubtCount,
            userVote: voteState.userVote,
          };
        }
      }
      return confession;
    }));
  });

  return unsubscribe;
}, [subscribeToVoteState]);
```

#### Tab Visibility Detection
```typescript
// Sync vote states when tab becomes visible
useTabVisibility(syncVoteStates);
```

#### Tab Switching Sync
```typescript
// Sync vote states when switching to saved or my-posts tabs
if (tab.key === "saved" || tab.key === "my-posts") {
  setTimeout(() => {
    syncAllVoteStates();
  }, 100);
}
```

#### Data Fetching Sync
```typescript
// Sync confessions with global vote state
const syncedConfessions = newConfessions.map((confession: Confession) => {
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
```

## Implementation Details

### Files Modified

1. **`src/hooks/useVoteState.ts`** (NEW)
   - Global vote state manager
   - Prevents duplicate votes
   - Manages optimistic updates
   - Real-time subscription system
   - Tab switching synchronization

2. **`src/hooks/useTabVisibility.ts`** (NEW)
   - Detects when tabs become visible/active
   - Triggers vote state synchronization

3. **`src/hooks/useInfiniteConfessions.ts`**
   - Updated to use global vote state
   - Added state synchronization
   - Prevents race conditions

4. **`src/hooks/useSavedConfessions.ts`**
   - Updated to use global vote state
   - Added real-time subscription
   - Added tab visibility detection
   - Added automatic vote state sync

5. **`src/hooks/useUserConfessions.ts`**
   - Updated to use global vote state
   - Added real-time subscription
   - Added tab visibility detection
   - Added automatic vote state sync
   - Added `voteOnConfession` function for my-posts tab

6. **`src/app/meetups/confessions/page.tsx`**
   - Updated to use correct vote functions for each tab
   - Added `voteOnUserConfession` for my-posts tab
   - Added tab switching synchronization trigger

### Key Functions

#### `updateVoteState()`
- Prevents duplicate pending votes
- Calculates vote changes consistently
- Updates global state atomically

#### `isVotePending()`
- Checks if a vote is already in progress
- Prevents multiple simultaneous votes

#### `completeVote()`
- Marks votes as completed or failed
- Cleans up pending vote tracking
- Handles error scenarios

#### `subscribeToVoteState()`
- Subscribes to real-time vote state changes
- Notifies all listeners when vote state updates
- Enables immediate synchronization across tabs

#### `syncAllVoteStates()`
- Forces synchronization of all vote states across all tabs
- Called when switching to saved/my-posts tabs
- Ensures immediate consistency after tab switches

#### `useTabVisibility()`
- Detects when browser tab becomes visible/active
- Triggers vote state synchronization automatically
- Handles cases where users switch between browser tabs

## Testing

Created test scripts to verify the fix:
- **`scripts/test-vote-race-condition.ts`**: Tests rapid voting doesn't create duplicate votes
- **`scripts/test-all-tabs-vote-sync.ts`**: Tests all tabs (posts, hottest, saved, my-posts) are synchronized
- **`scripts/test-realtime-vote-sync.ts`**: Tests real-time vote synchronization across all tabs
- **`scripts/test-tab-switching-sync.ts`**: Tests immediate synchronization when switching between tabs
- Verifies only one vote exists per user per confession
- Confirms vote counts are consistent across all tabs
- Validates immediate updates when switching between tabs
- Tests tab visibility detection and synchronization

## Benefits

1. **Prevents Race Conditions**: Users can't exploit tab switching to create duplicate votes
2. **Consistent UI**: All tabs show the same vote counts
3. **Real-time Synchronization**: Vote changes appear immediately across all tabs
4. **Better UX**: No confusing vote count jumps or delays
5. **Data Integrity**: Backend and frontend stay in sync
6. **Performance**: Optimistic updates still work for instant feedback

## Usage

The fix is transparent to users - no changes in behavior except:
- **Before**: Could create duplicate votes by switching tabs quickly
- **After**: Duplicate votes are prevented, consistent experience across tabs

## Monitoring

The implementation includes:
- Console logging for vote state changes
- Error tracking for failed votes
- Pending vote tracking for debugging

## Future Enhancements

Potential improvements:
1. **Real-time Updates**: WebSocket updates for live vote synchronization
2. **Vote History**: Track vote changes for analytics
3. **Rate Limiting**: Additional client-side rate limiting
4. **Offline Support**: Handle votes when offline 