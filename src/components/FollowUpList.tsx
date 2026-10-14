import {
  Button,
  CounterBadge,
  Dropdown,
  makeStyles,
  Option,
  Text,
  tokens,
} from '@fluentui/react-components';
import { ChevronDown20Regular, ChevronRight20Regular, TaskListSquareLtr48Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import { useElementWidth } from '../hooks/useElementWidth';
import type { EffectiveStatus, FollowUp, PriorityFilter } from '../types/followUp';
import { getEffectiveStatus, PRIORITY_LABELS, VIEW_LABELS } from '../utils/followUps';
import { FollowUpListItem } from './FollowUpListItem';
import { ListCard, ListEmptyState } from './ListCard';
import { TABLE_COLUMNS, TABLE_MIN_WIDTH } from './listLayout';

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'Toutes priorités' },
  { value: 'high', label: `Priorité ${PRIORITY_LABELS.high.toLowerCase()}` },
  { value: 'normal', label: `Priorité ${PRIORITY_LABELS.normal.toLowerCase()}` },
  { value: 'low', label: `Priorité ${PRIORITY_LABELS.low.toLowerCase()}` },
];

/** Ordre et couleur des groupes de la vue « Tous les suivis ». */
const GROUPS: { status: EffectiveStatus; color: string }[] = [
  { status: 'overdue', color: tokens.colorPaletteRedBorderActive },
  { status: 'todo', color: tokens.colorBrandBackground },
  { status: 'waiting', color: tokens.colorPaletteMarigoldBorderActive },
  { status: 'done', color: tokens.colorPaletteGreenBorderActive },
];

const useStyles = makeStyles({
  dropdown: {
    minWidth: '180px',
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: TABLE_COLUMNS,
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    paddingLeft: `calc(${tokens.spacingHorizontalL} + 3px)`,
    color: tokens.colorNeutralForeground3,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  alignRight: {
    textAlign: 'right',
  },
  list: {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    width: '100%',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    font: 'inherit',
    textAlign: 'left',
    color: tokens.colorNeutralForeground1,
    backgroundColor: 'var(--fu-card-muted)',
    border: 'none',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'var(--fu-row-hover)',
    },
    ':focus-visible': {
      outline: `2px solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: '-2px',
    },
  },
  groupBar: {
    width: '3px',
    height: '18px',
    borderRadius: tokens.borderRadiusCircular,
  },
});

interface FollowUpListProps {
  title: string;
  items: FollowUp[];
  /** Regroupe les suivis par statut (vue « Tous les suivis »). */
  grouped: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  priority: PriorityFilter;
  onPriorityChange: (priority: PriorityFilter) => void;
  hasSearch: boolean;
}

export function FollowUpList({
  title,
  items,
  grouped,
  selectedId,
  onSelect,
  priority,
  onPriorityChange,
  hasSearch,
}: FollowUpListProps) {
  const styles = useStyles();
  const [ref, width] = useElementWidth<HTMLElement>();
  const [collapsed, setCollapsed] = useState<Set<EffectiveStatus>>(() => new Set(['done']));
  const layout = width >= TABLE_MIN_WIDTH ? 'table' : 'compact';
  const selectedOption = PRIORITY_OPTIONS.find((o) => o.value === priority) ?? PRIORITY_OPTIONS[0];

  const toggleGroup = (status: EffectiveStatus) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });

  const renderItems = (list: FollowUp[]) => (
    <ul className={styles.list}>
      {list.map((item) => (
        <FollowUpListItem
          key={item.id}
          item={item}
          layout={layout}
          selected={item.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );

  const renderGroups = () =>
    GROUPS.map(({ status, color }) => {
      const list = items.filter((item) => getEffectiveStatus(item) === status);
      if (list.length === 0) return null;
      const isCollapsed = collapsed.has(status);
      return (
        <div key={status}>
          <button
            data-sound="click"
            type="button"
            className={styles.groupHeader}
            aria-expanded={!isCollapsed}
            onClick={() => toggleGroup(status)}
          >
            {isCollapsed ? <ChevronRight20Regular /> : <ChevronDown20Regular />}
            <span className={styles.groupBar} style={{ backgroundColor: color }} aria-hidden />
            <Text weight="semibold">{VIEW_LABELS[status]}</Text>
            <CounterBadge count={list.length} appearance="ghost" color="informative" size="small" />
          </button>
          {!isCollapsed && renderItems(list)}
        </div>
      );
    });

  return (
    <ListCard
      sectionRef={ref}
      title={title}
      subtitle={`${items.length} ${items.length > 1 ? 'suivis' : 'suivi'}`}
      actions={
        <Dropdown
          className={styles.dropdown}
          aria-label="Filtrer par priorité"
          value={selectedOption.label}
          selectedOptions={[priority]}
          onOptionSelect={(_, data) => onPriorityChange(data.optionValue as PriorityFilter)}
        >
          {PRIORITY_OPTIONS.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Dropdown>
      }
    >
      {items.length === 0 ? (
        <ListEmptyState
          icon={<TaskListSquareLtr48Regular />}
          title="Aucun suivi à afficher"
          description={
            hasSearch || priority !== 'all'
              ? 'Essayez de modifier la recherche ou les filtres.'
              : 'Cette section est vide pour le moment.'
          }
          action={
            priority !== 'all' && (
              <Button size="small" onClick={() => onPriorityChange('all')}>
                Afficher toutes les priorités
              </Button>
            )
          }
        />
      ) : (
        <>
          {layout === 'table' && (
            <div className={styles.columns} aria-hidden>
              <Text size={200} weight="semibold">Expéditeur</Text>
              <Text size={200} weight="semibold">Objet</Text>
              <Text size={200} weight="semibold">Priorité</Text>
              <Text size={200} weight="semibold">Échéance</Text>
              <Text size={200} weight="semibold" className={styles.alignRight}>
                Reçu
              </Text>
            </div>
          )}
          {grouped ? renderGroups() : renderItems(items)}
        </>
      )}
    </ListCard>
  );
}
