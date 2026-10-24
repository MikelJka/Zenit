import { Rng } from './rng';

/** Estado común a todos los módulos. Los recursos de cada módulo viven en `modules[id]`. */
export interface GameState {
  /** Segundos simulados desde el inicio de la partida. */
  time: number;
  /** Créditos y otros recursos comunes, por id. */
  resources: Record<string, number>;
  rng: Rng;
  modules: Record<string, unknown>;
}

export function newState(seed: number): GameState {
  return { time: 0, resources: { credits: 0 }, rng: new Rng(seed), modules: {} };
}
