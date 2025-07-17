import { useEffect, useState } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

export function useCurrentUser() {
  const { user: authUser, isLoading } = useKindeBrowserClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser?.id) return;
    setLoading(true);
    fetch(`/api/user?userId=${authUser.id}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authUser?.id]);

  return { user, loading: loading || isLoading };
} 