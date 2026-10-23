import type { GameModule, GameState } from './module';
import { Rng } from './rng';

export function newGame(modules: GameModule[], seed = 1): GameState {
  const state: GameState = { time: 0, credits: 0, rng: new Rng(seed), modules: {} };
  for (const m of modules) state.modules[m.id] = m.init(state);
  return state;
}

/** Un paso de simulación: los módulos se ejecutan en el orden del registro. */
export function step(state: GameState, modules: GameModule[], dt: number): void {
  for (const m of modules) m.step(state, state.modules[m.id], dt);
  state.time += dt;
}

/** Ganancias con el juego cerrado: pasos de 1 s (el último, fraccionario). */
export function advance(state: GameState, modules: GameModule[], seconds: number): void {
  let left = Math.max(0, seconds);
  while (left > 0) {
    const dt = Math.min(1, left);
    step(state, modules, dt);
    left -= dt;
  }
}
