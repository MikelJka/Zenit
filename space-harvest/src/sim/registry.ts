import type { GameModule } from './core/module';
import { createState, type GameState } from './core/state';

/** Módulos activos, en el orden fijo en que se ejecutan cada paso. */
export const modules: GameModule[] = [];

export function newGame(seed: number, active: GameModule[] = modules): GameState {
  const state = createState(seed);
  for (const m of active) m.init(state);
  return state;
}

/** Avanza la simulación `seconds` segundos en pasos de 1 s (el resto, en un último paso más corto). */
export function advance(state: GameState, seconds: number, active: GameModule[] = modules): void {
  let left = Math.max(0, seconds);
  while (left > 0) {
    const dt = Math.min(1, left);
    for (const m of active) m.step(state, dt);
    state.time += dt;
    left -= dt;
  }
}
