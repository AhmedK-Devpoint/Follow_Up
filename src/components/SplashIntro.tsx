import { makeStyles, tokens } from '@fluentui/react-components';
import { Speaker220Regular, SpeakerMute20Regular } from '@fluentui/react-icons';
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { readPreferences } from '../hooks/usePreferences';
import { gsap, reduceMotion } from '../utils/motion';

/** Vidéo d'intro rendue avec HyperFrames en 4K 60 i/s, quasi sans perte (source : videos/followup-intro). */
const VIDEO_MP4 = '/intro/followup-intro.mp4';
/** Dernière image de la vidéo : version sans mouvement. */
const END_FRAME = '/intro/followup-intro-end.webp';
/** Couleur de fond de la vidéo : les bandes éventuelles se fondent dans l'image. */
const VIDEO_BACKGROUND = '#12062e';
/** Délai maximal avant que la vidéo démarre (fichier 4K de ~21 Mo) ; au-delà, on passe à l'application. */
const START_TIMEOUT_MS = 6000;

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    overflow: 'hidden',
    backgroundColor: VIDEO_BACKGROUND,
    cursor: 'pointer',
    userSelect: 'none',
  },
  media: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    // Écran en portrait : la composition 16:9 reste entière plutôt que rognée sur les côtés.
    '@media (max-aspect-ratio: 4/3)': {
      objectFit: 'contain',
    },
  },
  sound: {
    position: 'absolute',
    left: tokens.spacingHorizontalXL,
    bottom: tokens.spacingVerticalXL,
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalSNudge} ${tokens.spacingHorizontalM}`,
    font: 'inherit',
    fontSize: tokens.fontSizeBase300,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: tokens.borderRadiusCircular,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.24)',
    },
    ':focus-visible': {
      outline: '2px solid #fff',
      outlineOffset: '2px',
    },
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

interface SplashIntroProps {
  /** L'intro commence à s'effacer : l'application peut s'afficher dessous. */
  onReveal: () => void;
  onDone: () => void;
}

/** Intro vidéo plein écran, puis fondu vers l'application. Un clic ou une touche la passe. */
export function SplashIntro({ onReveal, onDone }: SplashIntroProps) {
  const styles = useStyles();
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const leaving = useRef(false);
  const still = reduceMotion();
  // Rendue avant le fournisseur de préférences : lecture directe de la préférence enregistrée.
  const [sound] = useState(() => readPreferences()?.sound !== false);
  // Le navigateur peut refuser le son sans interaction préalable : la vidéo part alors en muet.
  const [muted, setMuted] = useState(false);

  const leave = useCallback(() => {
    if (leaving.current || !root.current) return;
    leaving.current = true;
    video.current?.pause();
    onReveal();
    gsap.to(root.current, { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut', onComplete: onDone });
  }, [onReveal, onDone]);

  useEffect(() => {
    const element = video.current;
    // Sans mouvement : image finale, courte pause, puis fondu.
    if (still || !element) {
      const timer = window.setTimeout(leave, 1000);
      return () => window.clearTimeout(timer);
    }

    let started = false;
    const onPlaying = () => {
      started = true;
    };
    element.addEventListener('playing', onPlaying);
    // Sons coupés dans les préférences : lecture muette. Sinon, d'abord avec le bruitage ;
    // si le navigateur refuse, en muet ; si la lecture échoue encore, on n'attend pas.
    element.muted = !sound;
    element.play().catch(() => {
      if (!sound) return leave();
      element.muted = true;
      setMuted(true);
      element.play().catch(leave);
    });
    const timeout = window.setTimeout(() => {
      if (!started) leave();
    }, START_TIMEOUT_MS);

    return () => {
      element.removeEventListener('playing', onPlaying);
      window.clearTimeout(timeout);
    };
  }, [leave, still, sound]);

  useEffect(() => {
    const node = root.current;
    return () => {
      gsap.killTweensOf(node);
    };
  }, []);

  return (
    <div
      ref={root}
      className={styles.root}
      role="status"
      aria-label="Chargement de Follow-up Manager"
      onClick={leave}
      onKeyDown={leave}
      tabIndex={-1}
    >
      {still ? (
        <img className={styles.media} src={END_FRAME} alt="" />
      ) : (
        <video ref={video} className={styles.media} playsInline preload="auto" onEnded={leave} onError={leave}>
          <source src={VIDEO_MP4} type="video/mp4" />
        </video>
      )}
      {!still && sound && (
        <button
          type="button"
          className={styles.sound}
          onClick={(event: MouseEvent) => {
            // Ne passe pas l'intro : active ou coupe seulement le son.
            event.stopPropagation();
            const element = video.current;
            if (!element) return;
            element.muted = !muted;
            setMuted(!muted);
          }}
          onKeyDown={(event) => event.stopPropagation()}
          aria-label={muted ? 'Activer le son' : 'Couper le son'}
        >
          {muted ? <SpeakerMute20Regular /> : <Speaker220Regular />}
          {muted ? 'Activer le son' : 'Son activé'}
        </button>
      )}
      <span className={styles.hint} aria-hidden>
        Cliquer pour passer
      </span>
    </div>
  );
}
