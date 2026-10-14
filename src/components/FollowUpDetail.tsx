import {
  Body1,
  Button,
  Caption1,
  Divider,
  makeStyles,
  Subtitle2,
  Text,
  tokens,
  Tooltip,
} from '@fluentui/react-components';
import {
  ArrowUndo20Regular,
  CalendarEdit20Regular,
  CheckmarkCircle20Regular,
  Clock20Regular,
  Delete20Regular,
  Dismiss20Regular,
  TaskListSquareLtr20Regular,
} from '@fluentui/react-icons';
import { useState } from 'react';
import type { BodyLoader } from '../hooks/useMessageBody';
import type { FollowUp, FollowUpStatus } from '../types/followUp';
import { formatDateTime, formatLongDate } from '../utils/dates';
import { getEffectiveStatus } from '../utils/followUps';
import { DueBadge, PriorityBadge, StatusBadge } from './Badges';
import { useDetailStyles } from './detailStyles';
import { DueDateDialog } from './DueDateDialog';
import { EmailBody } from './EmailBody';
import { EmailHeader } from './EmailHeader';
import { NoteComposer } from './NoteComposer';
import { OpenInOutlookButton } from './OpenInOutlookButton';

const useStyles = makeStyles({
  facts: {
    margin: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingHorizontalM,
    // Encart posé dans le panneau : verre blanc en glassmorphisme, gris très clair façon Outlook.
    backgroundColor: 'var(--fu-inset-bg)',
    border: '1px solid var(--fu-inset-border)',
    boxShadow: 'var(--fu-inset-shadow)',
    borderRadius: 'var(--fu-radius-card)',
  },
  fact: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens.spacingVerticalXXS,
  },
  value: {
    margin: 0,
  },
  secondaryActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
  },
  notesHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalS,
  },
  notes: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    listStyleType: 'none',
    margin: `${tokens.spacingVerticalS} 0 0`,
    padding: 0,
  },
  note: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorPaletteYellowBackground1,
    borderLeft: `3px solid ${tokens.colorPaletteYellowBorder2}`,
    borderRadius: tokens.borderRadiusMedium,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
});

interface FollowUpDetailProps {
  item: FollowUp;
  loadBody?: BodyLoader;
  onStatusChange: (status: FollowUpStatus) => void;
  onDueDateChange: (dueDate: string) => void;
  onAddNote: (text: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function FollowUpDetail({
  item,
  loadBody,
  onStatusChange,
  onDueDateChange,
  onAddNote,
  onDelete,
  onClose,
}: FollowUpDetailProps) {
  const styles = useStyles();
  const detail = useDetailStyles();
  const [dueDialogOpen, setDueDialogOpen] = useState(false);
  const status = getEffectiveStatus(item);
  const done = item.status === 'done';
  const notes = [...item.notes].reverse();

  return (
    <article className={detail.root} aria-label={`Suivi : ${item.subject}`}>
      <div className={detail.commandBar} role="toolbar" aria-label="Actions du suivi">
        {done ? (
          <Button data-sound="click" icon={<ArrowUndo20Regular />} onClick={() => onStatusChange('todo')}>
            Rouvrir
          </Button>
        ) : (
          <Tooltip content="Marquer comme terminé" relationship="description">
            <Button appearance="primary" icon={<CheckmarkCircle20Regular />} onClick={() => onStatusChange('done')}>
              Terminer
            </Button>
          </Tooltip>
        )}
        {!done && (
          <Button data-sound="click" icon={<CalendarEdit20Regular />} onClick={() => setDueDialogOpen(true)}>
            Échéance
          </Button>
        )}
        {!done &&
          (item.status === 'waiting' ? (
            <Button data-sound="click" icon={<TaskListSquareLtr20Regular />} onClick={() => onStatusChange('todo')}>
              À traiter
            </Button>
          ) : (
            <Button data-sound="click" icon={<Clock20Regular />} onClick={() => onStatusChange('waiting')}>
              En attente
            </Button>
          ))}
        <OpenInOutlookButton webLink={item.webLink} demo={item.source === 'demo'} />
        <Tooltip content="Fermer" relationship="label">
          <Button data-sound="click" className={detail.close} appearance="subtle" icon={<Dismiss20Regular />} onClick={onClose} />
        </Tooltip>
      </div>

      <div className={detail.content}>
        <EmailHeader
          subject={item.subject}
          sender={item.sender}
          recipients={item.recipients}
          receivedAt={item.receivedAt}
          badges={
            <>
              <StatusBadge status={status} />
              <PriorityBadge priority={item.priority} />
            </>
          }
        />

        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>
              <Caption1 className={detail.muted}>Échéance de relance</Caption1>
            </dt>
            <dd className={styles.value}>
              <Text weight="semibold">{formatLongDate(item.dueDate)}</Text>
            </dd>
            <dd className={styles.value}>
              <DueBadge dueDate={item.dueDate} done={done} />
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>
              <Caption1 className={detail.muted}>{done ? 'Clôturé le' : 'Suivi créé le'}</Caption1>
            </dt>
            <dd className={styles.value}>
              <Text weight="semibold">
                {formatDateTime(done && item.completedAt ? item.completedAt : item.createdAt)}
              </Text>
            </dd>
          </div>
        </dl>

        <div className={styles.secondaryActions}>
          <Button appearance="subtle" icon={<Delete20Regular />} onClick={onDelete}>
            Supprimer le suivi
          </Button>
        </div>

        <Divider />
        <EmailBody text={item.body} preview={item.preview} messageId={item.messageId} loadBody={loadBody} />
        <Divider />

        <section aria-label="Notes">
          <div className={styles.notesHeader}>
            <Subtitle2 as="h3">Notes</Subtitle2>
            <Caption1 className={detail.muted}>{item.notes.length}</Caption1>
          </div>
          {notes.length > 0 ? (
            <ul className={styles.notes}>
              {notes.map((note) => (
                <li key={note.id} className={styles.note}>
                  <Body1>{note.text}</Body1>
                  <Caption1 className={detail.muted}>{formatDateTime(note.createdAt)}</Caption1>
                </li>
              ))}
            </ul>
          ) : (
            <Caption1 className={detail.muted}>Aucune note pour ce suivi.</Caption1>
          )}
        </section>

        <NoteComposer key={item.id} onAdd={onAddNote} />
      </div>

      {dueDialogOpen && (
        <DueDateDialog
          open
          currentDate={item.dueDate}
          onOpenChange={setDueDialogOpen}
          onSave={onDueDateChange}
        />
      )}
    </article>
  );
}
