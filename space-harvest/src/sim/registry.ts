import type { Purchase, SimModule } from './core/module';
import { createState, type GameState } from './core/state';

/** Módulos activos, en orden fijo de ejecución. Un módulo nuevo se añade aquí. */
export const MODULES: SimModule[] = [];

/** Crea una partida nueva con todos los módulos inicializados. */
export function newGame(seed: number, modules: SimModule[] = MODULES): GameState {
  const state = createState(seed);
  for (const m of modules) m.init(state);
  return state;
}

/** Avanza la simulación `dt` segundos llamando a los módulos en orden. */
export function step(state: GameState, dt: number, modules: SimModule[] = MODULES): void {
  for (const m of modules) m.step(state, dt);
  state.time += dt;
}

export function allPurchases(state: GameState, modules: SimModule[] = MODULES): Purchase[] {
  return modules.flatMap((m) => m.purchases(state));
}
