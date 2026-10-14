import {
  Button,
  DrawerBody,
  Link,
  makeStyles,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
  OverlayDrawer,
  Toast,
  Toaster,
  ToastTitle,
  tokens,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { useCallback, useDeferredValue, useMemo, useRef, useState, type ReactNode } from 'react';
import { createDemoFollowUps } from '../data/mockFollowUps';
import { useFollowUps } from '../hooks/useFollowUps';
import { BREAKPOINTS, useMediaQuery } from '../hooks/useMediaQuery';
import { usePreferences } from '../hooks/usePreferences';
import type { BodyLoader } from '../hooks/useMessageBody';
import type { OutlookMessagesState } from '../hooks/useOutlookMessages';
import type { UserFacingError } from '../services/errors';
import { APP_GRADIENT, card, frosted } from '../theme';
import type { FollowUp, FollowUpDraft, FollowUpStatus, PriorityFilter, ViewFilter } from '../types/followUp';
import { formatLongDate } from '../utils/dates';
import { gsap, reduceMotion, useGSAP } from '../utils/motion';
import {
  computeStats,
  countByView,
  createFollowUpFromMessage,
  filterMessages,
  queryFollowUps,
  STATUS_LABELS,
  VIEW_LABELS,
} from '../utils/followUps';
import { DashboardStats } from './DashboardStats';
import { DetailPlaceholder } from './DetailPlaceholder';
import { ErrorBar } from './ErrorBar';
import { FollowUpDetail } from './FollowUpDetail';
import { FollowUpList } from './FollowUpList';
import { MessageDetail } from './MessageDetail';
import { MessageList } from './MessageList';
import { Overview } from './Overview';
import { PageHeader } from './PageHeader';
import { Sidebar } from './Sidebar';
import { playValidation } from '../utils/sounds';

const useStyles = makeStyles({
  app: {
    display: 'flex',
    gap: tokens.spacingHorizontalL,
    height: '100dvh',
    padding: tokens.spacingHorizontalL,
    overflow: 'hidden',
    backgroundImage: APP_GRADIENT,
    backgroundColor: '#5a3fae',
    '@media (max-width: 899px)': {
      padding: tokens.spacingHorizontalS,
    },
  },
  main: {
    ...frosted,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
    flexGrow: 1,
    minWidth: 0,
    overflowY: 'auto',
    padding: '32px',
    borderRadius: 'var(--fu-radius-panel)',
    // Le panneau défile : ses blocs gardent leur hauteur naturelle au lieu de se comprimer.
    '& > *': {
      flexShrink: 0,
    },
    '@media (max-width: 599px)': {
      gap: tokens.spacingVerticalL,
      padding: tokens.spacingHorizontalL,
      borderRadius: '18px',
    },
  },
  detailPane: {
    ...frosted,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    // S'adapte à l'écran pour laisser de la place à la liste.
    width: 'clamp(360px, 30vw, 460px)',
    minHeight: 0,
    // Le défilement se fait dans un conteneur interne : la barre de défilement reste dans l'arrondi.
    overflow: 'hidden',
    borderRadius: 'var(--fu-radius-panel)',
  },
  detailScroll: {
    flexGrow: 1,
    minHeight: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
  },
  banner: {
    ...card,
    borderRadius: '14px',
  },
  drawerBody: {
    padding: 0,
  },
});

type Selection = { kind: 'followUp' | 'message'; id: string } | null;

/** Boîte de réception Outlook : absente en mode démonstration. */
export interface InboxSource {
  state: OutlookMessagesState;
  loadBody: BodyLoader;
}

interface WorkspaceProps {
  /** Identifiant de stockage des suivis (compte Microsoft) ; `null` en démo (rien n'est enregistré). */
  storageId: string | null;
  inbox?: InboxSource;
  accountPanel: ReactNode;
  /** Bandeau affiché en haut du contenu (mode démo, erreur de connexion…). */
  banner?: ReactNode;
}

export function Workspace({ storageId, inbox, accountPanel, banner }: WorkspaceProps) {
  const styles = useStyles();
  const [items, actions, { saveFailed }] = useFollowUps(storageId, createDemoFollowUps);
  const { startView } = usePreferences();
  const [view, setView] = useState<ViewFilter>(startView === 'inbox' && !inbox ? 'all' : startView);
  const [priority, setPriority] = useState<PriorityFilter>('all');
  const [search, setSearch] = useState('');
  const [selection, setSelection] = useState<Selection>(null);
  const [navOpen, setNavOpen] = useState(false);

  const sidebarInline = useMediaQuery(BREAKPOINTS.sidebar);
  const detailInline = useMediaQuery(BREAKPOINTS.detailPane);

  const root = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  const deferredSearch = useDeferredValue(search);
  const hasSearch = deferredSearch.trim() !== '';
  const followUpView = view === 'inbox' || view === 'overview' ? 'all' : view;
  const visibleItems = useMemo(
    () => queryFollowUps(items, { view: followUpView, priority, search: deferredSearch }),
    [items, followUpView, priority, deferredSearch],
  );
  const visibleMessages = useMemo(
    () => (inbox ? filterMessages(inbox.state.messages, deferredSearch) : []),
    [inbox, deferredSearch],
  );
  const followUpsByMessage = useMemo(
    () => new Map(items.filter((i) => i.messageId).map((i) => [i.messageId as string, i])),
    [items],
  );
  const counts = useMemo(() => countByView(items), [items]);
  const stats = useMemo(() => computeStats(items), [items]);

  // Le détail affiche le suivi s'il existe, sinon l'email Outlook brut.
  const selectedMessage =
    selection?.kind === 'message' ? inbox?.state.messages.find((m) => m.id === selection.id) : undefined;
  const selectedFollowUp: FollowUp | undefined =
    selection?.kind === 'followUp'
      ? items.find((i) => i.id === selection.id)
      : selection
        ? followUpsByMessage.get(selection.id)
        : undefined;

  const notify = useCallback(
    (message: string, undo?: () => void) =>
      dispatchToast(
        <Toast>
          <ToastTitle action={undo && <Link onClick={undo}>Annuler</Link>}>{message}</ToastTitle>
        </Toast>,
        { intent: 'success', timeout: 4000 },
      ),
    [dispatchToast],
  );

  const handleViewChange = (next: ViewFilter) => {
    setView(next);
    setNavOpen(false);
  };

  const handleStatusChange = (status: FollowUpStatus) => {
    if (!selectedFollowUp) return;
    const { id, status: previous } = selectedFollowUp;
    actions.setStatus(id, status);
    if (status === 'done' && previous !== 'done') playValidation();
    const message = status === 'done' ? 'Suivi marqué comme terminé' : `Suivi déplacé dans « ${STATUS_LABELS[status]} »`;
    notify(message, () => actions.setStatus(id, previous));
  };

  const handleDueDateChange = (dueDate: string) => {
    if (!selectedFollowUp) return;
    const { id, dueDate: previous } = selectedFollowUp;
    actions.setDueDate(id, dueDate);
    notify(`Échéance fixée au ${formatLongDate(dueDate).toLowerCase()}`, () => actions.setDueDate(id, previous));
  };

  const handleAddNote = (text: string) => {
    if (!selectedFollowUp) return;
    actions.addNote(selectedFollowUp.id, text);
    notify('Note ajoutée');
  };

  const handleDelete = () => {
    if (!selectedFollowUp) return;
    const removed = selectedFollowUp;
    actions.remove(removed.id);
    if (selection?.kind === 'followUp') setSelection(null);
    notify('Suivi supprimé', () => actions.add(removed));
  };

  const handleCreate = (draft: FollowUpDraft) => {
    if (!selectedMessage) return;
    actions.add(createFollowUpFromMessage(selectedMessage, draft));
    notify('Suivi créé');
  };

  const closeDetail = () => setSelection(null);

  // Mini intro : les panneaux se posent l'un après l'autre à l'ouverture
  // (la barre latérale a déjà sa propre animation d'entrée Fluent).
  useGSAP(
    () => {
      if (reduceMotion()) return;
      gsap
        .timeline({ defaults: { duration: 0.6 } })
        .from('[data-intro="main"]', { autoAlpha: 0, y: 24 })
        .from('[data-intro="detail"]', { autoAlpha: 0, x: 24 }, '<0.08')
        .from('[data-intro="main"] > *', { autoAlpha: 0, y: 12, stagger: 0.06, duration: 0.45 }, '<0.15');
    },
    { scope: root },
  );

  // Le contenu du détail glisse doucement quand on change de sélection.
  const detailKey = selectedFollowUp?.id ?? selectedMessage?.id ?? 'none';
  useGSAP(
    () => {
      const pane = detailRef.current;
      if (reduceMotion() || !pane || detailKey === 'none') return;
      pane.scrollTop = 0;
      gsap.from(pane.children, { autoAlpha: 0, y: 10, duration: 0.35 });
    },
    { dependencies: [detailKey] },
  );

  let detail: ReactNode = null;
  if (selectedFollowUp) {
    detail = (
      <FollowUpDetail
        item={selectedFollowUp}
        loadBody={inbox?.loadBody}
        onStatusChange={handleStatusChange}
        onDueDateChange={handleDueDateChange}
        onAddNote={handleAddNote}
        onDelete={handleDelete}
        onClose={closeDetail}
      />
    );
  } else if (selectedMessage && inbox) {
    detail = (
      <MessageDetail
        message={selectedMessage}
        loadBody={inbox.loadBody}
        onCreateFollowUp={handleCreate}
        onClose={closeDetail}
      />
    );
  }

  const listDescription = inbox
    ? 'Choisissez un email Outlook pour créer un suivi, puis gérez vos échéances et relances.'
    : 'Les emails qui attendent une action ou une réponse, avec leurs échéances de relance.';
  const title = view === 'overview' ? "Vue d'ensemble" : 'Mes suivis';
  const description =
    view === 'overview'
      ? 'Ce qui a été fait, ce qui reste à faire, et où agir en priorité.'
      : listDescription;

  return (
    <div ref={root} className={styles.app}>
      <Sidebar
        view={view}
        counts={counts}
        inboxCount={inbox?.state.messages.length}
        footer={accountPanel}
        onViewChange={handleViewChange}
        type={sidebarInline ? 'inline' : 'overlay'}
        open={sidebarInline || navOpen}
        onOpenChange={setNavOpen}
      />

      <main data-intro="main" className={styles.main}>
        <PageHeader
          title={title}
          description={description}
          search={search}
          onSearchChange={setSearch}
          showMenuButton={!sidebarInline}
          onMenuClick={() => setNavOpen(true)}
        />
        {banner}
        {saveFailed && (
          <MessageBar intent="warning">
            <MessageBarBody>
              <MessageBarTitle>Enregistrement impossible</MessageBarTitle>
              Le navigateur refuse le stockage local : vos suivis seront perdus à la fermeture de la page.
            </MessageBarBody>
          </MessageBar>
        )}
        <DashboardStats items={items} stats={stats} counts={counts} view={view} onViewChange={handleViewChange} />
        {view === 'overview' ? (
          <Overview
            items={items}
            onOpen={(id) => setSelection({ kind: 'followUp', id })}
            onNavigate={(next, filters) => {
              handleViewChange(next);
              setPriority(filters?.priority ?? 'all');
              setSearch(filters?.search ?? '');
            }}
          />
        ) : view === 'inbox' && inbox ? (
          <MessageList
            state={inbox.state}
            messages={visibleMessages}
            followUpsByMessage={followUpsByMessage}
            selectedId={selection?.kind === 'message' ? selection.id : null}
            onSelect={(id) => setSelection({ kind: 'message', id })}
            hasSearch={hasSearch}
          />
        ) : (
          <FollowUpList
            title={VIEW_LABELS[view]}
            items={visibleItems}
            grouped={view === 'all'}
            selectedId={selectedFollowUp?.id ?? null}
            onSelect={(id) => setSelection({ kind: 'followUp', id })}
            priority={priority}
            onPriorityChange={setPriority}
            hasSearch={hasSearch}
          />
        )}
      </main>

      {detailInline && (
        <aside data-intro="detail" className={styles.detailPane} aria-label="Détail">
          <div ref={detailRef} className={styles.detailScroll}>
            {detail ?? <DetailPlaceholder />}
          </div>
        </aside>
      )}

      {!detailInline && (
        <OverlayDrawer
          position="end"
          size={sidebarInline ? 'medium' : 'full'}
          open={detail !== null}
          onOpenChange={(_, data) => !data.open && closeDetail()}
          aria-label="Détail"
        >
          <DrawerBody className={styles.drawerBody}>{detail}</DrawerBody>
        </OverlayDrawer>
      )}

      <Toaster toasterId={toasterId} position="bottom-end" />
    </div>
  );
}

interface DemoBannerProps {
  signInAvailable: boolean;
  onSignIn: () => void;
  authError: UserFacingError | null;
  onDismissError: () => void;
}

/** Bandeau du mode démonstration, et erreur éventuelle de connexion Microsoft. */
export function DemoBanner({ signInAvailable, onSignIn, authError, onDismissError }: DemoBannerProps) {
  const styles = useStyles();
  return (
    <>
      {authError && <ErrorBar error={authError} onDismiss={onDismissError} />}
      <MessageBar className={styles.banner} intent="info" layout="multiline">
        <MessageBarBody>
          <MessageBarTitle>Mode démonstration</MessageBarTitle>
          Données fictives, non enregistrées : elles sont réinitialisées à chaque chargement de la page.
        </MessageBarBody>
        {signInAvailable && (
          <MessageBarActions>
            <Button onClick={onSignIn}>Se connecter avec Microsoft</Button>
          </MessageBarActions>
        )}
      </MessageBar>
    </>
  );
}
