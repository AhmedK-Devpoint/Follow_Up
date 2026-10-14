import { Caption1, makeStyles, mergeClasses, tokens, Tooltip } from '@fluentui/react-components';
import { useRef } from 'react';
import { gsap, reduceMotion, useGSAP } from '../utils/motion';

const useStyles = makeStyles({
  track: {
    display: 'flex',
    gap: '2px',
    height: '10px',
    overflow: 'hidden',
    borderRadius: tokens.borderRadiusCircular,
  },
  segment: {
    height: '100%',
    minWidth: 0,
    borderRadius: '2px',
    ':first-child': {
      borderTopLeftRadius: tokens.borderRadiusCircular,
      borderBottomLeftRadius: tokens.borderRadiusCircular,
    },
    ':last-child': {
      borderTopRightRadius: tokens.borderRadiusCircular,
      borderBottomRightRadius: tokens.borderRadiusCircular,
    },
  },
  meterTrack: {
    height: '10px',
    overflow: 'hidden',
    borderRadius: tokens.borderRadiusCircular,
  },
  meterFill: {
    height: '100%',
    borderRadius: tokens.borderRadiusCircular,
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalM}`,
    color: tokens.colorNeutralForeground3,
  },
  legendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    whiteSpace: 'nowrap',
  },
  legendValue: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  dot: {
    width: '8px',
    height: '8px',
    flexShrink: 0,
    borderRadius: tokens.borderRadiusCircular,
  },
  columns: {
    display: 'grid',
    gap: '6px',
  },
  hbarTrack: {
    flexGrow: 1,
    height: '8px',
    overflow: 'hidden',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: 'var(--fu-card-muted)',
  },
  hbarFill: {
    display: 'block',
    height: '100%',
    borderRadius: tokens.borderRadiusCircular,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    minWidth: 0,
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'default',
    outlineStyle: 'none',
    ':focus-visible': {
      boxShadow: `0 0 0 2px ${tokens.colorStrokeFocus2}`,
    },
    ':hover > span:first-child > span': {
      filter: 'brightness(1.08) saturate(1.1)',
    },
  },
  plot: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
    height: '40px',
  },
  bar: {
    width: '100%',
    maxWidth: '18px',
    minHeight: '3px',
    borderRadius: '4px 4px 2px 2px',
  },
  day: {
    fontSize: tokens.fontSizeBase100,
    lineHeight: tokens.lineHeightBase100,
    color: tokens.colorNeutralForeground3,
  },
  today: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightBold,
  },
});

export interface MeterSegment {
  key: string;
  label: string;
  value: number;
  color: string;
}

/** Fait glisser chaque élément de sa taille précédente à la nouvelle, à chaque changement de données. */
function useAnimatedSizes(
  container: React.RefObject<HTMLElement>,
  selector: string,
  property: 'width' | 'height',
  signature: string,
) {
  const previous = useRef<string[]>([]);
  useGSAP(
    () => {
      const nodes = container.current ? Array.from(container.current.querySelectorAll<HTMLElement>(selector)) : [];
      const targets = nodes.map((node) => node.style[property]);
      nodes.forEach((node, index) => {
        if (reduceMotion()) return;
        // Première apparition : on part de zéro ; ensuite, de la valeur affichée avant le changement.
        const from = previous.current[index] ?? '0%';
        if (from === targets[index]) return;
        gsap.fromTo(node, { [property]: from }, { [property]: targets[index], duration: 0.7, ease: 'power3.out' });
      });
      previous.current = targets;
    },
    { dependencies: [signature], scope: container },
  );
}

/** Barre segmentée (répartition d'un total), avec légende chiffrée : la couleur n'est jamais seule. */
export function StackedMeter({ segments, label }: { segments: MeterSegment[]; label: string }) {
  const styles = useStyles();
  const root = useRef<HTMLDivElement>(null);
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const visible = segments.filter((s) => s.value > 0);
  useAnimatedSizes(root, '[data-size]', 'width', segments.map((s) => s.value).join('/'));

  return (
    <div ref={root}>
      <div
        className={styles.track}
        role="img"
        aria-label={`${label} : ${segments.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(', ')}`}
        style={{ backgroundColor: total === 0 ? tokens.colorNeutralBackground4 : undefined }}
      >
        {visible.map((segment) => (
          <Tooltip key={segment.key} content={`${segment.label} : ${segment.value}`} relationship="description" withArrow>
            <span
              data-size
              className={styles.segment}
              style={{ width: `${(segment.value / total) * 100}%`, backgroundColor: segment.color }}
            />
          </Tooltip>
        ))}
      </div>
      <div className={styles.legend} style={{ marginTop: tokens.spacingVerticalS }}>
        {segments.map((segment) => (
          <Caption1 key={segment.key} className={styles.legendItem}>
            <span className={styles.dot} style={{ backgroundColor: segment.color }} aria-hidden />
            {segment.label}
            <span className={styles.legendValue}>{segment.value}</span>
          </Caption1>
        ))}
      </div>
    </div>
  );
}

/** Jauge d'un ratio : le remplissage porte la gravité, la piste est une teinte claire de la même couleur. */
export function Meter({ ratio, color, track, label }: { ratio: number; color: string; track: string; label: string }) {
  const styles = useStyles();
  const root = useRef<HTMLDivElement>(null);
  const percent = Math.round(Math.min(Math.max(ratio, 0), 1) * 100);
  useAnimatedSizes(root, '[data-size]', 'width', String(percent));

  return (
    <div ref={root}>
      <div
        className={styles.meterTrack}
        style={{ backgroundColor: track }}
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <span data-size className={styles.meterFill} style={{ display: 'block', width: `${percent}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export interface DayColumn {
  key: string;
  /** Initiale du jour (L, M, M, J…). */
  label: string;
  /** Texte de l'infobulle, ex. « Jeudi 16 : 2 relances ». */
  title: string;
  value: number;
  current: boolean;
  /** Couleur propre à cette colonne (ex. le seau « en retard »). */
  color?: string;
}

/** Mini-histogramme sur 7 jours : une teinte, le jour courant en accent, infobulle par colonne. */
export function DayColumns({
  days,
  color,
  muted,
  label,
  focusable = true,
  height = 40,
}: {
  days: DayColumn[];
  color: string;
  /** Teinte claire de la même couleur, pour les jours sans valeur. */
  muted: string;
  label: string;
  /** Faux dans une carte déjà cliquable : pas d'élément focalisable imbriqué dans un bouton. */
  focusable?: boolean;
  /** Hauteur de la zone de tracé, en pixels. */
  height?: number;
}) {
  const styles = useStyles();
  const root = useRef<HTMLDivElement>(null);
  const max = Math.max(1, ...days.map((d) => d.value));
  useAnimatedSizes(root, '[data-size]', 'height', days.map((d) => d.value).join('/'));

  return (
    <div
      ref={root}
      className={styles.columns}
      style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
      role="list"
      aria-label={label}
    >
      {days.map((day) => (
        <Tooltip key={day.key} content={day.title} relationship="label" withArrow>
          <span className={styles.column} role="listitem" tabIndex={focusable ? 0 : undefined}>
            <span className={styles.plot} style={{ height: `${height}px` }}>
              <span
                data-size
                className={styles.bar}
                style={{
                  height: day.value === 0 ? '3px' : `${Math.max(12, (day.value / max) * 100)}%`,
                  backgroundColor: day.value === 0 ? muted : (day.color ?? color),
                  opacity: day.value === 0 || day.current ? 1 : 0.55,
                }}
              />
            </span>
            <span className={mergeClasses(styles.day, day.current && styles.today)}>{day.label}</span>
          </span>
        </Tooltip>
      ))}
    </div>
  );
}

/** Barre horizontale proportionnelle (classements), animée à chaque changement. */
export function HBar({ ratio, color }: { ratio: number; color: string }) {
  const styles = useStyles();
  const root = useRef<HTMLSpanElement>(null);
  const percent = Math.round(Math.min(Math.max(ratio, 0), 1) * 100);
  useAnimatedSizes(root, '[data-size]', 'width', String(percent));
  return (
    <span ref={root} className={styles.hbarTrack} aria-hidden>
      <span data-size className={styles.hbarFill} style={{ width: `${percent}%`, backgroundColor: color }} />
    </span>
  );
}
