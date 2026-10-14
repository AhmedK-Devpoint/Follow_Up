import { FluentProvider } from '@fluentui/react-components';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import App from './App.tsx';
import { msalInstance } from './authConfig';
import { applyInterfaceMode, appTheme } from './theme';
import { readPreferences } from './hooks/usePreferences';
import { installClickSounds, setSoundEnabled } from './utils/sounds';
import './index.css';

// Préférences d'interface appliquées avant le premier rendu (pas de flash de l'autre mode).
const preferences = readPreferences();
applyInterfaceMode(preferences?.glass !== false);
setSoundEnabled(preferences?.sound !== false);

installClickSounds();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <FluentProvider theme={appTheme}>
        <App />
      </FluentProvider>
    </MsalProvider>
  </StrictMode>,
);
