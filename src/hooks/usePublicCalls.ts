import { useEffect, useState } from 'react';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';

export const usePublicCalls = () => {
  const client = useStreamVideoClient();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    let timeout: NodeJS.Timeout;

    const fetchCalls = async () => {
      try {
        const { calls } = await client.queryCalls({
            filter_conditions: {
                "custom.availability": "public",
                "custom.hostJoined": true,
                "custom.quizStarted": false,
              },
              sort: [{ field: "created_at", direction: -1 }],
              limit: 30,
        });
        await Promise.all(
            calls.map(async (c) => {
              try {
                await c.queryMembers({});
              } catch (e) {
                console.error("Failed to query members", e);
              }
            }),
          );
        if (!cancelled) setCalls(calls);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
          timeout = setTimeout(fetchCalls, 5000);
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