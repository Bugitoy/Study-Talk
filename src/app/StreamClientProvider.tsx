'use client';

import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { tokenProvider } from "actions/stream.actions";
import { ReactNode, useEffect, useState, useRef } from 'react';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Loader from "@/components/Loader";
import { useRouter } from 'next/navigation';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
    const [videoClient, setVideoClient] = useState<StreamVideoClient>();
    const { user, isAuthenticated, isLoading } = useKindeBrowserClient();
    const router = useRouter();
    const initializationAttempted = useRef(false);

    useEffect(() => {
       // Don't initialize if still loading or not authenticated
       if (isLoading || !isAuthenticated || !user) {
         initializationAttempted.current = false;
         return;
       }

       // Prevent multiple initialization attempts
       if (initializationAttempted.current) return;
       initializationAttempted.current = true;

       if (!apiKey) {
         console.error('Stream API key missing');
         return;
       }

       // Ensure user ID is properly formatted and consistent
       const userId = user.id?.toString();
       if (!userId) {
         console.error('User ID is missing or invalid:', user);
         initializationAttempted.current = false;
         return;
       }

       // Validate user ID format (should be a non-empty string)
       if (userId.trim() === '') {
         console.error('User ID is empty after trimming:', userId);
         initializationAttempted.current = false;
         return;
       }

       // Test token provider before initializing client
       const testTokenProvider = async () => {
         try {
           const token = await tokenProvider();
           return true;
         } catch (error) {
           console.error('Token provider test failed:', error);
           return false;
         }
       };

       testTokenProvider().then((success) => {
         if (!success) {
           console.error('Token provider test failed, not initializing Stream client');
           initializationAttempted.current = false;
           return;
         }

         try {
           const client = new StreamVideoClient({
            apiKey,
            user:{
                id: userId,
                name: user.given_name && user.family_name ? `${user.given_name} ${user.family_name}` : userId,
                image: user.picture || undefined,
            },
             tokenProvider,
           })
            // Expose for debugging in browser console
            if (typeof window !== 'undefined') {
              (window as any).streamVideoClient = client;
            }
            setVideoClient(client);
          } catch (error) {
            console.error('Error initializing Stream client:', error);
            initializationAttempted.current = false;
          }
       });
    }, [user, isAuthenticated, isLoading]);

    // Reset initialization flag when user changes
    useEffect(() => {
      if (!user) {
        initializationAttempted.current = false;
      }
    }, [user]);

    // For unauthenticated users, just show loading or render children
    // The middleware will handle redirects for protected routes
    if (!isLoading && !isAuthenticated) {
        return <>{children}</>;
    }

    if (!videoClient) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader fullScreen={false} className="w-8 h-8 text-orange-500" />
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