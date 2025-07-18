# Starting the Supabase Migration

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project called "thanodi-platform"
3. Note down your project URL and API keys

## Step 2: Install Supabase Dependencies

```bash
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs
npm install @supabase/auth-ui-react
npm install @supabase/auth-ui-shared
```

## Step 3: Update Environment Variables

Replace your current `.env` file:

```env
# Remove MongoDB URL
# DATABASE_URL=mongodb://...

# Add Supabase URLs
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Keep other variables
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
# ... other existing variables
```

## Step 4: Create Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations
export const createServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

## Step 5: Create Database Schema

Run this SQL in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  customer_id TEXT UNIQUE,
  university TEXT,
  university_verified_at TIMESTAMP WITH TIME ZONE,
  university_change_count INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'premium')),
  period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study group rooms
CREATE TABLE public.study_group_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id TEXT UNIQUE NOT NULL,
  room_name TEXT NOT NULL,
  host_id UUID REFERENCES public.profiles(id),
  ended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create compete rooms
CREATE TABLE public.compete_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id TEXT UNIQUE NOT NULL,
  room_name TEXT NOT NULL,
  host_id UUID REFERENCES public.profiles(id),
  ended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study sessions
CREATE TABLE public.study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  call_id TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, call_id, date)
);

-- Create indexes
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_call_id ON public.study_sessions(call_id);
CREATE INDEX idx_study_sessions_date ON public.study_sessions(date);

-- Create universities table
CREATE TABLE public.universities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  domain TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  confession_count INTEGER DEFAULT 0,
  student_count INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create confessions table
CREATE TABLE public.confessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id),
  university_id UUID REFERENCES public.universities(id),
  is_anonymous BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  hot_score INTEGER DEFAULT 0,
  believe_count INTEGER DEFAULT 0,
  doubt_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  saved_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create confession votes
CREATE TABLE public.confession_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  confession_id UUID REFERENCES public.confessions(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('BELIEVE', 'DOUBT')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, confession_id)
);

-- Create confession comments
CREATE TABLE public.confession_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id),
  confession_id UUID REFERENCES public.confessions(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.confession_comments(id),
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved confessions
CREATE TABLE public.saved_confessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  confession_id UUID REFERENCES public.confessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, confession_id)
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id),
  reported_id UUID REFERENCES public.profiles(id),
  call_id TEXT,
  reason TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('INAPPROPRIATE_BEHAVIOR', 'SPAM', 'HARASSMENT', 'OTHER')),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED', 'DISMISSED')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Step 6: Create Auth Hook

Create `src/hooks/useSupabaseAuth.ts`:

```typescript
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

export function useSupabaseAuth() {
  const user = useUser()
  const supabase = useSupabaseClient()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // Fetch user profile
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
        } else {
          setProfile(data)
        }
        setLoading(false)
      }

      fetchProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user, supabase])

  return {
    user: user ? { ...user, ...profile } : null,
    loading,
    supabase
  }
}
```

## Step 7: Update One API Route as Example

Update `src/app/api/study-groups/route.ts`:

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch study groups
    const { data, error } = await supabase
      .from('study_group_rooms')
      .select(`
        *,
        profiles:host_id (
          id,
          name,
          email,
          image
        )
      `)
      .eq('ended', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { callId, roomName } = body

    // Create new study group room
    const { data, error } = await supabase
      .from('study_group_rooms')
      .insert({
        call_id: callId,
        room_name: roomName,
        host_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## Step 8: Test the Migration

1. Start your development server:
```bash
npm run dev
```

2. Test the study groups API:
```bash
curl http://localhost:8080/api/study-groups
```

3. Check Supabase dashboard to see if data is being created

## Next Steps

1. **Migrate authentication** - Replace Kinde Auth with Supabase Auth
2. **Update all API routes** - Convert from Prisma to Supabase
3. **Add real-time features** - Implement live updates
4. **Test thoroughly** - Ensure all functionality works
5. **Deploy to production** - Update environment variables

## Benefits You'll See Immediately

- **Faster queries** - PostgreSQL is much faster than MongoDB for your use case
- **Better TypeScript support** - Auto-generated types from Supabase
- **Real-time capabilities** - Live updates without polling
- **Cost savings** - Significant reduction in monthly costs
- **Better security** - Row Level Security built-in

Would you like me to help you implement any specific part of this migration? 