import { Rng } from './rng';

/** Recursos comunes a todos los módulos. Cada módulo añade los suyos dentro de `modules`. */
export interface Resources {
  credits: number;
  energy: number;
  data: number;
}

export interface GameState {
  /** Segundos de juego simulados desde el inicio de la partida. */
  time: number;
  resources: Resources;
  /** Estado de cada módulo por id. */
  modules: Record<string, unknown>;
  rng: Rng;
}

export function createState(seed: number): GameState {
  return {
    time: 0,
    resources: { credits: 0, energy: 0, data: 0 },
    modules: {},
    rng: new Rng(seed),
  };
}
