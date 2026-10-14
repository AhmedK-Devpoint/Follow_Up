import {
  Button,
  Caption1,
  makeStyles,
  Skeleton,
  SkeletonItem,
  Spinner,
  Text,
  tokens,
  Tooltip,
} from '@fluentui/react-components';
import { ArrowClockwise20Regular, MailInbox48Regular } from '@fluentui/react-icons';
import { useElementWidth } from '../hooks/useElementWidth';
import type { OutlookMessagesState } from '../hooks/useOutlookMessages';
import type { FollowUp, OutlookMessage } from '../types/followUp';
import { ErrorBar } from './ErrorBar';
import { ListCard, ListEmptyState } from './ListCard';
import { INBOX_COLUMNS, TABLE_MIN_WIDTH } from './listLayout';
import { MessageListItem } from './MessageListItem';

const useStyles = makeStyles({
  columns: {
    display: 'grid',
    gridTemplateColumns: INBOX_COLUMNS,
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    paddingLeft: `calc(${tokens.spacingHorizontalL} + 3px)`,
    color: tokens.colorNeutralForeground3,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  alignRight: {
    textAlign: 'right',
  },
  list: {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  skeletonRow: {
    display: 'grid',
    gridTemplateColumns: '32px minmax(0, 1fr)',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
  },
  skeletonLines: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  error: {
    margin: tokens.spacingHorizontalL,
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalM,
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },
});

interface MessageListProps {
  state: OutlookMessagesState;
  /** Emails à afficher (déjà filtrés par la recherche). */
  messages: OutlookMessage[];
  followUpsByMessage: Map<string, FollowUp>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  hasSearch: boolean;
}

function LoadingRows() {
  const styles = useStyles();
  return (
    <Skeleton aria-label="Chargement des emails">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <SkeletonItem shape="circle" size={32} />
          <div className={styles.skeletonLines}>
            <SkeletonItem size={12} />
            <SkeletonItem size={12} />
          </div>
        </div>
      ))}
    </Skeleton>
  );
}

/** Emails Outlook récents (lecture seule), avec pagination « Charger plus ». */
export function MessageList({ state, messages, followUpsByMessage, selectedId, onSelect, hasSearch }: MessageListProps) {
  const styles = useStyles();
  const [ref, width] = useElementWidth<HTMLElement>();
  const layout = width >= TABLE_MIN_WIDTH ? 'table' : 'compact';
  const loaded = state.messages.length;

  const subtitle =
    state.status === 'loading'
      ? 'Chargement des emails…'
      : hasSearch
        ? `${messages.length} sur ${loaded} emails chargés`
        : `${loaded} ${loaded > 1 ? 'emails chargés' : 'email chargé'}`;

  return (
    <ListCard
      sectionRef={ref}
      title="Boîte de réception Outlook"
      subtitle={subtitle}
      actions={
        <Tooltip content="Actualiser" relationship="label">
          <Button
            appearance="subtle"
            icon={<ArrowClockwise20Regular />}
            onClick={state.reload}
            disabled={state.status === 'loading'}
          />
        </Tooltip>
      }
    >
      {state.status === 'loading' && <LoadingRows />}

      {state.error && (
        <ErrorBar className={styles.error} error={state.error} onRetry={state.status === 'error' ? state.reload : state.loadMore} />
      )}

      {state.status === 'ready' && messages.length === 0 && (
        <ListEmptyState
          icon={<MailInbox48Regular />}
          title={hasSearch ? 'Aucun email ne correspond à la recherche' : 'Aucun email'}
          description={
            hasSearch
              ? 'La recherche porte sur les emails déjà chargés. Chargez-en davantage pour élargir la recherche.'
              : 'Votre boîte aux lettres ne contient aucun message.'
          }
        />
      )}

      {state.status === 'ready' && messages.length > 0 && (
        <>
          {layout === 'table' && (
            <div className={styles.columns} aria-hidden>
              <Text size={200} weight="semibold">Expéditeur</Text>
              <Text size={200} weight="semibold">Objet</Text>
              <Text size={200} weight="semibold">Suivi</Text>
              <Text size={200} weight="semibold" className={styles.alignRight}>
                Reçu
              </Text>
            </div>
          )}
          <ul className={styles.list}>
            {messages.map((message) => (
              <MessageListItem
                key={message.id}
                message={message}
                followUp={followUpsByMessage.get(message.id)}
                layout={layout}
                selected={message.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </ul>
        </>
      )}

      {state.status === 'ready' && loaded > 0 && (
        <div className={styles.footer}>
          {state.loadingMore ? (
            <Spinner size="tiny" label="Chargement…" />
          ) : state.hasMore ? (
            <Button onClick={state.loadMore}>Charger plus d'emails</Button>
          ) : (
            <Caption1>Tous les emails ont été chargés.</Caption1>
          )}
        </div>
      )}
    </ListCard>
  );
}
