import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} from '@fluentui/react-components';
import { useState, type FormEvent } from 'react';
import { isDateOnly } from '../utils/dates';
import { DueDatePicker } from './DueDatePicker';

interface DueDateDialogProps {
  open: boolean;
  currentDate: string;
  onOpenChange: (open: boolean) => void;
  onSave: (dueDate: string) => void;
}

/** Monté uniquement lorsqu'il est ouvert : l'état local repart ainsi de l'échéance courante. */
export function DueDateDialog({ open, currentDate, onOpenChange, onSave }: DueDateDialogProps) {
  const [value, setValue] = useState(currentDate);
  const valid = isDateOnly(value);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    onSave(value);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>Modifier l'échéance</DialogTitle>
            <DialogContent>
              <DueDatePicker value={value} onChange={setValue} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button data-sound="click" type="submit" appearance="primary" disabled={!valid}>
                Enregistrer
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}
