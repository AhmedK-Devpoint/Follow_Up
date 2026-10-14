import clickSound from '../assets/sounds/click.mp3';
import validationSound from '../assets/sounds/validation.mp3';

function load(src: string, volume: number): HTMLAudioElement {
  const audio = new Audio(src);
  audio.preload = 'auto';
  audio.volume = volume;
  return audio;
}

const click = load(clickSound, 0.5);
const validation = load(validationSound, 0.6);

let enabled = true;

/** Active ou coupe tous les sons d'interface (préférence « Sons »). */
export function setSoundEnabled(value: boolean): void {
  enabled = value;
}

/** Relance le son depuis le début. Ignoré si les sons sont coupés ou si le navigateur bloque la lecture. */
function play(audio: HTMLAudioElement): void {
  if (!enabled) return;
  audio.currentTime = 0;
  audio.play().catch(() => undefined);
}

/** Son joué quand un suivi est terminé. */
export function playValidation(): void {
  play(validation);
}

/** Joue le son de clic sur tout bouton marqué `data-sound="click"` (les boutons principaux). */
export function installClickSounds(): void {
  document.addEventListener(
    'click',
    (event) => {
      if (event.target instanceof Element && event.target.closest('[data-sound="click"]')) play(click);
    },
    { capture: true },
  );
}
