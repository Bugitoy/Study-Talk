# Supabase Migration Plan for Thanodi

## Overview
Migrate from MongoDB (via Prisma) to Supabase PostgreSQL for better performance, real-time features, and built-in authentication.

## Phase 1: Setup Supabase

### 1. Create Supabase Project
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Create new project
supabase projects create thanodi-platform
```

### 2. Install Supabase Client
```bash
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs
npm install @supabase/auth-ui-react
npm install @supabase/auth-ui-shared
```

### 3. Environment Variables
```env
# Replace DATABASE_URL with Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Phase 2: Database Schema Migration

### Current MongoDB Schema → Supabase PostgreSQL

#### 1. Users Table (Replace Kinde Auth)
```sql
-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### 2. Subscriptions Table
```sql
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
```

#### 3. Study Groups & Compete Rooms
```sql
CREATE TABLE public.study_group_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id TEXT UNIQUE NOT NULL,
  room_name TEXT NOT NULL,
  host_id UUID REFERENCES public.profiles(id),
  ended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.compete_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id TEXT UNIQUE NOT NULL,
  room_name TEXT NOT NULL,
  host_id UUID REFERENCES public.profiles(id),
  ended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. Study Sessions
```sql
CREATE TABLE public.study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  call_id TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in minutes
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, call_id, date)
);

-- Indexes for performance
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_call_id ON public.study_sessions(call_id);
CREATE INDEX idx_study_sessions_date ON public.study_sessions(date);
```

#### 5. Confessions System
```sql
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

CREATE TABLE public.confession_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  confession_id UUID REFERENCES public.confessions(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('BELIEVE', 'DOUBT')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, confession_id)
);

CREATE TABLE public.confession_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id),
  confession_id UUID REFERENCES public.confessions(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.confession_comments(id),
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.saved_confessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  confession_id UUID REFERENCES public.confessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, confession_id)
);
```

#### 6. Universities
```sql
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
```

#### 7. Reports System
```sql
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

## Phase 3: Authentication Migration

### Replace Kinde Auth with Supabase Auth

#### 1. Update Auth Provider
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

#### 2. Update Auth Hooks
```typescript
// hooks/useCurrentUser.ts
import { useUser } from '@supabase/auth-helpers-react'

export function useCurrentUser() {
  const { user, loading } = useUser()
  
  return {
    user: user ? {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name,
      image: user.user_metadata?.avatar_url,
      // ... other fields from profiles table
    } : null,
    loading
  }
}
```

## Phase 4: Real-time Features

### 1. Study Group Real-time Updates
```typescript
// hooks/useStudyGroups.ts
import { useSubscription } from '@supabase/supabase-js'

export function useStudyGroups() {
  const [rooms, setRooms] = useState([])
  
  useEffect(() => {
    const subscription = supabase
      .channel('study_groups')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'study_group_rooms' },
        (payload) => {
          // Update rooms in real-time
          setRooms(prev => updateRooms(prev, payload))
        }
      )
      .subscribe()
    
    return () => subscription.unsubscribe()
  }, [])
}
```

### 2. Chat Real-time Messages
```typescript
// hooks/useChat.ts
export function useChat(roomId: string) {
  const [messages, setMessages] = useState([])
  
  useEffect(() => {
    const subscription = supabase
      .channel(`chat:${roomId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()
    
    return () => subscription.unsubscribe()
  }, [roomId])
}
```

## Phase 5: API Routes Migration

### 1. Replace Prisma with Supabase
```typescript
// lib/db-utils.ts
import { supabase } from './supabase'

export async function getStudyGroups() {
  const { data, error } = await supabase
    .from('study_group_rooms')
    .select('*')
    .eq('ended', false)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

### 2. Update API Routes
```typescript
// app/api/study-groups/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { data, error } = await supabase
    .from('study_group_rooms')
    .select('*')
    .eq('ended', false)
  
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
```

## Phase 6: Benefits After Migration

### 1. Performance Improvements
- **Faster queries** with PostgreSQL indexes
- **Real-time updates** without polling
- **Edge functions** for serverless compute
- **CDN** for static assets

### 2. Security Enhancements
- **Row Level Security** for data protection
- **Built-in authentication** with social logins
- **Automatic backups** and point-in-time recovery
- **Audit logs** for compliance

### 3. Developer Experience
- **Auto-generated TypeScript types**
- **Real-time subscriptions** out of the box
- **Built-in file storage**
- **Database dashboard** with real-time monitoring

### 4. Cost Benefits
- **Generous free tier** (500MB database, 50MB file storage)
- **Pay-as-you-grow** pricing
- **No server maintenance** costs

## Migration Timeline

### Week 1: Setup & Schema
- Set up Supabase project
- Create database schema
- Set up authentication

### Week 2: Core Features
- Migrate user authentication
- Update study groups functionality
- Implement real-time features

### Week 3: Advanced Features
- Migrate confessions system
- Update API routes
- Test real-time functionality

### Week 4: Testing & Deployment
- Comprehensive testing
- Performance optimization
- Deploy to production

## Estimated Cost Savings

### Current MongoDB Setup:
- MongoDB Atlas: ~$15-30/month
- Kinde Auth: ~$25/month
- Additional services: ~$20/month
- **Total: ~$60-75/month**

### Supabase Setup:
- Supabase Pro: $25/month (includes everything)
- **Total: $25/month**
- **Savings: ~$35-50/month**

## Next Steps

1. **Create Supabase project** and set up environment
2. **Migrate database schema** using the SQL provided
3. **Update authentication** to use Supabase Auth
4. **Implement real-time features** for better UX
5. **Test thoroughly** before production deployment

Would you like me to help you start the migration process? 