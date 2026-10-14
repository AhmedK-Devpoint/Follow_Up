import { Body1, Caption1, makeStyles, Subtitle2, tokens } from '@fluentui/react-components';
import type { ReactElement, ReactNode, Ref } from 'react';
import { card } from '../theme';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    ...card,
    borderRadius: '16px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  title: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalS,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalS,
    padding: `${tokens.spacingVerticalXXXL} ${tokens.spacingHorizontalL}`,
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },
});

interface ListCardProps {
  title: string;
  /** Sous-titre affiché à côté du titre (ex. « 12 suivis »). */
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  sectionRef?: Ref<HTMLElement>;
}

/** Carte blanche contenant une liste, avec un en-tête titre + actions. */
export function ListCard({ title, subtitle, actions, children, sectionRef }: ListCardProps) {
  const styles = useStyles();
  return (
    <section ref={sectionRef} className={styles.card} aria-label={title}>
      <header className={styles.header}>
        <div className={styles.title}>
          <Subtitle2 as="h2">{title}</Subtitle2>
          {subtitle && <Caption1 className={styles.muted}>{subtitle}</Caption1>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </header>
      {children}
    </section>
  );
}

interface ListEmptyStateProps {
  icon: ReactElement;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function ListEmptyState({ icon, title, description, action }: ListEmptyStateProps) {
  const styles = useStyles();
  return (
    <div className={styles.empty}>
      {icon}
      <Body1>{title}</Body1>
      {description && <Caption1>{description}</Caption1>}
      {action}
    </div>
  );
}
