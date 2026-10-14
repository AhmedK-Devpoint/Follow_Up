import { makeStyles, Spinner } from '@fluentui/react-components';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { isAuthConfigured } from './authConfig';
import { AccountPanel } from './components/AccountPanel';
import { ErrorBar } from './components/ErrorBar';
import { Onboarding } from './components/Onboarding';
import { PreferencesPanel } from './components/PreferencesPanel';
import { SignInScreen } from './components/SignInScreen';
import { SplashIntro } from './components/SplashIntro';
import { DemoBanner, Workspace } from './components/Workspace';
import { useMicrosoftAuth, type MicrosoftAuth } from './hooks/useMicrosoftAuth';
import { useOutlookMessages } from './hooks/useOutlookMessages';
import { DEFAULT_PREFERENCES, PreferencesProvider, useStoredPreferences } from './hooks/usePreferences';
import { fetchMessageBody } from './services/graph';
import { APP_GRADIENT, applyInterfaceMode } from './theme';
import { setSoundEnabled } from './utils/sounds';

const useStyles = makeStyles({
  loading: {
    display: 'grid',
    placeItems: 'center',
    minHeight: '100dvh',
    backgroundImage: APP_GRADIENT,
    // Texte posé directement sur le fond de page : blanc sur le dégradé, sombre en mode sans verre.
    '--colorNeutralForeground2': 'var(--fu-on-page)',
    '--colorBrandStroke1': 'var(--fu-on-page-accent)',
    '--colorBrandStroke2Contrast': 'var(--fu-on-page-track)',
    color: 'var(--fu-on-page)',
  },
});

function FullPageSpinner({ label }: { label: string }) {
  const styles = useStyles();
  return (
    <div className={styles.loading}>
      <Spinner label={label} />
    </div>
  );
}

interface OutlookWorkspaceProps {
  auth: MicrosoftAuth & { account: NonNullable<MicrosoftAuth['account']> };
  onOpenPreferences: () => void;
  onOpenIntro: () => void;
}

/** Espace de travail connecté : emails Outlook réels + suivis enregistrés pour ce compte. */
function OutlookWorkspace({ auth, onOpenPreferences, onOpenIntro }: OutlookWorkspaceProps) {
  const { account, getToken } = auth;
  const inboxState = useOutlookMessages(getToken);
  // Corps des emails gardés en mémoire le temps de la session (jamais dans le stockage du navigateur).
  const bodies = useRef(new Map<string, string>());
  const loadBody = useCallback(
    async (messageId: string) => {
      const cached = bodies.current.get(messageId);
      if (cached !== undefined) return cached;
      const text = await fetchMessageBody(await getToken(), messageId);
      bodies.current.set(messageId, text);
      return text;
    },
    [getToken],
  );
  const inbox = useMemo(() => ({ state: inboxState, loadBody }), [inboxState, loadBody]);

  return (
    <Workspace
      storageId={account.homeAccountId}
      inbox={inbox}
      banner={auth.error && <ErrorBar error={auth.error} onDismiss={auth.clearError} />}
      accountPanel={
        <AccountPanel
          mode="outlook"
          name={account.name ?? ''}
          username={account.username}
          busy={auth.busy}
          onSignOut={() => void auth.signOut()}
          onOpenPreferences={onOpenPreferences}
          onOpenIntro={onOpenIntro}
        />
      }
    />
  );
}

type OnboardingMode = 'welcome';

type SplashPhase = 'playing' | 'revealing' | 'done';

export default function App() {
  const [splash, setSplash] = useState<SplashPhase>('playing');
  const revealApp = useCallback(() => setSplash((phase) => (phase === 'playing' ? 'revealing' : phase)), []);
  const endSplash = useCallback(() => setSplash('done'), []);

  // Intro vidéo à chaque ouverture ; l'application est montée dessous dès que l'intro
  // commence à s'effacer, pour un vrai fondu enchaîné.
  return (
    <>
      {splash !== 'playing' && <Screens />}
      {splash !== 'done' && <SplashIntro onReveal={revealApp} onDone={endSplash} />}
    </>
  );
}

/** Écran courant : préférences, connexion, démo ou espace Outlook. */
function Screens() {
  const auth = useMicrosoftAuth();
  const [demo, setDemo] = useState(false);
  const [preferences, savePreferences] = useStoredPreferences();
  const [onboarding, setOnboarding] = useState<OnboardingMode | null>(null);
  // Panneau des préférences sur une page ; la clé repart des valeurs enregistrées à chaque ouverture.
  const [settings, setSettings] = useState({ open: false, key: 0 });
  // Les préférences sont présentées à chaque ouverture tant que l'on n'est pas connecté.
  const [preferencesReviewed, setPreferencesReviewed] = useState(false);

  if (auth.starting) return <FullPageSpinner label="Connexion en cours…" />;

  // Avant la connexion : introduction puis préférences (préremplies si déjà choisies).
  // Un compte Outlook déjà connecté va directement à son espace de travail.
  if (!preferences || (!auth.account && !preferencesReviewed)) {
    return (
      <Onboarding
        mode="welcome"
        initial={preferences ?? DEFAULT_PREFERENCES}
        onComplete={(next) => {
          savePreferences(next);
          setPreferencesReviewed(true);
        }}
      />
    );
  }

  const openPreferences = () => setSettings((current) => ({ open: true, key: current.key + 1 }));
  const closePreferences = () => setSettings((current) => ({ ...current, open: false }));
  const openIntro = () => setOnboarding('welcome');
  const signIn = () => void auth.signIn();
  // Sans prénom saisi, on reprend celui du compte Microsoft.
  const accountFirstName = auth.account?.name?.trim().split(/\s+/)[0] ?? '';
  const effective = { ...preferences, firstName: preferences.firstName || accountFirstName };

  let screen: ReactNode;
  if (auth.account) {
    screen = (
      <OutlookWorkspace
        key={auth.account.homeAccountId}
        auth={{ ...auth, account: auth.account }}
        onOpenPreferences={openPreferences}
        onOpenIntro={openIntro}
      />
    );
  } else if (demo) {
    screen = (
      <Workspace
        key="demo"
        storageId={null}
        banner={
          <DemoBanner
            signInAvailable={isAuthConfigured && !auth.busy}
            onSignIn={signIn}
            authError={auth.error}
            onDismissError={auth.clearError}
          />
        }
        accountPanel={
          <AccountPanel
            mode="demo"
            signInAvailable={isAuthConfigured && !auth.busy}
            onSignIn={signIn}
            onExitDemo={() => setDemo(false)}
            onOpenPreferences={openPreferences}
            onOpenIntro={openIntro}
          />
        }
      />
    );
  } else {
    screen = (
      <SignInScreen
        configured={isAuthConfigured}
        busy={auth.busy}
        error={auth.error}
        onSignIn={signIn}
        onDismissError={auth.clearError}
        onDemo={() => setDemo(true)}
        onEditPreferences={openPreferences}
      />
    );
  }

  return (
    <PreferencesProvider value={effective}>
      {screen}
      <PreferencesPanel
        key={settings.key}
        open={settings.open}
        initial={preferences}
        onClose={closePreferences}
        onSave={(next) => {
          savePreferences(next);
          setSoundEnabled(next.sound);
          // Tout le rendu passe par des variables CSS : le changement de mode est immédiat.
          applyInterfaceMode(next.glass);
          closePreferences();
        }}
      />
      {onboarding && (
        <Onboarding
          mode={onboarding}
          initial={preferences}
          onCancel={() => setOnboarding(null)}
          onComplete={(next) => {
            savePreferences(next);
            setOnboarding(null);
          }}
        />
      )}
    </PreferencesProvider>
  );
}
