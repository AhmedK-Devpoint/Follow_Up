import { Caption1, makeStyles, Persona, Title3, tokens } from '@fluentui/react-components';
import type { ReactNode } from 'react';
import type { Contact } from '../types/followUp';
import { formatDateTime } from '../utils/dates';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  title: {
    overflowWrap: 'anywhere',
  },
  badges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalS,
  },
  senderRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
});

interface EmailHeaderProps {
  subject: string;
  sender: Contact;
  recipients: Contact[];
  receivedAt: string;
  /** Badges affichés sous l'objet (statut, priorité, « Suivi »…). */
  badges?: ReactNode;
}

/** Objet, expéditeur, destinataires et date d'un email. */
export function EmailHeader({ subject, sender, recipients, receivedAt, badges }: EmailHeaderProps) {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <header>
        <Title3 as="h2" className={styles.title}>
          {subject}
        </Title3>
        {badges && <div className={styles.badges}>{badges}</div>}
      </header>
      <div className={styles.senderRow}>
        <Persona name={sender.name} secondaryText={sender.email} avatar={{ color: 'colorful' }} size="large" />
        <Caption1 className={styles.muted}>{formatDateTime(receivedAt)}</Caption1>
      </div>
      {recipients.length > 0 && (
        <Caption1 className={styles.muted}>À : {recipients.map((r) => r.name).join(', ')}</Caption1>
      )}
    </div>
  );
}
