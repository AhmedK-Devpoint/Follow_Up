/** Statut saisi par l'utilisateur. */
export type FollowUpStatus = 'todo' | 'waiting' | 'done';

/**
 * Statut affiché : un suivi non terminé dont l'échéance est dépassée
 * bascule automatiquement dans « En retard ».
 */
export type EffectiveStatus = FollowUpStatus | 'overdue';

export type Priority = 'high' | 'normal' | 'low';

/** Section listant des suivis : un statut affiché, ou tous les suivis. */
export type FollowUpView = EffectiveStatus | 'all';

/** Section de navigation : une vue de suivis, ou la boîte de réception Outlook. */
export type ViewFilter = FollowUpView | 'inbox' | 'overview';

export type PriorityFilter = Priority | 'all';

/** Origine des données affichées. Les deux ne sont jamais mélangées. */
export type DataSource = 'demo' | 'outlook';

export interface Contact {
  name: string;
  email: string;
}

export interface Note {
  id: string;
  text: string;
  /** Date ISO 8601 complète. */
  createdAt: string;
}

/** Email Outlook tel que renvoyé par Microsoft Graph (champs utiles uniquement). */
export interface OutlookMessage {
  id: string;
  subject: string;
  from: Contact;
  recipients: Contact[];
  /** Date ISO 8601 complète. */
  receivedAt: string;
  preview: string;
  isRead: boolean;
  webLink?: string;
  conversationId?: string;
}

/**
 * Suivi créé par l'utilisateur. Il conserve un instantané de l'email
 * (expéditeur, objet, aperçu) pour rester lisible même si l'email
 * n'est plus dans la page chargée.
 */
export interface FollowUp {
  id: string;
  source: DataSource;
  /** Identifiant Microsoft Graph de l'email associé (source Outlook). */
  messageId?: string;
  /** Lien d'ouverture du message dans Outlook sur le web. */
  webLink?: string;
  sender: Contact;
  recipients: Contact[];
  subject: string;
  preview: string;
  /** Corps complet : fourni par les données de démo uniquement, chargé à la demande pour Outlook. */
  body?: string;
  /** Date ISO 8601 complète de réception de l'email. */
  receivedAt: string;
  /** Échéance de relance au format AAAA-MM-JJ. */
  dueDate: string;
  priority: Priority;
  status: FollowUpStatus;
  notes: Note[];
  /** Date ISO 8601 de création du suivi. */
  createdAt: string;
  /** Date ISO 8601 de clôture, si le suivi est terminé. */
  completedAt?: string;
}

/** Paramètres saisis lors de la création d'un suivi. */
export interface FollowUpDraft {
  dueDate: string;
  priority: Priority;
  status: Exclude<FollowUpStatus, 'done'>;
  note: string;
}

export interface FollowUpStats {
  active: number;
  overdue: number;
  dueThisWeek: number;
  doneThisWeek: number;
}

export type FollowUpCounts = Record<FollowUpView, number>;
