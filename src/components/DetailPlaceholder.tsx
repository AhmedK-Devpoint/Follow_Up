import { Body1, Caption1, makeStyles, tokens } from '@fluentui/react-components';
import { MailInbox48Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalS,
    height: '100%',
    padding: tokens.spacingHorizontalXXL,
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },
});

export function DetailPlaceholder() {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <MailInbox48Regular />
      <Body1>Sélectionnez un email ou un suivi</Body1>
      <Caption1>Son contenu, son échéance et vos notes s'afficheront ici.</Caption1>
    </div>
  );
}
