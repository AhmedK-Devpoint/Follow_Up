import {
  Caption1,
  CounterBadge,
  makeStyles,
  mergeClasses,
  NavDrawer,
  NavDrawerBody,
  NavDrawerFooter,
  NavDrawerHeader,
  NavItem,
  NavSectionHeader,
  Text,
  tokens,
} from '@fluentui/react-components';
import {
  bundleIcon,
  CheckmarkCircle20Filled,
  CheckmarkCircle20Regular,
  DataPie20Filled,
  DataPie20Regular,
  Clock20Filled,
  Clock20Regular,
  Mail20Filled,
  Mail20Regular,
  MailCheckmark24Filled,
  MailInbox20Filled,
  MailInbox20Regular,
  TaskListSquareLtr20Filled,
  TaskListSquareLtr20Regular,
  Warning20Filled,
  Warning20Regular,
} from '@fluentui/react-icons';
import type { ReactNode } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import { glass } from '../theme';
import type { FollowUpCounts, FollowUpView, ViewFilter } from '../types/followUp';
import { VIEW_LABELS } from '../utils/followUps';

const VIEW_ICONS: Record<ViewFilter, ReturnType<typeof bundleIcon>> = {
  overview: bundleIcon(DataPie20Filled, DataPie20Regular),
  inbox: bundleIcon(Mail20Filled, Mail20Regular),
  all: bundleIcon(MailInbox20Filled, MailInbox20Regular),
  todo: bundleIcon(TaskListSquareLtr20Filled, TaskListSquareLtr20Regular),
  waiting: bundleIcon(Clock20Filled, Clock20Regular),
  overdue: bundleIcon(Warning20Filled, Warning20Regular),
  done: bundleIcon(CheckmarkCircle20Filled, CheckmarkCircle20Regular),
};

const STATUS_VIEWS: FollowUpView[] = ['todo', 'waiting', 'overdue', 'done'];

const useStyles = makeStyles({
  drawer: {
    // Largeur fixe : sans `flexShrink: 0`, la barre se faisait écraser par la liste et coupait son contenu.
    '--fui-Drawer--size': '256px',
    width: '256px',
    minWidth: '256px',
    flexShrink: 0,
    color: 'var(--fu-side-fg)',
    // Les composants Nav lisent ces jetons : ils suivent le mode d'interface (verre sombre ou barre blanche).
    '--colorNeutralBackground4': 'transparent',
    '--colorNeutralBackground4Hover': 'var(--fu-side-hover)',
    '--colorNeutralBackground4Pressed': 'var(--fu-side-pressed)',
    '--colorNeutralForeground1': 'var(--fu-side-fg)',
    '--colorNeutralForeground2': 'var(--fu-side-fg2)',
    '--colorNeutralForeground3': 'var(--fu-side-fg3)',
    '--colorNeutralForeground2BrandSelected': 'var(--fu-side-selected-fg)',
    '--colorCompoundBrandForeground1': 'var(--fu-side-selected-fg)',
    '--colorStrokeFocus2': 'var(--fu-side-focus)',
  },
  inline: {
    ...glass,
    height: 'auto',
    borderRadius: 'var(--fu-radius-panel)',
    overflow: 'hidden',
  },
  overlay: {
    backgroundImage: 'var(--fu-side-overlay-image)',
    backgroundColor: 'var(--fu-side-overlay-bg)',
  },
  header: {
    padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalL} ${tokens.spacingVerticalM}`,
  },
  brand: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  logo: {
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    color: '#fff',
    backgroundColor: 'var(--fu-side-logo-bg)',
    border: '1px solid var(--fu-side-logo-border)',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  brandName: {
    color: 'var(--fu-side-fg)',
    letterSpacing: '-0.01em',
  },
  company: {
    color: 'var(--fu-side-fg3)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  section: {
    textTransform: 'none',
    color: 'var(--fu-side-fg3)',
  },
  item: {
    borderRadius: tokens.borderRadiusLarge,
    marginBottom: '2px',
    '&[aria-current="page"]': {
      color: 'var(--fu-side-selected-fg)',
      backgroundColor: 'var(--fu-side-selected-bg)',
      boxShadow: 'var(--fu-side-selected-shadow)',
    },
  },
  label: {
    flexGrow: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  count: {
    flexShrink: 0,
    minWidth: '20px',
    paddingRight: tokens.spacingHorizontalXS,
    textAlign: 'right',
    color: 'var(--fu-side-fg3)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Carte de verre alignée sur les éléments du menu (le pied Fluent ajoute sinon sa propre marge).
  footer: {
    display: 'flex',
    // Le pied Fluent prend 100 % de largeur : sans `auto`, les marges le font déborder.
    width: 'auto',
    minWidth: 0,
    margin: `${tokens.spacingVerticalS} 10px 10px`,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalXS} ${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
    borderRadius: 'var(--fu-radius-card)',
    backgroundColor: 'var(--fu-side-footer-bg)',
    border: '1px solid var(--fu-side-footer-border)',
    boxShadow: 'var(--fu-side-footer-shadow)',
  },
});

interface SidebarProps {
  view: ViewFilter;
  counts: FollowUpCounts;
  /** Nombre d'emails Outlook chargés ; absent en mode démonstration (pas de boîte de réception). */
  inboxCount?: number;
  /** Zone du bas : compte connecté ou mode démo. */
  footer: ReactNode;
  onViewChange: (view: ViewFilter) => void;
  /** `inline` sur grand écran, `overlay` (tiroir) sur petit écran. */
  type: 'inline' | 'overlay';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ view, counts, inboxCount, footer, onViewChange, type, open, onOpenChange }: SidebarProps) {
  const styles = useStyles();
  const { companyName } = usePreferences();

  const renderItem = (value: ViewFilter) => {
    const Icon = VIEW_ICONS[value];
    const count = value === 'inbox' ? (inboxCount ?? 0) : value === 'overview' ? 0 : counts[value];
    return (
      <NavItem data-sound="click" key={value} value={value} icon={<Icon />} className={styles.item}>
        <span className={styles.label}>{VIEW_LABELS[value]}</span>
        {value === 'overdue' && count > 0 ? (
          <CounterBadge count={count} size="small" color="danger" />
        ) : (
          count > 0 && <Caption1 className={styles.count}>{count}</Caption1>
        )}
      </NavItem>
    );
  };

  return (
    <NavDrawer
      className={mergeClasses(styles.drawer, type === 'inline' ? styles.inline : styles.overlay)}
      type={type}
      open={open}
      onOpenChange={(_, data) => onOpenChange(data.open)}
      selectedValue={view}
      onNavItemSelect={(_, data) => onViewChange(data.value as ViewFilter)}
      aria-label="Sections de suivi"
    >
      <NavDrawerHeader className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            <MailCheckmark24Filled />
          </span>
          <span className={styles.brandText}>
            <Text weight="semibold" size={500} className={styles.brandName}>
              Follow-up Manager
            </Text>
            {companyName && (
              <Caption1 className={styles.company} title={companyName}>
                {companyName}
              </Caption1>
            )}
          </span>
        </div>
      </NavDrawerHeader>
      <NavDrawerBody>
        <NavSectionHeader className={styles.section}>Pilotage</NavSectionHeader>
        {renderItem('overview')}
        {inboxCount !== undefined && (
          <>
            <NavSectionHeader className={styles.section}>Outlook</NavSectionHeader>
            {renderItem('inbox')}
          </>
        )}
        <NavSectionHeader className={styles.section}>Mes suivis</NavSectionHeader>
        {renderItem('all')}
        <NavSectionHeader className={styles.section}>Par statut</NavSectionHeader>
        {STATUS_VIEWS.map(renderItem)}
      </NavDrawerBody>
      <NavDrawerFooter className={styles.footer}>{footer}</NavDrawerFooter>
    </NavDrawer>
  );
}
