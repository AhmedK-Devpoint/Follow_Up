import { Caption1, makeStyles, Skeleton, SkeletonItem, tokens } from '@fluentui/react-components';
import { useMessageBody, type BodyLoader } from '../hooks/useMessageBody';

const useStyles = makeStyles({
  body: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase400,
  },
  skeleton: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  short: {
    width: '70%',
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
});

interface EmailBodyProps {
  /** Corps déjà connu (données de démonstration). */
  text?: string;
  preview: string;
  messageId?: string;
  loadBody?: BodyLoader;
}

/**
 * Corps de l'email en texte brut. Pour Outlook, il est chargé à la demande et
 * affiché tel quel (aucun HTML interprété).
 */
export function EmailBody({ text, preview, messageId, loadBody }: EmailBodyProps) {
  const styles = useStyles();
  const state = useMessageBody(text === undefined ? loadBody : undefined, messageId);

  if (text !== undefined) return <pre className={styles.body}>{text}</pre>;

  if (state.status === 'loading') {
    return (
      <Skeleton className={styles.skeleton} aria-label="Chargement du message">
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem className={styles.short} />
      </Skeleton>
    );
  }

  if (state.status === 'ready') return <pre className={styles.body}>{state.text || preview}</pre>;

  return (
    <>
      <pre className={styles.body}>{preview || '(Aucun aperçu disponible)'}</pre>
      {state.status === 'error' && (
        <Caption1 className={styles.muted}>
          Aperçu uniquement : le message complet n'a pas pu être chargé ({state.error.title.toLowerCase()}).
        </Caption1>
      )}
    </>
  );
}
