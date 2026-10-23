import { Rng } from './rng';

/** Recursos comunes a todos los módulos (los módulos añaden los suyos en `modules`). */
export interface GameState {
  /** Segundos de juego transcurridos. */
  time: number;
  /** Marca de tiempo (ms) del último guardado, para las ganancias con el juego cerrado. */
  savedAt: number;
  resources: Record<string, number>;
  /** Estado propio de cada módulo, por id. */
  modules: Record<string, unknown>;
  rng: Rng;
}

export function newState(seed: number): GameState {
  return { time: 0, savedAt: 0, resources: { credits: 0 }, modules: {}, rng: new Rng(seed) };
}
