# Stream.io Duration-Based Study Session Tracking

This implementation uses Stream.io's built-in call duration as the primary source for tracking study sessions, providing more accurate and reliable timing data.

## Overview

The system now uses Stream.io's server-side call duration tracking instead of relying solely on client-side timers. This approach provides several benefits:

- **More Accurate**: Server-side duration tracking eliminates client-side timing issues
- **Reliable**: Works even if clients disconnect unexpectedly
- **Consistent**: All participants get the same duration data
- **Fallback Support**: Falls back to client-side timing if Stream.io data is unavailable

## Architecture

### 1. Primary API Endpoint
- **Route**: `/api/study-sessions/stream-duration`
- **Purpose**: Handles study session start/end with Stream.io duration integration
- **Features**:
  - Fetches call duration from Stream.io API
  - Converts seconds to minutes for database storage
  - Falls back to manual calculation if Stream.io data unavailable

### 2. Utility Functions
- **File**: `src/lib/stream-duration-utils.ts`
- **Functions**:
  - `getStreamCallDuration(callId)`: Fetches duration from Stream.io
  - `convertStreamDurationToMinutes(seconds)`: Converts to minutes
  - `getStreamCallDetails(callId)`: Gets full call information
  - `isStreamCallActive(callId)`: Checks if call is still active
  - `getUserActiveCalls(userId)`: Gets user's active calls

### 3. Database Integration
- **Function**: `updateStudySessionWithStreamDuration(userId, callId, durationSeconds)`
- **Purpose**: Updates study sessions with Stream.io duration data
- **Storage**: Duration stored in minutes in the database

### 4. Frontend Hook
- **File**: `src/hooks/useStreamStudyTimeTracker.ts`
- **Purpose**: React hook for Stream.io duration-based tracking
- **Features**:
  - Automatic session start/end
  - Real-time duration updates
  - Fallback to manual tracking if needed

### 5. Webhook Support (Optional)
- **Route**: `/api/webhooks/stream-call-events`
- **Purpose**: Handles Stream.io webhook events for real-time updates
- **Events**: `call.ended`, `call.started`, `call.member_joined`, `call.member_left`

## Implementation Details

### Stream.io Duration Access
```typescript
// Get duration from Stream.io call object
const duration = (call.call as any).duration || 0; // Duration in seconds
```

### Database Schema
The `StudySession` model stores:
- `duration`: Minutes (converted from Stream.io seconds)
- `joinedAt`: Session start time
- `leftAt`: Session end time
- `callId`: Stream.io call identifier

### Fallback Strategy
1. **Primary**: Use Stream.io duration
2. **Fallback**: Manual calculation (end time - start time)
3. **Error Handling**: Log errors and continue with fallback

## Usage

### In Components
```typescript
import { useStreamStudyTimeTracker } from '@/hooks/useStreamStudyTimeTracker';

const { startTracking, endTracking, isTracking, dailyHours } = useStreamStudyTimeTracker(call?.id);

// Start tracking when call is joined
useEffect(() => {
  if (callingState === CallingState.JOINED && call?.id) {
    startTracking();
  }
}, [callingState, call?.id]);

// End tracking on unmount
useEffect(() => {
  return () => {
    if (isTracking) {
      endTracking();
    }
  };
}, []);
```

### API Calls
```typescript
// Start session
await fetch('/api/study-sessions/stream-duration', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    callId: call.id,
    action: 'start',
  }),
});

// End session (uses Stream.io duration)
await fetch('/api/study-sessions/stream-duration', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    callId: call.id,
    action: 'end',
  }),
});
```

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_SECRET_KEY=your_stream_secret_key
```

### Webhook Setup (Optional)
To enable webhook-based tracking:

1. Configure Stream.io webhooks to point to `/api/webhooks/stream-call-events`
2. Enable events: `call.ended`, `call.started`, `call.member_joined`, `call.member_left`
3. Add webhook signature verification if needed

## Benefits

### Accuracy
- Server-side duration eliminates client-side timing drift
- Handles network interruptions gracefully
- Consistent across all participants

### Reliability
- Works even if client disconnects unexpectedly
- No dependency on client-side JavaScript timing
- Automatic fallback to manual calculation

### Performance
- Reduces client-side processing
- Leverages Stream.io's optimized duration tracking
- Minimal API calls for duration data

## Migration from Manual Tracking

The system maintains backward compatibility:

1. **Existing Sessions**: Continue to work with manual duration calculation
2. **New Sessions**: Use Stream.io duration as primary source
3. **Mixed Approach**: Can use both methods simultaneously

## Monitoring and Debugging

### Logs
- Stream.io API calls are logged with duration data
- Fallback scenarios are logged for debugging
- Webhook events are logged for monitoring

### Error Handling
- Graceful fallback to manual calculation
- Detailed error logging for troubleshooting
- No impact on user experience during errors

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live duration updates
2. **Analytics**: Detailed call analytics using Stream.io data
3. **Multi-call Support**: Handle users in multiple simultaneous calls
4. **Advanced Webhooks**: More sophisticated webhook event handling
5. **Duration Validation**: Cross-check Stream.io and client-side durations

## Troubleshooting

### Common Issues

1. **Duration Not Available**
   - Check Stream.io API credentials
   - Verify call exists in Stream.io
   - Check webhook configuration

2. **Fallback to Manual Calculation**
   - Normal behavior when Stream.io data unavailable
   - Check logs for specific error messages

3. **Webhook Not Working**
   - Verify webhook URL is accessible
   - Check Stream.io webhook configuration
   - Review webhook signature verification

### Debug Commands
```typescript
// Check Stream.io call duration
const duration = await getStreamCallDuration(callId);
console.log('Call duration:', duration, 'seconds');

// Check if call is active
const isActive = await isStreamCallActive(callId);
console.log('Call active:', isActive);
``` 