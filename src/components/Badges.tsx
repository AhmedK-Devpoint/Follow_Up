import { Badge, makeStyles, tokens, type BadgeProps } from '@fluentui/react-components';
import {
  CalendarClock16Regular,
  CheckmarkCircle16Regular,
  Clock16Regular,
  Warning16Regular,
} from '@fluentui/react-icons';
import type { EffectiveStatus, Priority } from '../types/followUp';
import { daysUntil, formatDueRelative } from '../utils/dates';
import { PRIORITY_LABELS, STATUS_LABELS } from '../utils/followUps';

const STATUS_APPEARANCE: Record<EffectiveStatus, { color: BadgeProps['color']; icon: JSX.Element }> = {
  todo: { color: 'brand', icon: <CalendarClock16Regular /> },
  waiting: { color: 'informative', icon: <Clock16Regular /> },
  overdue: { color: 'danger', icon: <Warning16Regular /> },
  done: { color: 'success', icon: <CheckmarkCircle16Regular /> },
};

export function StatusBadge({ status }: { status: EffectiveStatus }) {
  const { color, icon } = STATUS_APPEARANCE[status];
  return (
    <Badge appearance="tint" color={color} icon={icon}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

const PRIORITY_COLORS: Record<Priority, { color: string; background: string }> = {
  high: { color: tokens.colorPaletteRedForeground1, background: tokens.colorPaletteRedBackground1 },
  normal: { color: tokens.colorPaletteMarigoldForeground2, background: tokens.colorPaletteMarigoldBackground1 },
  low: { color: tokens.colorBrandForeground1, background: tokens.colorBrandBackground2 },
};

const usePriorityStyles = makeStyles({
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '64px',
    height: '22px',
    padding: `0 ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusCircular,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
});

/** Pastille de priorité colorée (Haute / Normale / Basse). */
export function PriorityBadge({ priority }: { priority: Priority }) {
  const styles = usePriorityStyles();
  return (
    <span className={styles.pill} style={PRIORITY_COLORS[priority]} aria-label={`Priorité ${PRIORITY_LABELS[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

/** Échéance relative, colorée selon l'urgence. */
export function DueBadge({ dueDate, done }: { dueDate: string; done: boolean }) {
  if (done) {
    return (
      <Badge appearance="ghost" color="success" icon={<CheckmarkCircle16Regular />}>
        Clôturé
      </Badge>
    );
  }
  const days = daysUntil(dueDate);
  const color: BadgeProps['color'] = days < 0 ? 'danger' : days <= 1 ? 'warning' : 'informative';
  return (
    <Badge appearance="tint" color={color} icon={<CalendarClock16Regular />}>
      {formatDueRelative(dueDate)}
    </Badge>
  );
}
