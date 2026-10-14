import {
  Body1,
  Button,
  Caption1,
  makeStyles,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
  tokens,
} from '@fluentui/react-components';
import {
  Eye16Regular,
  LockClosed16Regular,
  MailCheckmark24Filled,
  Settings16Regular,
  Storage16Regular,
} from '@fluentui/react-icons';
import { useRef, useState } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import type { UserFacingError } from '../services/errors';
import { APP_GRADIENT, frosted } from '../theme';
import { CreditsRoll } from './CreditsRoll';
import { ErrorBar } from './ErrorBar';
import { gsap, reduceMotion, useGSAP } from '../utils/motion';
import { MicrosoftLogo } from './MicrosoftLogo';

const useStyles = makeStyles({
  page: {
    display: 'grid',
    placeItems: 'center',
    minHeight: '100dvh',
    padding: tokens.spacingHorizontalL,
    backgroundImage: APP_GRADIENT,
  },
  card: {
    ...frosted,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    width: '100%',
    maxWidth: '440px',
    padding: '40px 32px 32px',
    borderRadius: '28px',
    '@media (max-width: 479px)': {
      padding: '28px 20px 20px',
    },
  },
  logo: {
    display: 'grid',
    placeItems: 'center',
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    color: '#fff',
    backgroundImage: 'linear-gradient(135deg, #6042d1, #c86f8c)',
    boxShadow: '0 8px 20px rgba(96, 66, 209, 0.35)',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    lineHeight: '36px',
    fontWeight: tokens.fontWeightBold,
    letterSpacing: '-0.02em',
    color: '#141233',
  },
  lead: {
    color: tokens.colorNeutralForeground2,
  },
  signIn: {
    height: '44px',
    fontSize: tokens.fontSizeBase400,
  },
  busy: {
    height: '44px',
  },
  points: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    margin: 0,
    padding: 0,
    listStyleType: 'none',
    color: tokens.colorNeutralForeground3,
  },
  point: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
  },
  eyebrow: {
    display: 'block',
    marginBottom: tokens.spacingVerticalXS,
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  editPreferences: {
    alignSelf: 'center',
  },
  credits: {
    alignSelf: 'center',
    marginTop: `-${tokens.spacingVerticalM}`,
    color: tokens.colorNeutralForeground4,
    fontSize: tokens.fontSizeBase100,
    letterSpacing: '0.08em',
  },
  pointIcon: {
    flexShrink: 0,
    marginTop: '2px',
  },
});

interface SignInScreenProps {
  configured: boolean;
  busy: boolean;
  error: UserFacingError | null;
  onSignIn: () => void;
  onDismissError: () => void;
  onDemo: () => void;
  /** Rouvre les préférences choisies lors de l'introduction. */
  onEditPreferences: () => void;
}

export function SignInScreen({
  configured,
  busy,
  error,
  onSignIn,
  onDismissError,
  onDemo,
  onEditPreferences,
}: SignInScreenProps) {
  const styles = useStyles();
  const { firstName, companyName } = usePreferences();
  const root = useRef<HTMLElement>(null);
  const [showCredits, setShowCredits] = useState(false);

  // Mini intro : la carte apparaît, le logo rebondit légèrement, puis le contenu se dévoile.
  useGSAP(
    () => {
      if (reduceMotion()) return;
      gsap
        .timeline()
        .from('[data-card]', { autoAlpha: 0, y: 28, scale: 0.97, duration: 0.7 })
        .from('[data-logo]', { scale: 0.6, rotate: -12, duration: 0.6, ease: 'back.out(2.2)' }, '<0.2')
        .from('[data-card] > :not([data-logo])', { autoAlpha: 0, y: 10, stagger: 0.07, duration: 0.45 }, '<0.1');
    },
    { scope: root },
  );

  return (
    <main ref={root} className={styles.page}>
      <section data-card className={styles.card} aria-labelledby="signin-title">
        <span data-logo className={styles.logo}>
          <MailCheckmark24Filled />
        </span>
        <div>
          <Caption1 className={styles.eyebrow}>
            {companyName ? `Follow-up Manager · ${companyName}` : 'Follow-up Manager'}
          </Caption1>
          <h1 id="signin-title" className={styles.title}>
            {firstName ? `Bonjour ${firstName}, connectez Outlook` : 'Connectez votre boîte Outlook'}
          </h1>
          <Body1 className={styles.lead}>
            Dernière étape : vos emails s'affichent et vous créez vos premiers suivis en un clic.
          </Body1>
        </div>

        {!configured && (
          <MessageBar intent="warning" layout="multiline">
            <MessageBarBody>
              <MessageBarTitle>Connexion Microsoft non configurée</MessageBarTitle>
              Renseignez VITE_MS_CLIENT_ID et VITE_MS_TENANT_ID dans le fichier .env, puis redémarrez le serveur.
            </MessageBarBody>
          </MessageBar>
        )}
        {error && <ErrorBar error={error} onDismiss={onDismissError} />}

        {busy ? (
          <Spinner className={styles.busy} size="small" label="Connexion en cours…" />
        ) : (
          <Button
            data-sound="click"
            className={styles.signIn}
            size="large"
            icon={<MicrosoftLogo />}
            onClick={onSignIn}
            disabled={!configured}
          >
            Se connecter avec Microsoft
          </Button>
        )}
        <Button data-sound="click" appearance="subtle" onClick={onDemo} disabled={busy}>
          Explorer avec des données de démonstration
        </Button>

        <ul className={styles.points}>
          <li className={styles.point}>
            <Eye16Regular className={styles.pointIcon} />
            <Caption1>Lecture seule : vos emails ne sont jamais modifiés dans Outlook.</Caption1>
          </li>
          <li className={styles.point}>
            <LockClosed16Regular className={styles.pointIcon} />
            <Caption1>Connexion sur la page officielle de Microsoft : l'application ne voit pas votre mot de passe.</Caption1>
          </li>
          <li className={styles.point}>
            <Storage16Regular className={styles.pointIcon} />
            <Caption1>Vos suivis sont enregistrés dans ce navigateur uniquement.</Caption1>
          </li>
        </ul>

        <Button
          className={styles.editPreferences}
          appearance="transparent"
          size="small"
          icon={<Settings16Regular />}
          onClick={onEditPreferences}
          disabled={busy}
        >
          Modifier mes préférences
        </Button>
        <Button className={styles.credits} appearance="transparent" size="small" onClick={() => setShowCredits(true)}>
          Crédits · DEVPOINT
        </Button>
      </section>
      {showCredits && <CreditsRoll onClose={() => setShowCredits(false)} />}
    </main>
  );
}
