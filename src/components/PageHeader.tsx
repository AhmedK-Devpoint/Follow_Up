import { Body1, Caption1, Hamburger, makeStyles, SearchBox, tokens, Tooltip } from '@fluentui/react-components';
import { Clock16Regular } from '@fluentui/react-icons';
import { usePreferences } from '../hooks/usePreferences';
import { formatLongDate, toDateOnly } from '../utils/dates';

const useStyles = makeStyles({
  header: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gridTemplateAreas: `"meta search" "title search" "desc desc"`,
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalXL,
    rowGap: tokens.spacingVerticalXS,
    '@media (max-width: 719px)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateAreas: `"meta" "title" "desc" "search"`,
      rowGap: tokens.spacingVerticalS,
    },
  },
  meta: {
    gridArea: 'meta',
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground3,
  },
  title: {
    gridArea: 'title',
    margin: 0,
    fontSize: '32px',
    lineHeight: '40px',
    fontWeight: tokens.fontWeightBold,
    letterSpacing: '-0.02em',
    color: '#141233',
    '@media (max-width: 599px)': {
      fontSize: '26px',
      lineHeight: '32px',
    },
  },
  description: {
    gridArea: 'desc',
    maxWidth: '640px',
    color: tokens.colorNeutralForeground2,
  },
  search: {
    gridArea: 'search',
    width: '320px',
    maxWidth: 'none',
    // Même matière que les cartes (le gris « filled-darker » jurait sur le verre).
    backgroundColor: 'var(--fu-card-bg)',
    border: '1px solid var(--fu-card-border)',
    borderRadius: '12px',
    '@media (max-width: 719px)': {
      width: '100%',
    },
  },
});

interface PageHeaderProps {
  title: string;
  description: string;
  search: string;
  onSearchChange: (value: string) => void;
  /** Affiche le bouton de menu lorsque la barre latérale est repliée. */
  showMenuButton: boolean;
  onMenuClick: () => void;
}

export function PageHeader({ title, description, search, onSearchChange, showMenuButton, onMenuClick }: PageHeaderProps) {
  const styles = useStyles();
  const { firstName } = usePreferences();
  const today = formatLongDate(toDateOnly(new Date()));

  return (
    <header className={styles.header}>
      <div className={styles.meta}>
        {showMenuButton && (
          <Tooltip content="Afficher les sections" relationship="label">
            <Hamburger onClick={onMenuClick} />
          </Tooltip>
        )}
        <Clock16Regular aria-hidden />
        <Caption1>{firstName ? `Bonjour ${firstName} · ${today}` : today}</Caption1>
      </div>
      <h1 className={styles.title}>{title}</h1>
      <Body1 className={styles.description}>{description}</Body1>
      <SearchBox
        className={styles.search}
        size="large"
        appearance="filled-darker"
        placeholder="Rechercher…"
        aria-label="Rechercher un expéditeur, un objet ou une note"
        value={search}
        onChange={(_, data) => onSearchChange(data.value)}
      />
    </header>
  );
}
