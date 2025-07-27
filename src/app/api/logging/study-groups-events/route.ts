import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

// Server-side logging utility for study-groups events
const logStudyGroupsEvent = (event: string, details: any, userId: string) => {
  const timestamp = new Date().toISOString();
  console.log(`[STUDY_GROUPS_SERVER] ${timestamp} - ${event}:`, {
    ...details,
    timestamp,
    userId,
    environment: process.env.NODE_ENV
  });
};

export async function POST(req: NextRequest) {
  try {
    // Get user session for authentication
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { event, details, timestamp, userId } = body;

    // Validate required fields
    if (!event || !details) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Log the event securely on the server
    logStudyGroupsEvent(event, details, userId);

    return NextResponse.json({ success: true });

  } catch (error) {
    // Don't expose internal errors to client
    console.error('Error logging study-groups event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 