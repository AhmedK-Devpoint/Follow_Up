import { Badge, Button, Divider, MessageBar, MessageBarBody, Tooltip } from '@fluentui/react-components';
import { AddCircle20Regular, Dismiss20Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import type { BodyLoader } from '../hooks/useMessageBody';
import type { FollowUpDraft, OutlookMessage } from '../types/followUp';
import { CreateFollowUpDialog } from './CreateFollowUpDialog';
import { useDetailStyles } from './detailStyles';
import { EmailBody } from './EmailBody';
import { EmailHeader } from './EmailHeader';
import { OpenInOutlookButton } from './OpenInOutlookButton';

interface MessageDetailProps {
  message: OutlookMessage;
  loadBody: BodyLoader;
  onCreateFollowUp: (draft: FollowUpDraft) => void;
  onClose: () => void;
}

/** Email Outlook sans suivi : consultation et création d'un suivi. */
export function MessageDetail({ message, loadBody, onCreateFollowUp, onClose }: MessageDetailProps) {
  const detail = useDetailStyles();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <article className={detail.root} aria-label={`Email : ${message.subject}`}>
      <div className={detail.commandBar} role="toolbar" aria-label="Actions de l'email">
        <Button data-sound="click" appearance="primary" icon={<AddCircle20Regular />} onClick={() => setCreateOpen(true)}>
          Créer un suivi
        </Button>
        <OpenInOutlookButton webLink={message.webLink} />
        <Tooltip content="Fermer" relationship="label">
          <Button data-sound="click" className={detail.close} appearance="subtle" icon={<Dismiss20Regular />} onClick={onClose} />
        </Tooltip>
      </div>

      <div className={detail.content}>
        <EmailHeader
          subject={message.subject}
          sender={message.from}
          recipients={message.recipients}
          receivedAt={message.receivedAt}
          badges={
            <Badge appearance="tint" color="informative">
              Email Outlook · pas encore suivi
            </Badge>
          }
        />
        <MessageBar intent="info" layout="multiline">
          <MessageBarBody>
            Créez un suivi pour lui associer une échéance, un statut et des notes.
          </MessageBarBody>
        </MessageBar>
        <Divider />
        <EmailBody preview={message.preview} messageId={message.id} loadBody={loadBody} />
      </div>

      {createOpen && (
        <CreateFollowUpDialog subject={message.subject} onOpenChange={setCreateOpen} onCreate={onCreateFollowUp} />
      )}
    </article>
  );
}
