import { Caption1, makeStyles, mergeClasses, Text, tokens } from '@fluentui/react-components';
import { ArrowDown12Filled, ArrowUp12Filled, ChevronRight16Regular } from '@fluentui/react-icons';
import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { card } from '../theme';
import { gsap, reduceMotion, useGSAP } from '../utils/motion';

export type StatTone = 'brand' | 'danger' | 'warning' | 'success';

/** Couleur d'accent et teinte claire de chaque ton (pastille d'icône, anneau de mise à jour). */
const TONES: Record<StatTone, { accent: string; soft: string; ink: string }> = {
  brand: { accent: tokens.colorBrandBackground, soft: tokens.colorBrandBackground2, ink: tokens.colorBrandForeground1 },
  danger: {
    accent: tokens.colorPaletteRedBackground3,
    soft: tokens.colorPaletteRedBackground1,
    ink: tokens.colorPaletteRedForeground1,
  },
  warning: {
    accent: tokens.colorPaletteDarkOrangeBackground3,
    soft: tokens.colorPaletteDarkOrangeBackground1,
    ink: tokens.colorPaletteDarkOrangeForeground1,
  },
  success: {
    accent: tokens.colorPaletteGreenBackground3,
    soft: tokens.colorPaletteGreenBackground1,
    ink: tokens.colorPaletteGreenForeground1,
  },
};

/** Durée d'affichage de la pastille de variation après un changement. */
const DELTA_VISIBLE_MS = 2600;

const useStyles = makeStyles({
  card: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    minWidth: 0,
    padding: tokens.spacingHorizontalL,
    '@media (max-width: 599px)': {
      padding: tokens.spacingHorizontalM,
    },
    textAlign: 'left',
    font: 'inherit',
    color: tokens.colorNeutralForeground1,
    ...card,
    borderRadius: 'var(--fu-radius-card)',
    transitionProperty: 'box-shadow, border-color, transform',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMid,
    ':focus-visible': {
      outline: `2px solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: '2px',
    },
  },
  interactive: {
    cursor: 'pointer',
    ':hover': {
      boxShadow: tokens.shadow8,
      transform: 'translateY(-2px)',
    },
    ':hover .stat-more': {
      opacity: 1,
      transform: 'translateX(0)',
    },
    ':active': {
      transform: 'translateY(0)',
    },
  },
  selected: {
    border: `1px solid ${tokens.colorBrandStroke1}`,
    boxShadow: `0 0 0 3px ${tokens.colorBrandBackground2}, ${tokens.shadow4}`,
  },
  ring: {
    position: 'absolute',
    inset: '-1px',
    borderRadius: 'inherit',
    border: '2px solid currentColor',
    opacity: 0,
    pointerEvents: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minHeight: '32px',
    color: tokens.colorNeutralForeground2,
  },
  badge: {
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    width: '32px',
    height: '32px',
    borderRadius: tokens.borderRadiusCircular,
  },
  label: {
    flexGrow: 1,
    minWidth: 0,
    lineHeight: tokens.lineHeightBase300,
  },
  more: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
    opacity: 0,
    transform: 'translateX(-4px)',
    transitionProperty: 'opacity, transform',
    transitionDuration: tokens.durationNormal,
  },
  moreVisible: {
    opacity: 1,
    transform: 'translateX(0)',
    color: tokens.colorBrandForeground1,
  },
  valueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    // Les libellés sur deux lignes ne décalent plus les chiffres : ils s'alignent en bas de carte.
    marginTop: 'auto',
    minHeight: '44px',
  },
  value: {
    fontSize: '40px',
    lineHeight: '44px',
    letterSpacing: '-0.02em',
    '@media (max-width: 599px)': {
      fontSize: tokens.fontSizeHero700,
      lineHeight: tokens.lineHeightHero700,
    },
    fontWeight: tokens.fontWeightSemibold,
  },
  delta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    height: '22px',
    padding: `0 ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusCircular,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
  },
  good: {
    color: tokens.colorPaletteGreenForeground1,
    backgroundColor: tokens.colorPaletteGreenBackground1,
  },
  bad: {
    color: tokens.colorPaletteRedForeground1,
    backgroundColor: tokens.colorPaletteRedBackground1,
  },
  neutral: {
    color: tokens.colorBrandForeground1,
    backgroundColor: tokens.colorBrandBackground2,
  },
  // Hauteur commune des visualisations : les chiffres restent alignés d'une carte à l'autre.
  viz: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    minHeight: '62px',
  },
  caption: {
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

interface StatCardProps {
  label: string;
  value: number;
  caption: string;
  icon: ReactElement;
  tone: StatTone;
  /** Sens dans lequel une variation est une bonne nouvelle (colore la pastille de variation). */
  goodWhen: 'up' | 'down' | 'neutral';
  /** Visualisation sous le chiffre (barre segmentée, jauge, histogramme…). */
  children: ReactNode;
  selected?: boolean;
  /** Rend la carte cliquable (filtre la liste sur la section correspondante). */
  onClick?: () => void;
}

/** Tuile de statistique : libellé, chiffre, variation au dernier changement, visualisation et légende. */
export function StatCard({ label, value, caption, icon, tone, goodWhen, children, selected, onClick }: StatCardProps) {
  const styles = useStyles();
  const Root = onClick ? 'button' : 'div';
  const rootRef = useRef<HTMLElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);
  const previous = useRef<number | null>(null);
  const [delta, setDelta] = useState<{ amount: number; id: number } | null>(null);
  const colors = TONES[tone];

  // Variation affichée brièvement à chaque changement (jamais au premier affichage).
  useEffect(() => {
    if (previous.current !== null && previous.current !== value) {
      setDelta({ amount: value - previous.current, id: Date.now() });
    }
    previous.current = value;
  }, [value]);

  useEffect(() => {
    if (!delta) return;
    const timer = window.setTimeout(() => setDelta(null), DELTA_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [delta]);

  // Le chiffre défile jusqu'à sa nouvelle valeur (texte géré hors de React pour éviter les conflits).
  useGSAP(
    () => {
      const node = valueRef.current;
      if (!node) return;
      const counter = { value: shown.current };
      const render = () => {
        shown.current = Math.round(counter.value);
        node.textContent = String(shown.current);
      };
      if (reduceMotion() || shown.current === value) {
        counter.value = value;
        render();
        return;
      }
      gsap.to(counter, { value, duration: 0.9, ease: 'power2.out', onUpdate: render, onComplete: render });
    },
    { dependencies: [value] },
  );

  // Changement : anneau qui s'estompe autour de la carte, et pastille de variation qui surgit.
  useGSAP(
    () => {
      if (!delta || reduceMotion() || !rootRef.current) return;
      gsap.fromTo(
        rootRef.current.querySelector('[data-ring]'),
        { opacity: 0.9, scale: 1 },
        { opacity: 0, scale: 1.04, duration: 0.9, ease: 'power2.out' },
      );
      gsap.fromTo(
        rootRef.current.querySelector('[data-delta]'),
        { scale: 0.4, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(2.4)' },
      );
    },
    { dependencies: [delta?.id] },
  );

  const deltaTone =
    !delta || goodWhen === 'neutral'
      ? styles.neutral
      : (delta.amount > 0) === (goodWhen === 'up')
        ? styles.good
        : styles.bad;

  return (
    <Root
      ref={rootRef as never}
      type={onClick ? 'button' : undefined}
      data-sound={onClick ? 'click' : undefined}
      className={mergeClasses(styles.card, onClick && styles.interactive, selected && styles.selected)}
      onClick={onClick}
      aria-pressed={onClick ? selected : undefined}
    >
      <span data-ring className={styles.ring} style={{ color: colors.accent }} aria-hidden />
      <span className={styles.header}>
        <span className={styles.badge} style={{ backgroundColor: colors.soft, color: colors.ink }}>
          {icon}
        </span>
        <Text weight="medium" className={styles.label}>
          {label}
        </Text>
        {onClick && (
          <ChevronRight16Regular
            className={mergeClasses('stat-more', styles.more, selected && styles.moreVisible)}
            aria-hidden
          />
        )}
      </span>
      <span className={styles.valueRow}>
        <span ref={valueRef} className={styles.value} />
        {delta && (
          <span data-delta key={delta.id} className={mergeClasses(styles.delta, deltaTone)} aria-live="polite">
            {delta.amount > 0 ? <ArrowUp12Filled /> : <ArrowDown12Filled />}
            {delta.amount > 0 ? `+${delta.amount}` : delta.amount}
          </span>
        )}
      </span>
      <span className={styles.viz}>{children}</span>
      <Caption1 className={styles.caption} title={caption}>
        {caption}
      </Caption1>
    </Root>
  );
}
