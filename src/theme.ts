import { createLightTheme, type BrandVariants, type Theme } from '@fluentui/react-components';

/** Palette de marque violette, du plus sombre (10) au plus clair (160). */
const brand: BrandVariants = {
  10: '#0e0a26',
  20: '#1a1340',
  30: '#25195c',
  40: '#301f77',
  50: '#3b2690',
  60: '#472ea8',
  70: '#5337bd',
  80: '#6042d1',
  90: '#6f53dc',
  100: '#7e66e4',
  110: '#8e79ea',
  120: '#9e8def',
  130: '#afa2f4',
  140: '#c1b8f8',
  150: '#d4cffb',
  160: '#ebe8fe',
};

export const appTheme: Theme = {
  ...createLightTheme(brand),
  borderRadiusXLarge: '12px',
};

/** Dégradé de fond de l'application, inspiré d'un ciel au crépuscule. */
/**
 * Dégradé de fond de l'application, inspiré d'un ciel au crépuscule.
 * Défini en variable CSS dans index.css : le mode sans verre (`html[data-ui="flat"]`) le remplace par un fond uni.
 */
export const APP_GRADIENT = 'var(--fu-app-gradient)';

/**
 * Teinte sombre posée sous le texte blanc : garantit un contraste ≥ 4,5:1 (WCAG AA)
 * même sur la partie claire (orangée) du dégradé.
 */
export const GLASS_TINT = 'rgba(28, 16, 74, 0.5)';

/** Surface « verre dépoli » teintée, pour du texte blanc. */
export const glass = {
  backgroundColor: 'var(--fu-glass-bg)',
  backdropFilter: 'var(--fu-glass-blur)',
  WebkitBackdropFilter: 'var(--fu-glass-blur)',
  border: '1px solid var(--fu-glass-border)',
  boxShadow: 'var(--fu-glass-shadow)',
} as const;

/** Surface claire quasi opaque pour les panneaux de contenu (texte sombre lisible). */
export const frosted = {
  backgroundColor: 'var(--fu-surface-bg)',
  backdropFilter: 'var(--fu-surface-blur)',
  WebkitBackdropFilter: 'var(--fu-surface-blur)',
  border: '1px solid var(--fu-surface-border)',
  boxShadow: 'var(--fu-surface-shadow)',
} as const;

/**
 * Carte posée sur une surface (statistiques, listes, bandeaux) : même matière que le panneau,
 * en plus dense, pour que tout l'écran parle le même langage de verre.
 */
export const card = {
  backgroundColor: 'var(--fu-card-bg)',
  backdropFilter: 'var(--fu-card-blur)',
  WebkitBackdropFilter: 'var(--fu-card-blur)',
  border: '1px solid var(--fu-card-border)',
  boxShadow: 'var(--fu-card-shadow)',
} as const;

/** Applique le mode d'interface : glassmorphisme, ou surfaces pleines façon Outlook (`html[data-ui="flat"]`). */
export function applyInterfaceMode(glass: boolean): void {
  if (glass) delete document.documentElement.dataset.ui;
  else document.documentElement.dataset.ui = 'flat';
}
