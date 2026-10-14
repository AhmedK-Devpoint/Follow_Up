import { useCallback, useEffect, useRef, useState } from 'react';
import { describeError, type UserFacingError } from '../services/errors';
import { fetchMessages } from '../services/graph';
import type { OutlookMessage } from '../types/followUp';

export interface OutlookMessagesState {
  status: 'loading' | 'ready' | 'error';
  messages: OutlookMessage[];
  error: UserFacingError | null;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
  reload: () => void;
}

/** Emails Outlook paginés, du plus récent au plus ancien. Lecture seule. */
export function useOutlookMessages(getToken: () => Promise<string>): OutlookMessagesState {
  const [status, setStatus] = useState<OutlookMessagesState['status']>('loading');
  const [messages, setMessages] = useState<OutlookMessage[]>([]);
  const [nextLink, setNextLink] = useState<string>();
  const [error, setError] = useState<UserFacingError | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  // Ignore les réponses d'un chargement remplacé par un plus récent.
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    const id = ++requestId.current;
    setStatus('loading');
    setError(null);
    try {
      const page = await fetchMessages(await getToken());
      if (id !== requestId.current) return;
      setMessages(page.messages);
      setNextLink(page.nextLink);
      setStatus('ready');
    } catch (err) {
      if (id !== requestId.current) return;
      setError(describeError(err));
      setStatus('error');
    }
  }, [getToken]);

  const loadMore = useCallback(async () => {
    if (!nextLink || loadingMore) return;
    const id = requestId.current;
    setLoadingMore(true);
    try {
      const page = await fetchMessages(await getToken(), nextLink);
      if (id !== requestId.current) return;
      setMessages((current) => {
        const known = new Set(current.map((m) => m.id));
        return [...current, ...page.messages.filter((m) => !known.has(m.id))];
      });
      setNextLink(page.nextLink);
    } catch (err) {
      if (id === requestId.current) setError(describeError(err));
    } finally {
      if (id === requestId.current) setLoadingMore(false);
    }
  }, [getToken, nextLink, loadingMore]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    status,
    messages,
    error,
    hasMore: Boolean(nextLink),
    loadingMore,
    loadMore: () => void loadMore(),
    reload: () => void reload(),
  };
}
