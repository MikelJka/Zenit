import type { CommonState, SimContext, SimModule } from './module';
import { Rng } from './rng';

export interface GameState {
  common: CommonState;
  /** Segundos de juego transcurridos (reloj de la simulación). */
  time: number;
  rng: Rng;
  modules: Record<string, unknown>;
}

export function newGame(modules: SimModule<any>[], seed = 1): GameState {
  const state: GameState = {
    common: { credits: 0, energy: 0 },
    time: 0,
    rng: new Rng(seed),
    modules: {},
  };
  for (const m of modules) state.modules[m.id] = m.init();
  return state;
}

/** Un paso de simulación de `dt` segundos. */
export function step(state: GameState, modules: SimModule<any>[], dt: number): void {
  const ctx: SimContext = { common: state.common, rng: state.rng };
  for (const m of modules) m.step(state.modules[m.id], dt, ctx);
  state.time += dt;
}

/** Avanza `seconds` en pasos de 1 s (ganancias con el juego cerrado y tests). */
export function advance(state: GameState, modules: SimModule<any>[], seconds: number): void {
  let left = seconds;
  while (left >= 1) {
    step(state, modules, 1);
    left -= 1;
  }
  if (left > 0) step(state, modules, left);
}
