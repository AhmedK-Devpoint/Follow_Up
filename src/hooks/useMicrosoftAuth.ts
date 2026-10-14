import {
  BrowserAuthError,
  InteractionRequiredAuthError,
  InteractionStatus,
  type AccountInfo,
} from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { useCallback, useEffect, useState } from 'react';
import { loginRequest } from '../authConfig';
import { describeError, type UserFacingError } from '../services/errors';

const POPUP_BLOCKED = new Set(['popup_window_error', 'empty_window_error']);

function isPopupBlocked(error: unknown): boolean {
  return error instanceof BrowserAuthError && POPUP_BLOCKED.has(error.errorCode);
}

export interface MicrosoftAuth {
  account: AccountInfo | null;
  /** MSAL termine une opération (démarrage, retour de redirection, connexion…). */
  busy: boolean;
  /** Démarrage de MSAL : la session existante n'est pas encore connue. */
  starting: boolean;
  error: UserFacingError | null;
  clearError: () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Jeton d'accès Microsoft Graph : silencieux si possible, interactif sinon. */
  getToken: () => Promise<string>;
}

export function useMicrosoftAuth(): MicrosoftAuth {
  const { instance, accounts, inProgress } = useMsal();
  const [error, setError] = useState<UserFacingError | null>(null);
  const account = instance.getActiveAccount() ?? accounts[0] ?? null;

  // Session existante (onglet rechargé) : on la réactive comme compte courant.
  useEffect(() => {
    if (!instance.getActiveAccount() && accounts.length > 0) instance.setActiveAccount(accounts[0]);
  }, [instance, accounts]);

  const signIn = useCallback(async () => {
    setError(null);
    try {
      const result = await instance.loginPopup({ ...loginRequest, prompt: 'select_account' });
      instance.setActiveAccount(result.account);
    } catch (err) {
      if (isPopupBlocked(err)) {
        // Popups bloquées : on bascule sur une redirection pleine page.
        await instance.loginRedirect(loginRequest);
        return;
      }
      const described = describeError(err);
      if (described.kind !== 'cancelled') setError(described);
    }
  }, [instance]);

  const signOut = useCallback(async () => {
    setError(null);
    const current = instance.getActiveAccount() ?? undefined;
    try {
      await instance.logoutPopup({ account: current });
    } catch (err) {
      if (isPopupBlocked(err)) {
        await instance.logoutRedirect({ account: current });
        return;
      }
      const described = describeError(err);
      if (described.kind !== 'cancelled') setError(described);
    }
  }, [instance]);

  const getToken = useCallback(async () => {
    const current = instance.getActiveAccount();
    if (!current) throw new InteractionRequiredAuthError('no_account', 'Aucun compte connecté.');
    try {
      const result = await instance.acquireTokenSilent({ ...loginRequest, account: current });
      return result.accessToken;
    } catch (err) {
      if (!(err instanceof InteractionRequiredAuthError)) throw err;
      try {
        const result = await instance.acquireTokenPopup({ ...loginRequest, account: current });
        return result.accessToken;
      } catch (popupError) {
        if (isPopupBlocked(popupError)) await instance.acquireTokenRedirect({ ...loginRequest, account: current });
        throw popupError;
      }
    }
  }, [instance]);

  return {
    account,
    busy: inProgress !== InteractionStatus.None,
    starting: inProgress === InteractionStatus.Startup || inProgress === InteractionStatus.HandleRedirect,
    error,
    clearError: useCallback(() => setError(null), []),
    signIn,
    signOut,
    getToken,
  };
}
