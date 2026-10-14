import { Avatar, Button, Caption1, makeStyles, mergeClasses, Subtitle2, Text, tokens } from '@fluentui/react-components';
import { ArrowRight16Regular, CheckmarkCircle48Regular } from '@fluentui/react-icons';
import { useMemo, useRef, type ReactNode } from 'react';
import { card } from '../theme';
import type { FollowUp, Priority, PriorityFilter, ViewFilter } from '../types/followUp';
import { daysUntil } from '../utils/dates';
import { getEffectiveStatus, PRIORITY_LABELS } from '../utils/followUps';
import { gsap, reduceMotion, useGSAP } from '../utils/motion';
import { PRIORITY_DOTS } from '../utils/preferenceOptions';
import { DueBadge, PriorityBadge } from './Badges';
import { DayColumns, HBar, type DayColumn } from './StatVisuals';

const PRIORITY_RANK: Record<Priority, number> = { high: 0, normal: 1, low: 2 };
const PRIORITIES: Priority[] = ['high', 'normal', 'low'];
const URGENT_LIMIT = 6;
const CONTACT_LIMIT = 5;
const HORIZON_DAYS = 14;

const dayNumber = new Intl.DateTimeFormat('fr-FR', { day: 'numeric' });
const dayName = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

const useStyles = makeStyles({
  root: {
    containerType: 'inline-size',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: tokens.spacingHorizontalM,
    '@container (min-width: 720px)': {
      gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
    },
  },
  wide: {
    '@container (min-width: 720px)': {
      gridColumn: '1 / -1',
    },
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    minWidth: 0,
    padding: tokens.spacingHorizontalL,
    ...card,
    borderRadius: 'var(--fu-radius-card)',
  },
  panelHead: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
  },
  panelTitle: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    width: '100%',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
    font: 'inherit',
    textAlign: 'left',
    color: tokens.colorNeutralForeground1,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: tokens.borderRadiusLarge,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'var(--fu-row-hover)',
    },
    ':focus-visible': {
      outline: `2px solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: '-2px',
    },
  },
  rowText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  ellipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  badges: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalS,
    padding: `${tokens.spacingVerticalXL} 0`,
    color: tokens.colorPaletteGreenForeground1,
    textAlign: 'center',
  },
  progress: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXL,
    flexWrap: 'wrap',
  },
  ring: {
    position: 'relative',
    flexShrink: 0,
    width: '132px',
    height: '132px',
  },
  ringLabel: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontSize: '30px',
    lineHeight: '34px',
    fontWeight: tokens.fontWeightSemibold,
  },
  facts: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    minWidth: 0,
  },
  fact: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  dot: {
    width: '8px',
    height: '8px',
    flexShrink: 0,
    borderRadius: tokens.borderRadiusCircular,
  },
  rankRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.3fr) minmax(48px, 1fr) 24px',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  rankLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  rankCount: {
    textAlign: 'right',
    fontWeight: tokens.fontWeightSemibold,
  },
});

function Panel({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const styles = useStyles();
  return (
    <section className={mergeClasses(styles.panel, className)} aria-label={title}>
      <header className={styles.panelHead}>
        <div className={styles.panelTitle}>
          <Subtitle2 as="h2">{title}</Subtitle2>
          <Caption1 className={styles.muted}>{description}</Caption1>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function SeeAll({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      appearance="transparent"
      size="small"
      icon={<ArrowRight16Regular />}
      iconPosition="after"
      onClick={onClick}
      data-sound="click"
    >
      {label}
    </Button>
  );
}

/** Anneau d'avancement (un seul ratio) : la piste est une teinte claire de la même couleur. */
function ProgressRing({ ratio, label }: { ratio: number; label: string }) {
  const styles = useStyles();
  const arc = useRef<SVGCircleElement>(null);
  const shown = useRef(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.round(Math.min(Math.max(ratio, 0), 1) * 100);

  useGSAP(
    () => {
      if (!arc.current) return;
      const target = circumference * (1 - percent / 100);
      if (reduceMotion()) {
        arc.current.style.strokeDashoffset = String(target);
      } else {
        gsap.fromTo(
          arc.current,
          { strokeDashoffset: circumference * (1 - shown.current / 100) },
          { strokeDashoffset: target, duration: 0.9, ease: 'power3.out' },
        );
      }
      shown.current = percent;
    },
    { dependencies: [percent] },
  );

  return (
    <div className={styles.ring} role="img" aria-label={`${label} : ${percent} %`}>
      <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden>
        <circle cx="66" cy="66" r={radius} fill="none" stroke={tokens.colorPaletteGreenBackground2} strokeWidth="12" />
        <circle
          ref={arc}
          cx="66"
          cy="66"
          r={radius}
          fill="none"
          stroke={tokens.colorPaletteGreenBackground3}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform="rotate(-90 66 66)"
        />
      </svg>
      <span className={styles.ringLabel}>
        <span className={styles.ringValue}>{percent} %</span>
        <Caption1 className={styles.muted}>terminés</Caption1>
      </span>
    </div>
  );
}

interface OverviewProps {
  items: FollowUp[];
  /** Ouvre un suivi dans le panneau de détail. */
  onOpen: (id: string) => void;
  /** Redirige vers une liste, éventuellement filtrée. */
  onNavigate: (view: ViewFilter, filters?: { priority?: PriorityFilter; search?: string }) => void;
}

/** Vue d'ensemble : ce qui presse, l'avancement, la charge à venir, et où agir. */
export function Overview({ items, onOpen, onNavigate }: OverviewProps) {
  const styles = useStyles();

  const data = useMemo(() => {
    const active = items.filter((item) => item.status !== 'done');
    const done = items.length - active.length;

    // À faire maintenant : en retard ou à relancer aujourd'hui, les plus anciens et les plus prioritaires d'abord.
    const urgent = active
      .filter((item) => daysUntil(item.dueDate) <= 0)
      .sort(
        (a, b) =>
          daysUntil(a.dueDate) - daysUntil(b.dueDate) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
      );

    // Charge à venir : un seau « en retard », puis les 14 prochains jours.
    const overdueCount = active.filter((item) => daysUntil(item.dueDate) < 0).length;
    const horizon: DayColumn[] = [
      {
        key: 'overdue',
        label: '!',
        title: `En retard : ${overdueCount} ${overdueCount > 1 ? 'relances' : 'relance'}`,
        value: overdueCount,
        current: false,
        color: tokens.colorPaletteRedBorderActive,
      },
    ];
    for (let offset = 0; offset < HORIZON_DAYS; offset++) {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      const count = active.filter((item) => daysUntil(item.dueDate) === offset).length;
      const name = offset === 0 ? "Aujourd'hui" : dayName.format(date).replace(/^./, (c) => c.toUpperCase());
      horizon.push({
        key: String(offset),
        label: dayNumber.format(date),
        title: `${name} : ${count} ${count > 1 ? 'relances' : 'relance'}`,
        value: count,
        current: offset === 0,
      });
    }

    const byPriority = PRIORITIES.map((priority) => ({
      priority,
      count: active.filter((item) => item.priority === priority).length,
    }));

    const contacts = new Map<string, { name: string; count: number; overdue: number }>();
    for (const item of active) {
      const key = item.sender.email || item.sender.name;
      const entry = contacts.get(key) ?? { name: item.sender.name, count: 0, overdue: 0 };
      entry.count += 1;
      if (getEffectiveStatus(item) === 'overdue') entry.overdue += 1;
      contacts.set(key, entry);
    }
    const topContacts = [...contacts.values()]
      .sort((a, b) => b.overdue - a.overdue || b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, CONTACT_LIMIT);

    return { active, done, urgent, horizon, overdueCount, byPriority, topContacts };
  }, [items]);

  const priorityMax = Math.max(1, ...data.byPriority.map((p) => p.count));
  const contactMax = Math.max(1, ...data.topContacts.map((c) => c.count));
  const total = items.length;

  return (
    <div className={styles.root}>
      <div className={styles.grid}>
        <Panel
          title="À faire maintenant"
          description="Relances en retard ou prévues aujourd'hui, les plus urgentes d'abord."
          action={data.urgent.length > URGENT_LIMIT && <SeeAll label="Tout voir" onClick={() => onNavigate('overdue')} />}
        >
          {data.urgent.length === 0 ? (
            <div className={styles.empty}>
              <CheckmarkCircle48Regular />
              <Text weight="semibold">Rien d'urgent : tout est à jour.</Text>
            </div>
          ) : (
            <ul className={styles.list}>
              {data.urgent.slice(0, URGENT_LIMIT).map((item) => (
                <li key={item.id}>
                  <button type="button" className={styles.row} onClick={() => onOpen(item.id)} data-sound="click">
                    <Avatar name={item.sender.name} size={32} color="colorful" />
                    <span className={styles.rowText}>
                      <Text weight="semibold" className={styles.ellipsis}>
                        {item.subject}
                      </Text>
                      <Caption1 className={mergeClasses(styles.muted, styles.ellipsis)}>{item.sender.name}</Caption1>
                    </span>
                    <span className={styles.badges}>
                      <PriorityBadge priority={item.priority} />
                      <DueBadge dueDate={item.dueDate} done={false} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Avancement"
          description="Part des suivis menés à terme."
          action={<SeeAll label="Terminés" onClick={() => onNavigate('done')} />}
        >
          <div className={styles.progress}>
            <ProgressRing ratio={total > 0 ? data.done / total : 0} label="Suivis terminés" />
            <div className={styles.facts}>
              <Caption1 className={styles.fact}>
                <span className={styles.dot} style={{ backgroundColor: tokens.colorPaletteGreenBackground3 }} aria-hidden />
                <Text weight="semibold">{data.done}</Text> terminés
              </Caption1>
              <Caption1 className={styles.fact}>
                <span className={styles.dot} style={{ backgroundColor: tokens.colorPaletteGreenBackground2 }} aria-hidden />
                <Text weight="semibold">{data.active.length}</Text> en cours
              </Caption1>
              <Caption1 className={styles.fact}>
                <span className={styles.dot} style={{ backgroundColor: tokens.colorPaletteRedBorderActive }} aria-hidden />
                <Text weight="semibold">{data.overdueCount}</Text> en retard
              </Caption1>
            </div>
          </div>
        </Panel>

        <Panel
          className={styles.wide}
          title="Charge à venir"
          description={`Relances en retard, puis prévues jour par jour sur les ${HORIZON_DAYS} prochains jours.`}
          action={<SeeAll label="Tous les suivis" onClick={() => onNavigate('all')} />}
        >
          <DayColumns
            label={`Relances prévues sur les ${HORIZON_DAYS} prochains jours`}
            days={data.horizon}
            color={tokens.colorBrandBackground}
            muted={tokens.colorBrandBackground2}
            height={96}
          />
        </Panel>

        <Panel title="Par priorité" description="Suivis en cours. Cliquez pour filtrer la liste.">
          <ul className={styles.list}>
            {data.byPriority.map(({ priority, count }) => (
              <li key={priority}>
                <button
                  type="button"
                  className={mergeClasses(styles.row, styles.rankRow)}
                  onClick={() => onNavigate('all', { priority })}
                  data-sound="click"
                  aria-label={`Priorité ${PRIORITY_LABELS[priority].toLowerCase()} : ${count} suivis`}
                >
                  <span className={styles.rankLabel}>
                    <span className={styles.dot} style={{ backgroundColor: PRIORITY_DOTS[priority] }} aria-hidden />
                    <Text>{PRIORITY_LABELS[priority]}</Text>
                  </span>
                  <HBar ratio={count / priorityMax} color={PRIORITY_DOTS[priority]} />
                  <Text className={styles.rankCount}>{count}</Text>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Contacts à relancer" description="Qui attend le plus de réponses. Cliquez pour voir ses suivis.">
          {data.topContacts.length === 0 ? (
            <Caption1 className={styles.muted}>Aucun suivi en cours.</Caption1>
          ) : (
            <ul className={styles.list}>
              {data.topContacts.map((contact) => (
                <li key={contact.name}>
                  <button
                    type="button"
                    className={mergeClasses(styles.row, styles.rankRow)}
                    onClick={() => onNavigate('all', { search: contact.name })}
                    data-sound="click"
                    aria-label={`${contact.name} : ${contact.count} suivis, dont ${contact.overdue} en retard`}
                  >
                    <span className={styles.rankLabel}>
                      <Avatar name={contact.name} size={24} color="colorful" />
                      <Text className={styles.ellipsis}>{contact.name}</Text>
                    </span>
                    <HBar
                      ratio={contact.count / contactMax}
                      color={contact.overdue > 0 ? tokens.colorPaletteRedBorderActive : tokens.colorBrandBackground}
                    />
                    <Text className={styles.rankCount}>{contact.count}</Text>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
