import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { MailCheckmark24Filled } from '@fluentui/react-icons';
import { useEffect, useRef } from 'react';
import iconShot from '../assets/intro/icon.webp';
import { APP_GRADIENT } from '../theme';
import { gsap, reduceMotion, useGSAP } from '../utils/motion';

const STUDIO = 'DEVPOINT';

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    inset: 0,
    zIndex: 300,
    overflow: 'hidden',
    backgroundImage: APP_GRADIENT,
    cursor: 'pointer',
    userSelect: 'none',
    outlineStyle: 'none',
  },
  layer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  shot: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    willChange: 'transform, filter, opacity',
  },
  // Le zoom plonge dans la coche de la pastille.
  icon: {
    objectPosition: '58% 50%',
    transformOrigin: '70% 34%',
  },
  white: {
    backgroundColor: '#fff',
  },
  credits: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalL,
    padding: tokens.spacingHorizontalL,
    color: '#fff',
    textAlign: 'center',
    textShadow: '0 4px 24px rgba(28, 16, 74, 0.45)',
  },
  logo: {
    display: 'grid',
    placeItems: 'center',
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    color: '#fff',
    backgroundImage: 'linear-gradient(135deg, #6042d1, #c86f8c)',
    boxShadow: '0 12px 32px rgba(28, 16, 74, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
  },
  app: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    letterSpacing: '0.32em',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  by: {
    marginTop: tokens.spacingVerticalXL,
    fontSize: tokens.fontSizeBase200,
    letterSpacing: '0.42em',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  studio: {
    display: 'flex',
    margin: 0,
    fontSize: 'clamp(52px, 11vw, 128px)',
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: '-0.045em',
  },
  letter: {
    display: 'inline-block',
  },
  meta: {
    marginTop: tokens.spacingVerticalXL,
    fontSize: tokens.fontSizeBase200,
    letterSpacing: '0.08em',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  hint: {
    position: 'absolute',
    right: tokens.spacingHorizontalXL,
    bottom: tokens.spacingVerticalXL,
    fontSize: tokens.fontSizeBase200,
    letterSpacing: '0.08em',
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

interface CreditsRollProps {
  onClose: () => void;
}

/**
 * Générique : plan de l'icône qui plonge dans la coche, flash blanc, puis signature DEVPOINT sur le dégradé de l'application. Un clic ou Échap le ferme.
 */
export function CreditsRoll({ onClose }: CreditsRollProps) {
  const styles = useStyles();
  const root = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP(
    () => {
      if (reduceMotion()) {
        // Pas de mouvement : la signature s'affiche directement.
        gsap.set(['[data-shot]', '[data-white]'], { autoAlpha: 0 });
        return;
      }

      gsap.set(['[data-white]', '[data-credits]'], { autoAlpha: 0 });

      gsap
        .timeline()
        // 1. Plan de l'icône, qui fait le point.
        .fromTo(
          '[data-shot="icon"]',
          { filter: 'blur(12px) brightness(0.6)', autoAlpha: 0 },
          { filter: 'blur(0px) brightness(1)', autoAlpha: 1, duration: 0.9, ease: 'power2.out' },
        )
        // 2. Mega zoom dans la coche, le plan se floute et brûle au blanc.
        .to(
          '[data-shot="icon"]',
          { scale: 9, filter: 'blur(30px) brightness(2.2)', duration: 2, ease: 'power3.in' },
          '+=0.6',
        )
        .to('[data-white]', { autoAlpha: 1, duration: 0.8, ease: 'power2.in' }, '-=0.8')
        .set('[data-shot]', { autoAlpha: 0 })
        .set('[data-credits]', { autoAlpha: 1 })
        // 3. Le blanc se dissout dans le dégradé de l'app, la signature apparaît.
        .to('[data-white]', { autoAlpha: 0, duration: 1.2, ease: 'power2.out' }, '+=0.15')
        .from('[data-logo]', { autoAlpha: 0, scale: 0.6, rotate: -12, duration: 0.7, ease: 'back.out(2.2)' }, '<0.3')
        .from('[data-app]', { autoAlpha: 0, letterSpacing: '0.8em', duration: 0.8 }, '<0.15')
        .from('[data-by]', { autoAlpha: 0, y: 8, duration: 0.5 }, '<0.35')
        .from(
          '[data-letter]',
          { autoAlpha: 0, yPercent: 60, filter: 'blur(12px)', stagger: 0.06, duration: 0.7 },
          '<0.15',
        )
        .from('[data-meta]', { autoAlpha: 0, duration: 0.6 }, '>-0.2')
        .from('[data-hint]', { autoAlpha: 0, duration: 0.6 }, '<');
    },
    { scope: root },
  );

  const close = contextSafe(() => {
    gsap.to(root.current, { autoAlpha: 0, duration: 0.45, ease: 'power2.inOut', onComplete: onClose });
  });

  useEffect(() => {
    root.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  return (
    <div
      ref={root}
      className={styles.root}
      role="dialog"
      aria-modal
      aria-label="Crédits"
      tabIndex={-1}
      onClick={close}
    >
      <div className={styles.layer}>
        <img data-shot="icon" className={mergeClasses(styles.shot, styles.icon)} src={iconShot} alt="" />
      </div>

      <div data-credits className={mergeClasses(styles.layer, styles.credits)}>
        <span data-logo className={styles.logo}>
          <MailCheckmark24Filled />
        </span>
        <span data-app className={styles.app}>
          Follow-up Manager
        </span>
        <span data-by className={styles.by}>
          Fait par
        </span>
        <p className={styles.studio} aria-label={STUDIO}>
          {STUDIO.split('').map((char, index) => (
            <span key={index} data-letter className={styles.letter} aria-hidden>
              {char}
            </span>
          ))}
        </p>
        <span data-meta className={styles.meta}>
          React · TypeScript · Fluent UI · GSAP · © {new Date().getFullYear()}
        </span>
      </div>

      <div data-white className={mergeClasses(styles.layer, styles.white)} />

      <span data-hint className={styles.hint} aria-hidden>
        Cliquer ou Échap pour fermer
      </span>
    </div>
  );
}
