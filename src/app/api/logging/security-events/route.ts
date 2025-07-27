import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event, timestamp, data, userAgent, url } = body;

    // Validate required fields
    if (!event || !timestamp || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Log security event to server console (in production, this would go to a proper logging service)
    console.log('🔒 SECURITY EVENT:', {
      event,
      timestamp,
      userId: user.id,
      userEmail: user.email,
      data,
      userAgent,
      url,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    });

    // In a production environment, you would:
    // 1. Send to a logging service (e.g., LogRocket, Sentry, DataDog)
    // 2. Store in a database for audit trails
    // 3. Send alerts for critical security events
    // 4. Rate limit this endpoint to prevent abuse

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log security event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 