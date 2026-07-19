import { useEffect, useState } from 'react';
import { subscribe, getUnread } from './chatStore.js';

/** Live unread count for a conversation (re-renders on change). */
export function useUnread(id) {
  const [n, setN] = useState(() => (id ? getUnread(id) : 0));
  useEffect(() => {
    if (!id) return undefined;
    setN(getUnread(id));
    return subscribe(id, () => setN(getUnread(id)));
  }, [id]);
  return n;
}
