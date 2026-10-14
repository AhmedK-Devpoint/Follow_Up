const LOCALE = 'fr-FR';
const DAY_MS = 24 * 60 * 60 * 1000;

const shortDate = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });
const longDate = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const time = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });
const dateTime = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** Convertit « AAAA-MM-JJ » en date locale (minuit), sans décalage de fuseau. */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Formate une date locale en « AAAA-MM-JJ ». */
export function toDateOnly(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Date de relance « AAAA-MM-JJ » dans `days` jours, décalée au prochain jour travaillé
 * si elle tombe un jour chômé (`mon-fri` : samedi et dimanche, `mon-sat` : dimanche).
 */
export function dueDateIn(days: number, workWeek: 'mon-fri' | 'mon-sat' | 'all'): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const isOff = (day: number) => (workWeek === 'mon-fri' && day === 6) || (workWeek !== 'all' && day === 0);
  while (isOff(date.getDay())) date.setDate(date.getDate() + 1);
  return toDateOnly(date);
}

export function isDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Nombre de jours entre aujourd'hui et la date donnée (négatif si passée). */
export function daysUntil(dateOnly: string): number {
  return Math.round((parseDateOnly(dateOnly).getTime() - startOfToday().getTime()) / DAY_MS);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

/** Date de réception compacte, façon Outlook : heure si aujourd'hui, sinon jour + mois. */
export function formatReceived(iso: string): string {
  const date = new Date(iso);
  return isSameDay(date, new Date()) ? time.format(date) : shortDate.format(date);
}

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

export function formatLongDate(dateOnly: string): string {
  const label = longDate.format(parseDateOnly(dateOnly));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Libellé relatif de l'échéance : « Aujourd'hui », « Demain », « Dans 3 j », « Retard de 2 j »… */
export function formatDueRelative(dateOnly: string): string {
  const days = daysUntil(dateOnly);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Demain';
  if (days === -1) return 'Hier';
  if (days < 0) return `Retard de ${-days} j`;
  if (days < 7) return `Dans ${days} j`;
  return shortDate.format(parseDateOnly(dateOnly));
}
