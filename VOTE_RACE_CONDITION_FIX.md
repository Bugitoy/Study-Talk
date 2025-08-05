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
```

**Key Features:**
- **Duplicate Prevention**: Tracks pending votes to prevent multiple simultaneous votes
- **Cross-Tab Synchronization**: All tabs share the same vote state
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

Added synchronization logic to ensure all components display consistent vote counts:

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

2. **`src/hooks/useInfiniteConfessions.ts`**
   - Updated to use global vote state
   - Added state synchronization
   - Prevents race conditions

3. **`src/hooks/useSavedConfessions.ts`**
   - Updated to use global vote state
   - Added state synchronization

4. **`src/hooks/useUserConfessions.ts`**
   - Updated to use global vote state
   - Added state synchronization

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

## Testing

Created test script `scripts/test-vote-race-condition.ts` to verify:
- Rapid voting doesn't create duplicate votes
- Only one vote exists per user per confession
- Vote counts are consistent across tabs

## Benefits

1. **Prevents Race Conditions**: Users can't exploit tab switching to create duplicate votes
2. **Consistent UI**: All tabs show the same vote counts
3. **Better UX**: No confusing vote count jumps
4. **Data Integrity**: Backend and frontend stay in sync
5. **Performance**: Optimistic updates still work for instant feedback

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