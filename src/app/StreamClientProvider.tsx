'use client';

import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { tokenProvider } from "actions/stream.actions";
import { ReactNode, useEffect, useState } from 'react';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
    const [videoClient, setVideoClient] = useState<StreamVideoClient>();
    const { user, isAuthenticated, isLoading } = useKindeBrowserClient();
    const router = useRouter();

    useEffect(() => {
       if (isLoading || !isAuthenticated || !user) return;
       if (!apiKey) throw new Error('Stream API key missing');

       const client = new StreamVideoClient({
        apiKey,
        user:{
            id: user.id,
            name: user.given_name && user.family_name ? `${user.given_name} ${user.family_name}` : user.id,
            image: user.picture || undefined,
        },
         tokenProvider,
       })
        // Expose for debugging in browser console
        if (typeof window !== 'undefined') {
          (window as any).streamVideoClient = client;
        }
        setVideoClient(client);
    }, [user, isAuthenticated, isLoading]);

    // Redirect unauthenticated users to Kinde login page
    if (!isLoading && !isAuthenticated) {
        router.push('/api/auth/login');
        // Optionally render a fallback while redirecting
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <span className="ml-2 text-gray-600">Redirecting to login...</span>
            </div>
        );
    }

    if (!videoClient) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <span className="ml-2 text-gray-600">Loading video client...</span>
            </div>
        );
    }

    return (
    <StreamVideo client={videoClient}>
        {children}
    </StreamVideo>
  );
};

export default StreamVideoProvider;