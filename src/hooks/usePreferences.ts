import { createContext, useCallback, useContext, useState } from 'react';
import type { Priority } from '../types/followUp';

/** Métier de l'utilisateur : sert à pré-remplir des réglages adaptés. */
export type Role = 'direction' | 'commercial' | 'projet' | 'support' | 'achats' | 'custom';

/** Jours travaillés dans l'entreprise : une relance n'est jamais planifiée un jour chômé. */
export type WorkWeek = 'mon-fri' | 'mon-sat' | 'all';

/** Réglages choisis lors de l'introduction, avant la connexion ; modifiables depuis le menu du compte. */
export interface Preferences {
  /** Prénom utilisé pour l'accueil (à défaut, celui du compte Microsoft). */
  firstName: string;
  role: Role | null;
  /** Intitulé saisi par l'utilisateur quand son métier n'est pas dans la liste (rôle `custom`). */
  customRole: string;
  companyName: string;
  workWeek: WorkWeek;
  /** Délai proposé par défaut pour la relance d'un nouveau suivi, en jours. */
  reminderDays: number;
  defaultPriority: Priority;
  /** Section affichée à l'ouverture de l'espace de travail. */
  startView: 'overview' | 'inbox' | 'all' | 'overdue';
  /** Bruitage de l'intro et sons d'interface (clics, validation). */
  sound: boolean;
  /** Interface en verre dépoli ; sinon surfaces pleines, sans transparence ni flou. */
  glass: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  firstName: '',
  role: null,
  customRole: '',
  companyName: '',
  workWeek: 'mon-fri',
  reminderDays: 3,
  defaultPriority: 'normal',
  startView: 'inbox',
  sound: true,
  glass: true,
};

type RolePreset = Pick<Preferences, 'reminderDays' | 'defaultPriority' | 'startView'>;

/** Réglages recommandés par métier, appliqués dès que l'utilisateur choisit son rôle. */
export const ROLE_PRESETS: Record<Role, { label: string; hint: string; preset?: RolePreset }> = {
  direction: {
    label: 'Direction',
    hint: 'Arbitrages, validations, décisions',
    preset: { reminderDays: 3, defaultPriority: 'high', startView: 'overview' },
  },
  commercial: {
    label: 'Commercial',
    hint: 'Devis, prospects, relation client',
    preset: { reminderDays: 2, defaultPriority: 'high', startView: 'inbox' },
  },
  projet: {
    label: 'Chef de projet',
    hint: 'Livrables, validations, planning',
    preset: { reminderDays: 3, defaultPriority: 'normal', startView: 'all' },
  },
  support: {
    label: 'Support client',
    hint: 'Tickets, demandes, incidents',
    preset: { reminderDays: 1, defaultPriority: 'normal', startView: 'inbox' },
  },
  achats: {
    label: 'Achats / admin',
    hint: 'Fournisseurs, commandes, factures',
    preset: { reminderDays: 5, defaultPriority: 'normal', startView: 'all' },
  },
  custom: {
    label: 'Personnalisé',
    hint: 'Mon métier, mes propres réglages',
  },
};

const PreferencesContext = createContext<Preferences>(DEFAULT_PREFERENCES);

export const PreferencesProvider = PreferencesContext.Provider;

export function usePreferences(): Preferences {
  return useContext(PreferencesContext);
}

const STORAGE_KEY = 'followup-manager:v1:preferences';

/** Préférences enregistrées sur cet appareil, lisibles hors de React (démarrage de l'application). */
export function readPreferences(): Preferences | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Preferences> | null;
    if (typeof parsed !== 'object' || parsed === null) return null;
    const role = parsed.role && parsed.role in ROLE_PRESETS ? parsed.role : null;
    return { ...DEFAULT_PREFERENCES, ...parsed, role };
  } catch {
    return null;
  }
}

/**
 * Préférences de cet appareil, choisies avant la connexion et partagées par le mode démo et Outlook.
 * `null` tant que l'introduction n'a pas été faite.
 */
export function useStoredPreferences(): [Preferences | null, (next: Preferences) => void] {
  const [preferences, setPreferences] = useState<Preferences | null>(readPreferences);

  const save = useCallback((next: Preferences) => {
    setPreferences(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Stockage indisponible : les préférences restent valables pour la session.
    }
  }, []);

  return [preferences, save];
}
