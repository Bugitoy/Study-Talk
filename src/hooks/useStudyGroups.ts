'use client';
import { useEffect, useState } from 'react';

export interface StudyGroup {
  callId: string;
  roomName: string;
  members: string[]; // avatar urls
}

export function useStudyGroups() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/study-groups');
        if (res.ok) {
          const data = await res.json();
          setGroups(data);
        }
      } catch (err) {
        console.error('Failed to fetch study groups', err);
      }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  return groups;
}