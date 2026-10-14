import { useSyncExternalStore } from 'react';

/** Points de rupture de la mise en page (largeur minimale). */
export const BREAKPOINTS = {
  /** Barre latérale affichée en permanence. */
  sidebar: '(min-width: 900px)',
  /** Panneau de détail affiché à côté de la liste. */
  detailPane: '(min-width: 1280px)',
} as const;

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
  );
}
