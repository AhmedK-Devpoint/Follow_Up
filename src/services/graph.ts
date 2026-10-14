import type { Contact, OutlookMessage } from '../types/followUp';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';
export const MESSAGES_PAGE_SIZE = 25;

const MESSAGE_FIELDS = [
  'id',
  'subject',
  'from',
  'toRecipients',
  'receivedDateTime',
  'bodyPreview',
  'isRead',
  'isDraft',
  'webLink',
  'conversationId',
].join(',');

/** Erreur d'appel Microsoft Graph, avec le statut HTTP et le code renvoyé par l'API. */
export class GraphError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, code?: string, message?: string) {
    super(message ?? `Microsoft Graph a répondu ${status}`);
    this.name = 'GraphError';
    this.status = status;
    this.code = code;
  }
}

interface GraphRecipient {
  emailAddress?: { name?: string; address?: string };
}

interface GraphMessage {
  id: string;
  subject: string | null;
  from?: GraphRecipient | null;
  toRecipients?: GraphRecipient[];
  receivedDateTime: string;
  bodyPreview: string | null;
  isRead: boolean;
  isDraft?: boolean;
  webLink?: string;
  conversationId?: string;
}

interface GraphPage<T> {
  value: T[];
  '@odata.nextLink'?: string;
}

export interface MessagesPage {
  messages: OutlookMessage[];
  nextLink?: string;
}

async function graphGet<T>(token: string, url: string, headers: Record<string, string> = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, ...headers } });
  } catch {
    throw new GraphError(0, 'network', 'Microsoft Graph est injoignable.');
  }
  if (!response.ok) {
    let code: string | undefined;
    try {
      const body = (await response.json()) as { error?: { code?: string } };
      code = body.error?.code;
    } catch {
      // Réponse d'erreur sans corps JSON.
    }
    throw new GraphError(response.status, code);
  }
  return (await response.json()) as T;
}

function toContact(recipient?: GraphRecipient | null): Contact {
  const name = recipient?.emailAddress?.name?.trim();
  const email = recipient?.emailAddress?.address?.trim() ?? '';
  return { name: name || email || 'Expéditeur inconnu', email };
}

function toOutlookMessage(message: GraphMessage): OutlookMessage {
  return {
    id: message.id,
    subject: message.subject?.trim() || '(Sans objet)',
    from: toContact(message.from),
    recipients: (message.toRecipients ?? []).map(toContact),
    receivedAt: message.receivedDateTime,
    preview: message.bodyPreview?.trim() ?? '',
    isRead: message.isRead,
    webLink: message.webLink,
    conversationId: message.conversationId,
  };
}

/**
 * Charge une page d'emails, du plus récent au plus ancien.
 * Passer `nextLink` (renvoyé par l'appel précédent) pour obtenir la page suivante.
 */
export async function fetchMessages(token: string, nextLink?: string): Promise<MessagesPage> {
  const url =
    nextLink ??
    `${GRAPH_BASE}/me/messages?$select=${MESSAGE_FIELDS}&$orderby=receivedDateTime desc&$top=${MESSAGES_PAGE_SIZE}`;
  const page = await graphGet<GraphPage<GraphMessage>>(token, url);
  return {
    // Les brouillons ne sont pas des emails reçus : on les écarte.
    messages: page.value.filter((m) => !m.isDraft).map(toOutlookMessage),
    nextLink: page['@odata.nextLink'],
  };
}

/** Corps complet d'un email, demandé en texte brut (pas de HTML à interpréter). */
export async function fetchMessageBody(token: string, messageId: string): Promise<string> {
  const message = await graphGet<{ body?: { content?: string } }>(
    token,
    `${GRAPH_BASE}/me/messages/${encodeURIComponent(messageId)}?$select=body`,
    { Prefer: 'outlook.body-content-type="text"' },
  );
  return message.body?.content?.trim() ?? '';
}
