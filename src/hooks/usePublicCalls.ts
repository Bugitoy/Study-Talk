import { useEffect, useRef, useState } from 'react';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';

export const usePublicCalls = () => {
  const client = useStreamVideoClient();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const loadedMembers = useRef(new Set<string>());

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    let timeout: NodeJS.Timeout;

    const fetchCalls = async () => {
      try {
        const { calls } = await client.queryCalls({
            filter_conditions: {
                'custom.availability': 'public',
                'custom.quizStarted': false,
              },
              sort: [{ field: 'created_at', direction: -1 }],
              limit: 30,
            });
            for (const c of calls) {
              if (!loadedMembers.current.has(c.id)) {
                try {
                  await c.queryMembers({});
                } catch (e) {
                  console.error('Failed to query members', e);
                }
                loadedMembers.current.add(c.id);
              }
            }
        if (!cancelled) setCalls(calls);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
          timeout = setTimeout(fetchCalls, 15000);
        }
      }
    };

    fetchCalls();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [client]);

  return { calls, loading };
};