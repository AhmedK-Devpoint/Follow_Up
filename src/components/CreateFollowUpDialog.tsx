import {
  Button,
  Caption1,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Field,
  makeStyles,
  Radio,
  RadioGroup,
  Textarea,
  tokens,
} from '@fluentui/react-components';
import { useState, type FormEvent } from 'react';
import type { FollowUpDraft, Priority } from '../types/followUp';
import { PRIORITY_LABELS, STATUS_LABELS } from '../utils/followUps';
import { usePreferences } from '../hooks/usePreferences';
import { dueDateIn, isDateOnly } from '../utils/dates';
import { DueDatePicker } from './DueDatePicker';

const PRIORITIES: Priority[] = ['high', 'normal', 'low'];
const STATUSES: FollowUpDraft['status'][] = ['todo', 'waiting'];

const useStyles = makeStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  subject: {
    color: tokens.colorNeutralForeground3,
  },
});

interface CreateFollowUpDialogProps {
  subject: string;
  onOpenChange: (open: boolean) => void;
  onCreate: (draft: FollowUpDraft) => void;
}

/** Monté uniquement lorsqu'il est ouvert, pour repartir d'un formulaire vierge. */
export function CreateFollowUpDialog({ subject, onOpenChange, onCreate }: CreateFollowUpDialogProps) {
  const styles = useStyles();
  const preferences = usePreferences();
  const [draft, setDraft] = useState<FollowUpDraft>({
    dueDate: dueDateIn(preferences.reminderDays, preferences.workWeek),
    priority: preferences.defaultPriority,
    status: 'todo',
    note: '',
  });
  const valid = isDateOnly(draft.dueDate);
  const update = (patch: Partial<FollowUpDraft>) => setDraft((current) => ({ ...current, ...patch }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    onCreate(draft);
    onOpenChange(false);
  };

  return (
    <Dialog open onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>Créer un suivi</DialogTitle>
            <DialogContent className={styles.content}>
              <Caption1 className={styles.subject}>
                {subject} — le suivi reste interne à Follow-up Manager, l'email n'est pas modifié dans Outlook.
              </Caption1>
              <DueDatePicker value={draft.dueDate} onChange={(dueDate) => update({ dueDate })} />
              <Field label="Statut">
                <RadioGroup
                  layout="horizontal"
                  value={draft.status}
                  onChange={(_, data) => update({ status: data.value as FollowUpDraft['status'] })}
                >
                  {STATUSES.map((status) => (
                    <Radio key={status} value={status} label={STATUS_LABELS[status]} />
                  ))}
                </RadioGroup>
              </Field>
              <Field label="Priorité">
                <RadioGroup
                  layout="horizontal"
                  value={draft.priority}
                  onChange={(_, data) => update({ priority: data.value as Priority })}
                >
                  {PRIORITIES.map((priority) => (
                    <Radio key={priority} value={priority} label={PRIORITY_LABELS[priority]} />
                  ))}
                </RadioGroup>
              </Field>
              <Field label="Note (facultatif)">
                <Textarea
                  value={draft.note}
                  onChange={(_, data) => update({ note: data.value })}
                  placeholder="Ex. : attendre la validation du devis avant de relancer"
                  resize="vertical"
                />
              </Field>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button data-sound="click" type="submit" appearance="primary" disabled={!valid}>
                Créer le suivi
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}
