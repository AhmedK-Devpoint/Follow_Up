import { AuthError } from '@azure/msal-browser';
import { GraphError } from './graph';

export type ErrorKind = 'cancelled' | 'consent' | 'config' | 'popup' | 'session' | 'network' | 'generic';

export interface UserFacingError {
  kind: ErrorKind;
  title: string;
  message: string;
  /** Code technique (AADSTS…, code MSAL ou Graph) utile au support, sans donnée personnelle. */
  code?: string;
}

const ADMIN_CONSENT_HELP =
  "Un administrateur Microsoft 365 de votre organisation doit l'autoriser : envoyez-lui le lien de consentement " +
  "(bouton ci-dessous), ou demandez-lui d'ouvrir Microsoft Entra ID › Inscriptions d'applications › Follow-up Manager › " +
  "Autorisations de l'API › « Accorder un consentement d'administrateur ».";

/** Codes d'erreur Microsoft Entra ID (AADSTS) les plus fréquents pour une SPA. */
const ENTRA_ERRORS: Record<string, Omit<UserFacingError, 'code'>> = {
  '65001': {
    kind: 'consent',
    title: 'Autorisation requise',
    message: `L'accès à vos emails n'a pas encore été autorisé. ${ADMIN_CONSENT_HELP}`,
  },
  '65004': {
    kind: 'consent',
    title: 'Autorisation refusée',
    message: `L'accès à vos emails n'a pas été accordé, l'application ne peut donc pas les lire. ${ADMIN_CONSENT_HELP}`,
  },
  '90094': {
    kind: 'consent',
    title: "Consentement d'un administrateur requis",
    message: `Votre organisation n'autorise pas les utilisateurs à approuver eux-mêmes cette application. ${ADMIN_CONSENT_HELP}`,
  },
  '90095': {
    kind: 'consent',
    title: "Consentement d'un administrateur requis",
    message: `Une demande d'approbation peut être envoyée à votre administrateur. ${ADMIN_CONSENT_HELP}`,
  },
  '50011': {
    kind: 'config',
    title: 'URI de redirection non autorisée',
    message:
      "L'adresse de retour de l'application n'est pas déclarée dans Microsoft Entra ID. Ajoutez exactement " +
      `« ${window.location.origin}/redirect.html » dans Authentification › Application monopage (SPA).`,
  },
  '9002326': {
    kind: 'config',
    title: 'Type de plateforme incorrect',
    message:
      "L'URI de redirection doit être déclarée sous la plateforme « Application monopage (SPA) » et non « Web » " +
      'dans Microsoft Entra ID › Authentification.',
  },
  '50020': {
    kind: 'config',
    title: "Compte non autorisé dans ce répertoire",
    message:
      "Ce compte n'appartient pas à l'organisation configurée pour l'application. Connectez-vous avec un compte " +
      "professionnel de cette organisation, ou modifiez les « Types de comptes pris en charge » de l'application.",
  },
  '700016': {
    kind: 'config',
    title: 'Application introuvable',
    message:
      "L'identifiant d'application (client) ne correspond à aucune application de ce répertoire. Vérifiez " +
      'VITE_MS_CLIENT_ID et VITE_MS_TENANT_ID dans le fichier .env.',
  },
  '90002': {
    kind: 'config',
    title: 'Répertoire introuvable',
    message: "L'identifiant de répertoire (tenant) est invalide. Vérifiez VITE_MS_TENANT_ID dans le fichier .env.",
  },
  '50105': {
    kind: 'consent',
    title: 'Accès non attribué',
    message: "Votre compte n'a pas été autorisé à utiliser cette application. Contactez votre administrateur.",
  },
};

const MSAL_ERRORS: Record<string, Omit<UserFacingError, 'code'>> = {
  user_cancelled: {
    kind: 'cancelled',
    title: 'Connexion annulée',
    message: 'La fenêtre de connexion a été fermée avant la fin.',
  },
  popup_window_error: {
    kind: 'popup',
    title: 'Fenêtre de connexion bloquée',
    message: 'Votre navigateur a bloqué la fenêtre de connexion. Autorisez les popups pour ce site, puis réessayez.',
  },
  empty_window_error: {
    kind: 'popup',
    title: 'Fenêtre de connexion bloquée',
    message: 'La fenêtre de connexion n’a pas pu s’ouvrir. Autorisez les popups pour ce site, puis réessayez.',
  },
  interaction_in_progress: {
    kind: 'generic',
    title: 'Connexion déjà en cours',
    message: 'Une connexion est déjà en cours dans une autre fenêtre. Terminez-la ou fermez-la, puis réessayez.',
  },
  redirect_bridge_timeout: {
    kind: 'config',
    title: 'Délai de connexion dépassé',
    message:
      "La réponse de Microsoft n'est pas parvenue à l'application. Vérifiez que l'URI de redirection est bien " +
      `« ${window.location.origin}/redirect.html ».`,
  },
  no_network_connectivity: {
    kind: 'network',
    title: 'Pas de connexion réseau',
    message: 'Impossible de joindre Microsoft. Vérifiez votre connexion Internet.',
  },
};

function describeGraphError(error: GraphError): UserFacingError {
  const code = error.code ?? String(error.status);
  if (error.status === 0) {
    return { kind: 'network', title: 'Pas de connexion réseau', message: 'Impossible de joindre Microsoft Graph. Vérifiez votre connexion Internet.', code };
  }
  if (error.status === 401) {
    return { kind: 'session', title: 'Session expirée', message: 'Votre session Microsoft a expiré. Reconnectez-vous.', code };
  }
  if (error.status === 403) {
    return {
      kind: 'consent',
      title: 'Accès aux emails refusé',
      message: `L'autorisation Mail.Read n'est pas accordée à l'application. ${ADMIN_CONSENT_HELP}`,
      code,
    };
  }
  if (error.code === 'MailboxNotEnabledForRESTAPI' || error.code === 'ResourceNotFound' || error.status === 404) {
    return {
      kind: 'generic',
      title: 'Boîte aux lettres introuvable',
      message:
        "Ce compte n'a pas de boîte aux lettres Exchange Online accessible (licence sans messagerie ou boîte hébergée sur site).",
      code,
    };
  }
  if (error.status === 429) {
    return { kind: 'generic', title: 'Trop de requêtes', message: 'Microsoft limite temporairement les accès. Réessayez dans quelques instants.', code };
  }
  return { kind: 'generic', title: 'Erreur Microsoft Graph', message: 'Le service Microsoft a renvoyé une erreur. Réessayez plus tard.', code };
}

/** Convertit n'importe quelle erreur d'authentification ou d'API en message français affichable. */
export function describeError(error: unknown): UserFacingError {
  if (error instanceof GraphError) return describeGraphError(error);

  if (error instanceof AuthError) {
    const entraCode = /AADSTS(\d+)/.exec(`${error.errorMessage} ${error.message}`)?.[1];
    if (entraCode && ENTRA_ERRORS[entraCode]) return { ...ENTRA_ERRORS[entraCode], code: `AADSTS${entraCode}` };
    const known = MSAL_ERRORS[error.errorCode];
    if (known) return { ...known, code: error.errorCode };
    return {
      kind: 'generic',
      title: 'Erreur de connexion',
      message: 'La connexion à Microsoft a échoué. Réessayez ; si le problème persiste, transmettez le code ci-dessous.',
      code: entraCode ? `AADSTS${entraCode}` : error.errorCode,
    };
  }

  return { kind: 'generic', title: 'Erreur inattendue', message: "Une erreur inattendue s'est produite. Réessayez." };
}
