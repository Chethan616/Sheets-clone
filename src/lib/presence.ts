import {
  ref,
  onValue,
  onDisconnect,
  set,
  remove,
  serverTimestamp,
  off,
} from 'firebase/database';
import { rtdb as _rtdb } from './firebase';
import type { UserPresence } from './types';

const rtdb = _rtdb!;

export function setupPresence(
  docId: string,
  user: { uid: string; displayName: string; color: string; photoURL: string | null }
): () => void {
  const presenceRef = ref(rtdb, `presence/${docId}/${user.uid}`);
  const connectedRef = ref(rtdb, '.info/connected');

  const presenceData: UserPresence = {
    uid: user.uid,
    displayName: user.displayName,
    color: user.color,
    photoURL: user.photoURL,
    activeCell: null,
    online: true,
    lastSeen: Date.now(),
  };

  const handleConnected = (snap: { val: () => boolean }) => {
    if (snap.val() === true) {
      // Set presence on connect
      set(presenceRef, presenceData);
      // Remove presence on disconnect
      onDisconnect(presenceRef).remove();
    }
  };

  onValue(connectedRef, handleConnected);

  // Cleanup function
  return () => {
    off(connectedRef, 'value', handleConnected);
    remove(presenceRef);
  };
}

export function updateActiveCell(
  docId: string,
  userId: string,
  cellId: string | null
): void {
  const cellRef = ref(rtdb, `presence/${docId}/${userId}/activeCell`);
  set(cellRef, cellId);
}

export function subscribeToPresence(
  docId: string,
  callback: (users: UserPresence[]) => void
): () => void {
  const presenceRef = ref(rtdb, `presence/${docId}`);

  const handler = (snap: { val: () => Record<string, UserPresence> | null }) => {
    const data = snap.val();
    if (!data) {
      callback([]);
      return;
    }
    const users = Object.values(data).filter((u) => u.online);
    callback(users);
  };

  onValue(presenceRef, handler);

  return () => {
    off(presenceRef, 'value', handler);
  };
}
