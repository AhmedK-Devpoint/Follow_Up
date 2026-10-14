import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import type { FollowUp, FollowUpStatus } from '../types/followUp';

type Action =
  | { type: 'add'; item: FollowUp }
  | { type: 'remove'; id: string }
  | { type: 'setStatus'; id: string; status: FollowUpStatus }
  | { type: 'setDueDate'; id: string; dueDate: string }
  | { type: 'addNote'; id: string; text: string };

function updateItem(items: FollowUp[], id: string, update: (item: FollowUp) => FollowUp): FollowUp[] {
  return items.map((item) => (item.id === id ? update(item) : item));
}

function reducer(items: FollowUp[], action: Action): FollowUp[] {
  switch (action.type) {
    case 'add':
      return [action.item, ...items.filter((item) => item.id !== action.item.id)];
    case 'remove':
      return items.filter((item) => item.id !== action.id);
    case 'setStatus':
      return updateItem(items, action.id, (item) => ({
        ...item,
        status: action.status,
        completedAt: action.status === 'done' ? new Date().toISOString() : undefined,
      }));
    case 'setDueDate':
      return updateItem(items, action.id, (item) => ({ ...item, dueDate: action.dueDate }));
    case 'addNote':
      return updateItem(items, action.id, (item) => ({
        ...item,
        notes: [
          ...item.notes,
          { id: crypto.randomUUID(), text: action.text, createdAt: new Date().toISOString() },
        ],
      }));
  }
}

const STORAGE_PREFIX = 'followup-manager:v1:followups:';

function isFollowUp(value: unknown): value is FollowUp {
  const item = value as Partial<FollowUp> | null;
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.subject === 'string' &&
    typeof item.dueDate === 'string' &&
    typeof item.status === 'string' &&
    Array.isArray(item.notes)
  );
}

function readStorage(key: string): FollowUp[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isFollowUp) : [];
  } catch {
    return [];
  }
}

export interface FollowUpActions {
  add: (item: FollowUp) => void;
  remove: (id: string) => void;
  setStatus: (id: string, status: FollowUpStatus) => void;
  setDueDate: (id: string, dueDate: string) => void;
  addNote: (id: string, text: string) => void;
}

/**
 * État des suivis.
 * - Avec `storageId` (compte Microsoft) : chargé depuis et enregistré dans le localStorage du navigateur.
 * - Sans `storageId` (démo) : en mémoire uniquement, réinitialisé à chaque chargement.
 * Le composant appelant doit être remonté (prop `key`) si `storageId` change.
 */
export function useFollowUps(
  storageId: string | null,
  initial: () => FollowUp[],
): [FollowUp[], FollowUpActions, { saveFailed: boolean }] {
  const storageKey = storageId ? STORAGE_PREFIX + storageId : null;
  const [items, dispatch] = useReducer(reducer, undefined, () => (storageKey ? readStorage(storageKey) : initial()));
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    if (!storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
      setSaveFailed(false);
    } catch {
      // Stockage plein ou désactivé (navigation privée stricte) : les suivis restent en mémoire.
      setSaveFailed(true);
    }
  }, [storageKey, items]);

  const add = useCallback((item: FollowUp) => dispatch({ type: 'add', item }), []);
  const remove = useCallback((id: string) => dispatch({ type: 'remove', id }), []);
  const setStatus = useCallback(
    (id: string, status: FollowUpStatus) => dispatch({ type: 'setStatus', id, status }),
    [],
  );
  const setDueDate = useCallback(
    (id: string, dueDate: string) => dispatch({ type: 'setDueDate', id, dueDate }),
    [],
  );
  const addNote = useCallback((id: string, text: string) => dispatch({ type: 'addNote', id, text }), []);

  const actions = useMemo(
    () => ({ add, remove, setStatus, setDueDate, addNote }),
    [add, remove, setStatus, setDueDate, addNote],
  );
  return [items, actions, { saveFailed }];
}
