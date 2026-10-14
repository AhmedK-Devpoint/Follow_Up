import { makeStyles, tokens } from '@fluentui/react-components';
import {
  CalendarClock20Regular,
  CheckmarkCircle20Regular,
  MailInbox20Regular,
  Warning20Regular,
} from '@fluentui/react-icons';
import { useMemo } from 'react';
import type { FollowUp, FollowUpCounts, FollowUpStats, ViewFilter } from '../types/followUp';
import { parseDateOnly } from '../utils/dates';
import { doneByDay, dueByDay, type DayCount } from '../utils/followUps';
import { StatCard } from './StatCard';
import { DayColumns, Meter, StackedMeter, type DayColumn } from './StatVisuals';

/** Couleurs des états (identiques aux groupes de la liste) : validées pour le daltonisme. */
const STATE_COLORS = {
  todo: tokens.colorBrandBackground,
  waiting: tokens.colorPaletteMarigoldBorderActive,
  overdue: tokens.colorPaletteRedBorderActive,
};

const dayInitial = new Intl.DateTimeFormat('fr-FR', { weekday: 'narrow' });
const dayName = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return count > 1 ? pluralForm : singular;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Jours de l'histogramme : initiale, infobulle détaillée, jour courant mis en avant. */
function toColumns(days: DayCount[], currentIndex: number, unit: [string, string]): DayColumn[] {
  return days.map((day, index) => {
    const date = parseDateOnly(day.date);
    const name = index === currentIndex ? "Aujourd'hui" : capitalize(dayName.format(date));
    return {
      key: day.date,
      label: dayInitial.format(date).toUpperCase(),
      title: `${name} : ${day.count} ${plural(day.count, unit[0], unit[1])}`,
      value: day.count,
      current: index === currentIndex,
    };
  });
}

const useStyles = makeStyles({
  container: {
    containerType: 'inline-size',
  },
  // 4 colonnes si la place le permet, sinon 2 × 2 : jamais une carte orpheline sur sa ligne.
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: tokens.spacingHorizontalM,
    '@container (min-width: 760px)': {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    },
    '@container (max-width: 339px)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
    },
  },
});

interface DashboardStatsProps {
  items: FollowUp[];
  stats: FollowUpStats;
  counts: FollowUpCounts;
  view: ViewFilter;
  onViewChange: (view: ViewFilter) => void;
}

export function DashboardStats({ items, stats, counts, view, onViewChange }: DashboardStatsProps) {
  const styles = useStyles();
  const due = useMemo(() => toColumns(dueByDay(items), 0, ['relance', 'relances']), [items]);
  const done = useMemo(() => toColumns(doneByDay(items), 6, ['suivi clôturé', 'suivis clôturés']), [items]);
  const overdueShare = stats.active > 0 ? stats.overdue / stats.active : 0;
  const busiest = due.reduce((best, day) => (day.value > best.value ? day : best), due[0]);

  return (
    <section className={styles.container} aria-label="Tableau de bord">
      <div className={styles.grid}>
        <StatCard
          label="Suivis actifs"
          value={stats.active}
          caption="Répartition des suivis en cours"
          icon={<MailInbox20Regular />}
          tone="brand"
          goodWhen="neutral"
          selected={view === 'all'}
          onClick={() => onViewChange('all')}
        >
          <StackedMeter
            label="Suivis actifs"
            segments={[
              { key: 'todo', label: 'À traiter', value: counts.todo, color: STATE_COLORS.todo },
              { key: 'waiting', label: 'En attente', value: counts.waiting, color: STATE_COLORS.waiting },
              { key: 'overdue', label: 'En retard', value: counts.overdue, color: STATE_COLORS.overdue },
            ]}
          />
        </StatCard>

        <StatCard
          label="Relances en retard"
          value={stats.overdue}
          caption={`${Math.round(overdueShare * 100)} % des suivis actifs`}
          icon={<Warning20Regular />}
          tone="danger"
          goodWhen="down"
          selected={view === 'overdue'}
          onClick={() => onViewChange('overdue')}
        >
          <Meter
            label="Part des suivis actifs en retard"
            ratio={overdueShare}
            color={tokens.colorPaletteRedBackground3}
            track={tokens.colorPaletteRedBackground2}
          />
        </StatCard>

        <StatCard
          label="Échéance sous 7 jours"
          value={stats.dueThisWeek}
          caption={
            busiest.value > 0
              ? `Pic : ${busiest.current ? "aujourd'hui" : busiest.title.split(' : ')[0].toLowerCase()} (${busiest.value})`
              : 'Aucune relance prévue'
          }
          icon={<CalendarClock20Regular />}
          tone="warning"
          goodWhen="neutral"
        >
          <DayColumns
            label="Relances prévues sur les 7 prochains jours"
            days={due}
            color={tokens.colorPaletteDarkOrangeBackground3}
            muted={tokens.colorPaletteDarkOrangeBackground1}
          />
        </StatCard>

        <StatCard
          label="Terminés cette semaine"
          value={stats.doneThisWeek}
          caption={`${counts.done} ${plural(counts.done, 'suivi clôturé', 'suivis clôturés')} au total`}
          icon={<CheckmarkCircle20Regular />}
          tone="success"
          goodWhen="up"
          selected={view === 'done'}
          onClick={() => onViewChange('done')}
        >
          <DayColumns
            label="Suivis clôturés sur les 7 derniers jours"
            days={done}
            color={tokens.colorPaletteGreenBackground3}
            muted={tokens.colorPaletteGreenBackground1}
            focusable={false}
          />
        </StatCard>
      </div>
    </section>
  );
}
