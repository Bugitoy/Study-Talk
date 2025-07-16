'use client';
import { useEffect, useState } from 'react';

export interface CompeteRoom {
  callId: string;
  roomName: string;
  members: string[]; // avatar urls
}

export function useCompeteRooms() {
  const [rooms, setRooms] = useState<CompeteRoom[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/compete-rooms');
        if (res.ok) {
          const data = await res.json();
          setRooms(data);
        }
      } catch (err) {
        console.error('Failed to fetch compete rooms', err);
      }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  return rooms;
} 