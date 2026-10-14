import { tokens } from '@fluentui/react-components';
import { DataPie20Regular, Mail20Regular, MailInbox20Regular, Warning20Regular } from '@fluentui/react-icons';
import type { FluentIcon } from '@fluentui/react-icons';
import { ROLE_PRESETS, type Preferences, type Role, type WorkWeek } from '../hooks/usePreferences';
import type { Priority } from '../types/followUp';

/** Options partagées par l'introduction et le panneau de préférences. */

export const DELAYS: { days: number; label: string }[] = [
  { days: 1, label: '1 jour' },
  { days: 2, label: '2 jours' },
  { days: 3, label: '3 jours' },
  { days: 5, label: '5 jours' },
  { days: 7, label: '1 semaine' },
];

export const WORK_WEEKS: { value: WorkWeek; label: string; hint: string }[] = [
  { value: 'mon-fri', label: 'Lundi – vendredi', hint: 'Pas de relance le week-end' },
  { value: 'mon-sat', label: 'Lundi – samedi', hint: 'Pas de relance le dimanche' },
  { value: 'all', label: 'Tous les jours', hint: 'Relances 7 j / 7' },
];

export const PRIORITY_DOTS: Record<Priority, string> = {
  high: tokens.colorPaletteRedBorderActive,
  normal: tokens.colorPaletteMarigoldBorderActive,
  low: tokens.colorBrandBackground,
};

export const START_VIEWS: { value: Preferences['startView']; Icon: FluentIcon; hint: string }[] = [
  { value: 'overview', Icon: DataPie20Regular, hint: 'Statistiques et priorités du moment' },
  { value: 'inbox', Icon: Mail20Regular, hint: 'Vos derniers emails Outlook' },
  { value: 'all', Icon: MailInbox20Regular, hint: 'Tous les suivis par statut' },
  { value: 'overdue', Icon: Warning20Regular, hint: 'Les relances urgentes d’abord' },
];

export const ROLES = Object.keys(ROLE_PRESETS) as Role[];

