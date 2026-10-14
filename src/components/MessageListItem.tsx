import { Avatar, Caption1, makeStyles, mergeClasses, Text, tokens } from '@fluentui/react-components';
import type { FollowUp, OutlookMessage } from '../types/followUp';
import { formatReceived } from '../utils/dates';
import { getEffectiveStatus } from '../utils/followUps';
import { StatusBadge } from './Badges';
import { INBOX_COLUMNS } from './listLayout';

const useStyles = makeStyles({
  row: {
    display: 'grid',
    width: '100%',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    textAlign: 'left',
    font: 'inherit',
    color: tokens.colorNeutralForeground1,
    backgroundColor: 'transparent',
    border: 'none',
    borderLeft: '3px solid transparent',
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'var(--fu-row-hover)',
    },
    ':focus-visible': {
      outline: `2px solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: '-2px',
    },
  },
  table: {
    gridTemplateColumns: INBOX_COLUMNS,
    minHeight: '56px',
  },
  compact: {
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    alignItems: 'start',
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalM,
  },
  selected: {
    backgroundColor: tokens.colorBrandBackground2,
    borderLeftColor: tokens.colorBrandStroke1,
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2Hover,
    },
  },
  unread: {
    borderLeftColor: tokens.colorBrandBackground,
  },
  sender: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  ellipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  preview: {
    color: tokens.colorNeutralForeground3,
  },
  headerLine: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
  },
  date: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
    textAlign: 'right',
  },
  badges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalXS,
  },
});

interface MessageListItemProps {
  message: OutlookMessage;
  /** Suivi déjà créé pour cet email, le cas échéant. */
  followUp?: FollowUp;
  selected: boolean;
  layout: 'table' | 'compact';
  onSelect: (id: string) => void;
}

export function MessageListItem({ message, followUp, selected, layout, onSelect }: MessageListItemProps) {
  const styles = useStyles();
  const weight = message.isRead ? 'regular' : 'semibold';
  const followBadge = followUp && <StatusBadge status={getEffectiveStatus(followUp)} />;

  const subject = (
    <Text weight={weight} className={styles.ellipsis}>
      {message.subject}
    </Text>
  );
  const preview = <Caption1 className={mergeClasses(styles.ellipsis, styles.preview)}>{message.preview}</Caption1>;
  const date = <Caption1 className={styles.date}>{formatReceived(message.receivedAt)}</Caption1>;

  return (
    <li>
      <button
        type="button"
        className={mergeClasses(
          styles.row,
          layout === 'table' ? styles.table : styles.compact,
          !message.isRead && styles.unread,
          selected && styles.selected,
        )}
        aria-current={selected ? 'true' : undefined}
        aria-label={`${message.isRead ? '' : 'Non lu, '}${message.from.name}, ${message.subject}`}
        onClick={() => onSelect(message.id)}
      >
        {layout === 'table' ? (
          <>
            <span className={styles.sender}>
              <Avatar name={message.from.name} size={28} color="colorful" />
              <Text weight={weight} className={styles.ellipsis}>
                {message.from.name}
              </Text>
            </span>
            <span className={styles.stack}>
              {subject}
              {preview}
            </span>
            <span>{followBadge}</span>
            {date}
          </>
        ) : (
          <>
            <Avatar name={message.from.name} size={32} color="colorful" />
            <span className={styles.stack}>
              <span className={styles.headerLine}>
                <Text weight={weight} className={styles.ellipsis}>
                  {message.from.name}
                </Text>
                {date}
              </span>
              {subject}
              {preview}
              {followUp && <span className={styles.badges}>{followBadge}</span>}
            </span>
          </>
        )}
      </button>
    </li>
  );
}
