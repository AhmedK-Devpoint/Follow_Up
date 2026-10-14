import { Button, Field, makeStyles, Textarea, tokens } from '@fluentui/react-components';
import { NoteAdd20Regular } from '@fluentui/react-icons';
import { useState, type FormEvent, type KeyboardEvent } from 'react';

const useStyles = makeStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: tokens.spacingVerticalS,
  },
  field: {
    alignSelf: 'stretch',
  },
});

interface NoteComposerProps {
  onAdd: (text: string) => void;
}

export function NoteComposer({ onAdd }: NoteComposerProps) {
  const styles = useStyles();
  const [text, setText] = useState('');
  const trimmed = text.trim();

  const submit = () => {
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Field className={styles.field} label="Nouvelle note" hint="Ctrl + Entrée pour ajouter">
        <Textarea
          value={text}
          onChange={(_, data) => setText(data.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex. : relancé par téléphone, réponse attendue jeudi…"
          resize="vertical"
          rows={3}
        />
      </Field>
      <Button data-sound="click" type="submit" icon={<NoteAdd20Regular />} disabled={!trimmed}>
        Ajouter la note
      </Button>
    </form>
  );
}
