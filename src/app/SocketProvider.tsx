'use client';  

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

interface SocketContextType {
  socket: Socket | null;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useKindeBrowserClient();

  useEffect(() => {
    // const socketInstance = io("http://localhost:3005");  for different server websocket url
    if (user?.given_name === undefined) return;
    if (user?.given_name) {
        const socketInstance = io(BACKEND_URL, {
            transports: ['websocket'],
            auth: { username: user.given_name }
        }); 
        socketInstance.on("connect", () => {
          // Socket connected successfully
        });
      
        socketInstance.on("connect_error", (err) => {
          console.error("❌ React App Error:", err.message);
        });
        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
            setSocket(null);
        };
    } else {
        router.push('/meetups/talk');
    }
  }, [user, isAuthenticated, isLoading]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): Socket|null => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context.socket;
};