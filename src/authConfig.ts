import { EventType, PublicClientApplication, type AuthenticationResult } from '@azure/msal-browser';

const clientId = import.meta.env.VITE_MS_CLIENT_ID ?? '';
const tenantId = import.meta.env.VITE_MS_TENANT_ID ?? '';

/**
 * MSAL v5 exige que l'URI de redirection pointe vers le « pont de redirection »
 * (redirect.html), qui renvoie la réponse de Microsoft à la fenêtre principale.
 * Cette URI doit être déclarée à l'identique dans Microsoft Entra ID (plateforme SPA).
 */
const redirectUri = import.meta.env.VITE_MS_REDIRECT_URI || `${window.location.origin}/redirect.html`;

/** Faux si le fichier .env est incomplet : la connexion Microsoft est alors désactivée. */
export const isAuthConfigured = clientId.trim() !== '' && tenantId.trim() !== '';

export const msalInstance = new PublicClientApplication({
  auth: {
    // Valeur factice si la configuration manque, pour que l'application reste utilisable en démo.
    clientId: isAuthConfigured ? clientId : '00000000-0000-0000-0000-000000000000',
    authority: `https://login.microsoftonline.com/${tenantId || 'common'}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    // Les jetons disparaissent à la fermeture de l'onglet.
    cacheLocation: 'sessionStorage',
  },
});

// Le compte actif est celui utilisé pour les appels Graph.
msalInstance.addEventCallback((event) => {
  if (
    (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) &&
    event.payload
  ) {
    const { account } = event.payload as AuthenticationResult;
    if (account) msalInstance.setActiveAccount(account);
  }
});

/**
 * Lien à transmettre à un administrateur Microsoft 365 lorsque l'organisation interdit
 * le consentement par les utilisateurs : il accorde les autorisations déclarées
 * dans l'inscription de l'application (User.Read, Mail.Read) pour toute l'organisation.
 */
const consentTenant = ['common', 'consumers'].includes(tenantId) ? 'organizations' : tenantId;

export const adminConsentUrl = isAuthConfigured
  ? `https://login.microsoftonline.com/${encodeURIComponent(consentTenant)}/adminconsent?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}`
  : null;

/** Autorisations déléguées en lecture seule : aucun email n'est modifié sur le serveur. */
export const loginRequest = {
  scopes: ['User.Read', 'Mail.Read'],
};
