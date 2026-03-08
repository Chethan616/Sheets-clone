'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { setupPresence, updateActiveCell, subscribeToPresence } from '@/lib/presence';
import type { UserPresence } from '@/lib/types';

export function usePresence(
  docId: string | undefined,
  user: { uid: string; displayName: string; color: string; photoURL: string | null } | null
) {
  const [users, setUsers] = useState<UserPresence[]>([]);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!docId || !user) return;

    // Setup my presence
    cleanupRef.current = setupPresence(docId, user);

    // Subscribe to all users
    const unsubPresence = subscribeToPresence(docId, (presentUsers) => {
      // Filter out self
      setUsers(presentUsers.filter((u) => u.uid !== user.uid));
    });

    return () => {
      cleanupRef.current?.();
      unsubPresence();
    };
  }, [docId, user]);

  const setActiveCell = useCallback(
    (cellId: string | null) => {
      if (docId && user) {
        updateActiveCell(docId, user.uid, cellId);
      }
    },
    [docId, user]
  );

  return { users, setActiveCell };
}
