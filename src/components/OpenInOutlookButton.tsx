import { Button, Tooltip } from '@fluentui/react-components';
import { Open20Regular } from '@fluentui/react-icons';

/** Boîte de réception Outlook sur le web : cible du bouton en mode démonstration. */
const OUTLOOK_WEB_INBOX = 'https://outlook.office.com/mail/';

/** N'accepte que des liens HTTPS (le lien vient de l'API, on ne fait pas confiance aveuglément). */
function isSafeLink(url: string | undefined): url is string {
  try {
    return url !== undefined && new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

interface OpenInOutlookButtonProps {
  webLink?: string;
  /** Email fictif : il n'existe pas dans Outlook, on ouvre donc la boîte de réception. */
  demo?: boolean;
}

/** Ouvre le message original dans Outlook sur le web, dans un nouvel onglet. */
export function OpenInOutlookButton({ webLink, demo = false }: OpenInOutlookButtonProps) {
  const href = demo ? OUTLOOK_WEB_INBOX : webLink;
  if (!isSafeLink(href)) return null;
  return (
    <Tooltip
      content={
        demo
          ? 'Email fictif : ouvre votre boîte Outlook. Une fois connecté, ce bouton ouvre directement l’email.'
          : 'Ouvrir cet email dans Outlook (nouvel onglet)'
      }
      relationship="description"
    >
      <Button
        data-sound="click"
        as="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        icon={<Open20Regular />}
      >
        Ouvrir dans Outlook
      </Button>
    </Tooltip>
  );
}
