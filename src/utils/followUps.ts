import type {
  EffectiveStatus,
  FollowUp,
  FollowUpCounts,
  FollowUpDraft,
  FollowUpStats,
  FollowUpView,
  OutlookMessage,
  Priority,
  PriorityFilter,
  ViewFilter,
} from '../types/followUp';
import { daysUntil, toDateOnly } from './dates';

export const STATUS_LABELS: Record<EffectiveStatus, string> = {
  todo: 'À traiter',
  waiting: 'En attente',
  overdue: 'En retard',
  done: 'Terminé',
};

export const VIEW_LABELS: Record<ViewFilter, string> = {
  overview: "Vue d'ensemble",
  inbox: 'Boîte de réception',
  all: 'Tous les suivis',
  todo: 'À traiter',
  waiting: 'En attente',
  overdue: 'En retard',
  done: 'Terminés',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'Haute',
  normal: 'Normale',
  low: 'Basse',
};

const PRIORITY_RANK: Record<Priority, number> = { high: 0, normal: 1, low: 2 };

export function getEffectiveStatus(item: FollowUp): EffectiveStatus {
  if (item.status === 'done') return 'done';
  return daysUntil(item.dueDate) < 0 ? 'overdue' : item.status;
}

export interface FollowUpQuery {
  view: FollowUpView;
  priority: PriorityFilter;
  search: string;
}

function matchesTerm(fields: string[], search: string): boolean {
  const term = search.trim().toLocaleLowerCase('fr');
  if (!term) return true;
  return fields.join(' ').toLocaleLowerCase('fr').includes(term);
}

function matchesSearch(item: FollowUp, search: string): boolean {
  return matchesTerm(
    [item.subject, item.sender.name, item.sender.email, item.preview, ...item.notes.map((n) => n.text)],
    search,
  );
}

/** Recherche dans les emails déjà chargés (expéditeur, objet, aperçu). */
export function filterMessages(messages: OutlookMessage[], search: string): OutlookMessage[] {
  return messages.filter((m) => matchesTerm([m.subject, m.from.name, m.from.email, m.preview], search));
}

/** Crée un suivi interne à partir d'un email Outlook. L'email n'est pas modifié sur le serveur. */
export function createFollowUpFromMessage(message: OutlookMessage, draft: FollowUpDraft): FollowUp {
  const now = new Date().toISOString();
  const note = draft.note.trim();
  return {
    id: crypto.randomUUID(),
    source: 'outlook',
    messageId: message.id,
    webLink: message.webLink,
    sender: message.from,
    recipients: message.recipients,
    subject: message.subject,
    preview: message.preview,
    receivedAt: message.receivedAt,
    dueDate: draft.dueDate,
    priority: draft.priority,
    status: draft.status,
    notes: note ? [{ id: crypto.randomUUID(), text: note, createdAt: now }] : [],
    createdAt: now,
  };
}

/**
 * Filtre puis trie : les suivis ouverts par échéance la plus proche puis priorité,
 * les suivis terminés du plus récemment clôturé au plus ancien.
 */
export function queryFollowUps(items: FollowUp[], query: FollowUpQuery): FollowUp[] {
  return items
    .filter((item) => query.view === 'all' || getEffectiveStatus(item) === query.view)
    .filter((item) => query.priority === 'all' || item.priority === query.priority)
    .filter((item) => matchesSearch(item, query.search))
    .sort((a, b) => {
      const aDone = a.status === 'done';
      const bDone = b.status === 'done';
      if (aDone !== bDone) return aDone ? 1 : -1;
      if (aDone && bDone) return (b.completedAt ?? '').localeCompare(a.completedAt ?? '');
      return a.dueDate.localeCompare(b.dueDate) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    });
}

export function countByView(items: FollowUp[]): FollowUpCounts {
  const counts: FollowUpCounts = { all: items.length, todo: 0, waiting: 0, overdue: 0, done: 0 };
  for (const item of items) counts[getEffectiveStatus(item)] += 1;
  return counts;
}

/** Nombre de jours entre la date ISO donnée et aujourd'hui (0 = aujourd'hui, 1 = hier…). */
function daysAgo(iso: string): number {
  return -daysUntil(toDateOnly(new Date(iso)));
}

export function computeStats(items: FollowUp[]): FollowUpStats {
  let active = 0;
  let overdue = 0;
  let dueThisWeek = 0;
  let doneThisWeek = 0;

  for (const item of items) {
    if (item.status === 'done') {
      // « Cette semaine » = aujourd'hui et les 6 jours précédents, comme l'histogramme de la carte.
      if (item.completedAt && daysAgo(item.completedAt) <= 6) doneThisWeek += 1;
      continue;
    }
    active += 1;
    const days = daysUntil(item.dueDate);
    if (days < 0) overdue += 1;
    // « Sous 7 jours » = aujourd'hui et les 6 jours suivants, comme l'histogramme de la carte.
    else if (days <= 6) dueThisWeek += 1;
  }

  return { active, overdue, dueThisWeek, doneThisWeek };
}

/** Un jour d'histogramme : date « AAAA-MM-JJ » et nombre de suivis. */
export interface DayCount {
  date: string;
  count: number;
}

function emptyDays(firstOffset: number): DayCount[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + firstOffset + i);
    return { date: toDateOnly(date), count: 0 };
  });
}

/** Relances actives à faire aujourd'hui et les 6 jours suivants. */
export function dueByDay(items: FollowUp[]): DayCount[] {
  const days = emptyDays(0);
  for (const item of items) {
    if (item.status === 'done') continue;
    const offset = daysUntil(item.dueDate);
    if (offset >= 0 && offset <= 6) days[offset].count += 1;
  }
  return days;
}

/** Suivis clôturés sur les 6 derniers jours et aujourd'hui. */
export function doneByDay(items: FollowUp[]): DayCount[] {
  const days = emptyDays(-6);
  for (const item of items) {
    if (item.status !== 'done' || !item.completedAt) continue;
    const ago = daysAgo(item.completedAt);
    if (ago >= 0 && ago <= 6) days[6 - ago].count += 1;
  }
  return days;
}
