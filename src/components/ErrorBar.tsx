import {
  Button,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
} from '@fluentui/react-components';
import { Copy20Regular, Dismiss20Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import { adminConsentUrl } from '../authConfig';
import type { UserFacingError } from '../services/errors';

interface ErrorBarProps {
  error: UserFacingError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/** Message d'erreur en français, avec le code technique pour le support. */
export function ErrorBar({ error, onRetry, onDismiss, className }: ErrorBarProps) {
  const [copied, setCopied] = useState(false);
  const canCopyConsent = error.kind === 'consent' && adminConsentUrl !== null;

  const copyConsentLink = async () => {
    if (!adminConsentUrl) return;
    try {
      await navigator.clipboard.writeText(adminConsentUrl);
      setCopied(true);
    } catch {
      window.prompt("Copiez ce lien et envoyez-le à votre administrateur :", adminConsentUrl);
    }
  };

  return (
    <MessageBar intent="error" layout="multiline" className={className}>
      <MessageBarBody>
        <MessageBarTitle>{error.title}</MessageBarTitle>
        {error.message}
        {error.code && <> (code : {error.code})</>}
      </MessageBarBody>
      {(onRetry || onDismiss || canCopyConsent) && (
        <MessageBarActions
          containerAction={
            onDismiss && (
              <Button appearance="transparent" icon={<Dismiss20Regular />} aria-label="Fermer" onClick={onDismiss} />
            )
          }
        >
          {canCopyConsent && (
            <Button icon={<Copy20Regular />} onClick={() => void copyConsentLink()}>
              {copied ? 'Lien copié' : 'Copier le lien pour l’administrateur'}
            </Button>
          )}
          {onRetry && <Button onClick={onRetry}>Réessayer</Button>}
        </MessageBarActions>
      )}
    </MessageBar>
  );
}
