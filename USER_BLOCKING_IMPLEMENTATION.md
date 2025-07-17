# User Blocking Implementation

This document describes the implementation of user blocking and room banning functionality using Stream.io webhooks.

## Features Implemented

### 1. Global User Blocking (Admin)
- **API Route**: `/api/user/block`
- **Method**: POST
- **Purpose**: Block a user globally from joining any calls
- **Stream.io Integration**: Uses `client.video.blockUser(userId)`
- **Database**: Updates `User.isBlocked = true` and creates `UserReport` record

### 2. Global User Unblocking (Admin)
- **API Route**: `/api/user/unblock`
- **Method**: POST
- **Purpose**: Unblock a user globally
- **Stream.io Integration**: Uses `client.video.unblockUser(userId)`
- **Database**: Updates `User.isBlocked = false` and updates `UserReport` record

### 3. Room-Specific User Banning (Host)
- **API Route**: `/api/room/ban`
- **Method**: POST
- **Purpose**: Ban a user from a specific room only
- **Database**: Creates `RoomBan` record with unique constraint on `[userId, callId]`

### 4. Webhook Integration
- **File**: `/api/webhooks/stream-call-events/route.ts`
- **Event**: `call.session_participant_joined`
- **Logic**: Checks for blocked users and room bans, removes them from calls
- **Status**: Currently commented out due to Prisma client issues

## Database Schema

### User Model
```prisma
model User {
  // ... existing fields
  isBlocked  Boolean  @default(false)
  // ... other fields
}
```

### RoomBan Model
```prisma
model RoomBan {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String
  callId    String
  hostId    String
  reason    String?
  bannedAt  DateTime @default(now())
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, callId])
  @@index([userId])
  @@index([callId])
}
```

### UserReport Model
```prisma
model UserReport {
  id          String       @id @default(auto()) @map("_id") @db.ObjectId
  userId      String
  isBlocked   Boolean      @default(false)
  blockedAt   DateTime?
  blockedBy   String?
  blockReason String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## UI Components

### Admin Reports Page
- **File**: `/src/app/admin/reports/page.tsx`
- **Features**:
  - Block user button (for pending reports)
  - Unblock user button (for resolved reports)
  - Uses toast notifications for feedback

### Meeting Room Component
- **File**: `/src/components/MeetingRoom.tsx`
- **Features**:
  - Ban user button (only visible to host)
  - Ban dialog with participant selection
  - Reason input field
  - Uses toast notifications for feedback

## Stream.io Integration

### Blocking Users
```javascript
// Block user globally
await client.video.blockUser(userId);

// Unblock user globally
await client.video.unblockUser(userId);
```

### Webhook Event Handling
```javascript
// In participant_joined event
if (user?.isBlocked) {
  await client.video.removeCallMember({
    id: callId,
    type: event.call?.type || 'default'
  }, userId);
  return;
}
```

## Current Status

### ✅ Completed
- Database schema updates
- API routes for blocking/unblocking
- Admin UI for blocking/unblocking
- Meeting room UI for banning users
- Room ban API route
- Webhook structure (commented out due to Prisma issues)

### ⚠️ Pending
- Prisma client regeneration to fix linter errors
- Webhook implementation uncommenting
- Testing of Stream.io API calls
- Error handling improvements

## Next Steps

1. **Fix Prisma Client**: Regenerate the Prisma client to resolve linter errors
2. **Uncomment Webhook Logic**: Enable the blocking checks in the webhook handler
3. **Test Stream.io APIs**: Verify the correct method names for removing users from calls
4. **Add Error Handling**: Improve error handling for Stream.io API failures
5. **Add Logging**: Add comprehensive logging for debugging

## Usage Examples

### Block a User (Admin)
```javascript
await fetch('/api/user/block', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    reason: 'Inappropriate behavior',
    blockedBy: 'admin456'
  })
});
```

### Ban a User from Room (Host)
```javascript
await fetch('/api/room/ban', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    callId: 'call456',
    hostId: 'host789',
    reason: 'Disruptive behavior'
  })
});
```

### Unblock a User (Admin)
```javascript
await fetch('/api/user/unblock', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    unblockedBy: 'admin456'
  })
});
``` 