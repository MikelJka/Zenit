import type { Registry } from '../registry';
import type { GameState } from './state';

/** Paso fijo de la simulación, en segundos. */
export const STEP = 1;
/** Tope de ganancias con el juego cerrado (segundos): 8 h. */
export const MAX_OFFLINE = 8 * 3600;

/** Avanza `seconds` en pasos de `STEP` (el resto fraccionario va en un último paso). */
export function advance(state: GameState, registry: Registry, seconds: number): void {
  let left = Math.max(0, seconds);
  while (left > 0) {
    const dt = Math.min(STEP, left);
    registry.step(state, dt);
    state.time += dt;
    left -= dt;
  }
}

/** Ganancias con el juego cerrado: avanza el tiempo pasado desde el último guardado, con tope. */
export function advanceOffline(state: GameState, registry: Registry, nowMs: number): number {
  if (!state.savedAt) return 0;
  const seconds = Math.min(MAX_OFFLINE, Math.max(0, (nowMs - state.savedAt) / 1000));
  advance(state, registry, seconds);
  return seconds;
}
