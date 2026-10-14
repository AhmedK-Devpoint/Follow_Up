import { useEffect, useState } from 'react';
import { describeError, type UserFacingError } from '../services/errors';

export type BodyLoader = (messageId: string) => Promise<string>;

type BodyState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; text: string }
  | { status: 'error'; error: UserFacingError };

/** Charge à la demande le corps d'un email (gardé en mémoire uniquement, jamais stocké). */
export function useMessageBody(loadBody: BodyLoader | undefined, messageId: string | undefined): BodyState {
  const [state, setState] = useState<BodyState>({ status: 'idle' });

  useEffect(() => {
    if (!loadBody || !messageId) {
      setState({ status: 'idle' });
      return;
    }
    let cancelled = false;
    setState({ status: 'loading' });
    loadBody(messageId).then(
      (text) => !cancelled && setState({ status: 'ready', text }),
      (error: unknown) => !cancelled && setState({ status: 'error', error: describeError(error) }),
    );
    return () => {
      cancelled = true;
    };
  }, [loadBody, messageId]);

  return state;
}
