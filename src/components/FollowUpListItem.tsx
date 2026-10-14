import { Avatar, Caption1, makeStyles, mergeClasses, Text, tokens } from '@fluentui/react-components';
import { Note16Regular } from '@fluentui/react-icons';
import type { FollowUp } from '../types/followUp';
import { formatReceived } from '../utils/dates';
import { getEffectiveStatus } from '../utils/followUps';
import { DueBadge, PriorityBadge } from './Badges';
import { TABLE_COLUMNS } from './listLayout';

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
    gridTemplateColumns: TABLE_COLUMNS,
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
  overdue: {
    borderLeftColor: tokens.colorPaletteRedBorder2,
  },
  done: {
    color: tokens.colorNeutralForeground3,
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
  subjectLine: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
  },
  preview: {
    color: tokens.colorNeutralForeground3,
  },
  noteIcon: {
    flexShrink: 0,
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

interface FollowUpListItemProps {
  item: FollowUp;
  selected: boolean;
  layout: 'table' | 'compact';
  onSelect: (id: string) => void;
}

export function FollowUpListItem({ item, selected, layout, onSelect }: FollowUpListItemProps) {
  const styles = useStyles();
  const status = getEffectiveStatus(item);
  const done = status === 'done';
  const weight = done ? 'regular' : 'semibold';

  const subject = (
    <span className={styles.subjectLine}>
      <Text weight={weight} className={styles.ellipsis}>
        {item.subject}
      </Text>
      {item.notes.length > 0 && (
        <Note16Regular className={styles.noteIcon} aria-label={`${item.notes.length} note(s)`} />
      )}
    </span>
  );
  const preview = <Caption1 className={mergeClasses(styles.ellipsis, styles.preview)}>{item.preview}</Caption1>;
  const date = <Caption1 className={styles.date}>{formatReceived(item.receivedAt)}</Caption1>;

  return (
    <li>
      <button
        type="button"
        className={mergeClasses(
          styles.row,
          layout === 'table' ? styles.table : styles.compact,
          status === 'overdue' && styles.overdue,
          done && styles.done,
          selected && styles.selected,
        )}
        aria-current={selected ? 'true' : undefined}
        onClick={() => onSelect(item.id)}
      >
        {layout === 'table' ? (
          <>
            <span className={styles.sender}>
              <Avatar name={item.sender.name} size={28} color="colorful" />
              <Text weight={weight} className={styles.ellipsis}>
                {item.sender.name}
              </Text>
            </span>
            <span className={styles.stack}>
              {subject}
              {preview}
            </span>
            <span>
              <PriorityBadge priority={item.priority} />
            </span>
            <span>
              <DueBadge dueDate={item.dueDate} done={done} />
            </span>
            {date}
          </>
        ) : (
          <>
            <Avatar name={item.sender.name} size={32} color="colorful" />
            <span className={styles.stack}>
              <span className={styles.headerLine}>
                <Text weight={weight} className={styles.ellipsis}>
                  {item.sender.name}
                </Text>
                {date}
              </span>
              {subject}
              {preview}
              <span className={styles.badges}>
                <PriorityBadge priority={item.priority} />
                <DueBadge dueDate={item.dueDate} done={done} />
              </span>
            </span>
          </>
        )}
      </button>
    </li>
  );
}
