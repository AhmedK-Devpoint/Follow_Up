import { Button, Field, Input, makeStyles, tokens } from '@fluentui/react-components';
import { usePreferences } from '../hooks/usePreferences';
import { dueDateIn, formatLongDate, isDateOnly } from '../utils/dates';

const QUICK_PICKS: { label: string; days: number }[] = [
  { label: 'Demain', days: 1 },
  { label: 'Dans 3 jours', days: 3 },
  { label: 'Dans 1 semaine', days: 7 },
  { label: 'Dans 2 semaines', days: 14 },
];

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  quickPicks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
  },
});

interface DueDatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

/** Champ de date d'échéance avec raccourcis (demain, dans 3 jours…). */
export function DueDatePicker({ value, onChange }: DueDatePickerProps) {
  const styles = useStyles();
  const { workWeek } = usePreferences();
  const valid = isDateOnly(value);

  return (
    <div className={styles.root}>
      <Field
        label="Date de relance"
        required
        validationState={valid ? 'none' : 'error'}
        validationMessage={valid ? formatLongDate(value) : 'Veuillez choisir une date valide.'}
      >
        <Input type="date" value={value} onChange={(_, data) => onChange(data.value)} />
      </Field>
      <div className={styles.quickPicks} role="group" aria-label="Raccourcis de date">
        {QUICK_PICKS.map((pick) => (
          <Button key={pick.days} size="small" shape="circular" onClick={() => onChange(dueDateIn(pick.days, workWeek))}>
            {pick.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
