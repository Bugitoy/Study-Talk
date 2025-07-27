# Webhook Performance Optimization

## Overview

The webhook logging system has been optimized to significantly reduce performance impact while maintaining functionality. This optimization addresses the issue where extensive logging was causing performance degradation when users enter call rooms or meeting rooms.

## Changes Made

### 1. Conditional Debug Logging

**Before:**
```typescript
console.log('=== WEBHOOK RECEIVED ===');
console.log('Headers:', Object.fromEntries(req.headers.entries()));
console.log('Stream.io webhook received:', JSON.stringify(body, null, 2));
```

**After:**
```typescript
const isDebugMode = process.env.NODE_ENV === 'development' || process.env.STREAM_WEBHOOK_DEBUG === 'true';

if (isDebugMode) {
  console.log('Webhook received:', body.type);
}
```

### 2. Environment Variable Control

Add to your `.env` file to enable verbose logging when needed:
```env
STREAM_WEBHOOK_DEBUG=true
```

### 3. Optimized Files

The following files have been optimized:

- `src/app/api/webhooks/stream-call-events/route.ts`
- `src/app/api/study-sessions/stream-duration/route.ts`
- `src/lib/stream-duration-utils.ts`
- `src/lib/db-utils.ts`

### 4. Performance Improvements

#### Reduced Logging Volume
- **Before**: ~50+ log statements per webhook event
- **After**: ~5-10 log statements per webhook event (in debug mode only)

#### Eliminated Verbose Operations
- Removed full header logging (`Object.fromEntries(req.headers.entries())`)
- Removed complete payload logging (`JSON.stringify(body, null, 2)`)
- Removed detailed error object logging
- Removed redundant database query logging

#### Conditional Debug Mode
- Production: Minimal logging (errors only)
- Development: Full debug logging
- Manual override: `STREAM_WEBHOOK_DEBUG=true`

## Benefits

### 1. Performance
- **Reduced CPU usage** during webhook processing
- **Faster response times** for webhook endpoints
- **Lower memory usage** from reduced string operations

### 2. Maintainability
- **Cleaner logs** in production
- **Easy debugging** when needed via environment variable
- **Preserved functionality** while reducing noise

### 3. Scalability
- **Better handling** of high webhook volumes
- **Reduced I/O** operations
- **Lower resource consumption**

## Usage

### Production (Default)
No additional configuration needed. Only error logs will be displayed.

### Development
Debug logs are automatically enabled in development mode.

### Manual Debug Mode
To enable verbose logging in any environment:
```bash
# Add to .env file
STREAM_WEBHOOK_DEBUG=true
```

## Monitoring

### Error Logging
All error conditions are still logged regardless of debug mode:
- Database errors
- Stream.io API errors
- Invalid webhook payloads
- Authentication failures

### Performance Monitoring
Monitor these metrics to verify improvements:
- Webhook response times
- CPU usage during webhook processing
- Memory usage
- Database query performance

## Migration Notes

### Backward Compatibility
- All existing functionality is preserved
- No breaking changes to webhook processing
- Database operations remain unchanged

### Debugging
When debugging webhook issues:
1. Set `STREAM_WEBHOOK_DEBUG=true` in your environment
2. Restart the application
3. Reproduce the issue
4. Check logs for detailed information

## Future Enhancements

### 1. Structured Logging
Consider implementing structured logging for better log analysis:
```typescript
console.log(JSON.stringify({
  level: 'info',
  event: 'webhook_received',
  type: body.type,
  timestamp: new Date().toISOString()
}));
```

### 2. Log Levels
Implement proper log levels (ERROR, WARN, INFO, DEBUG):
```typescript
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}
```

### 3. Metrics Collection
Add performance metrics collection:
- Webhook processing time
- Database operation duration
- Stream.io API response times

## Troubleshooting

### Issue: Missing Debug Information
**Solution**: Enable debug mode by setting `STREAM_WEBHOOK_DEBUG=true`

### Issue: Still Too Much Logging
**Solution**: Check if you're in development mode or have debug enabled

### Issue: Performance Still Poor
**Solution**: 
1. Check if debug mode is accidentally enabled in production
2. Monitor database query performance
3. Verify Stream.io API response times

## Conclusion

These optimizations provide a significant performance improvement while maintaining full functionality and debugging capabilities. The webhook system now scales better and provides a cleaner production environment while preserving the ability to debug issues when needed. 