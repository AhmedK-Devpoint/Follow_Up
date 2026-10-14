import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin(useGSAP);
gsap.defaults({ ease: 'power3.out', duration: 0.5 });

/** Les animations sont désactivées si l'utilisateur a demandé à réduire les mouvements. */
export function reduceMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { gsap, useGSAP };
