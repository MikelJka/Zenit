import type { SimModule } from './module';
import type { GameState } from './state';

/** Paso fijo de la simulación, en segundos. */
export const STEP_SECONDS = 1;
/** Tope de ganancias con el juego cerrado (8 h, el máximo del Pase; ver DISENO.md, D8). */
export const MAX_OFFLINE_SECONDS = 8 * 3600;

/**
 * Avanza `seconds` de juego en pasos de 1 s (el último puede ser menor).
 * Devuelve los segundos realmente simulados.
 */
export function advance(
  state: GameState,
  seconds: number,
  modules: SimModule[],
  maxSeconds = MAX_OFFLINE_SECONDS,
): number {
  const total = Math.max(0, Math.min(seconds, maxSeconds));
  let left = total;
  while (left > 1e-9) {
    const dt = Math.min(STEP_SECONDS, left);
    for (const m of modules) m.step(state, dt);
    state.time += dt;
    left -= dt;
  }
  return total;
}
