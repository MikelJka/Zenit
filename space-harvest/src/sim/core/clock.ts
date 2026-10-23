import type { GameState, SimModule } from './types';

/** Avanza la simulación en pasos fijos de 1 s (el tiempo entra como parámetro: sirve para el juego cerrado y los tests). */
export const STEP_SECONDS = 1;
/** Con el juego cerrado se simulan como mucho 8 h. */
export const MAX_OFFLINE_SECONDS = 8 * 3600;

export function advance(state: GameState, modules: SimModule[], seconds: number): void {
  let left = Math.max(0, seconds);
  while (left > 1e-9) {
    const dt = Math.min(STEP_SECONDS, left);
    for (const m of modules) m.step(state, dt);
    state.time += dt;
    left -= dt;
  }
}

export function offlineSeconds(savedAtMs: number, nowMs: number): number {
  return Math.min(MAX_OFFLINE_SECONDS, Math.max(0, (nowMs - savedAtMs) / 1000));
}
