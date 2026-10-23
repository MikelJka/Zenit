/** Recursos comunes a todos los módulos. */
export interface Resources {
  credits: number;
  energy: number;
  data: number;
}

export interface GameState {
  /** Tiempo de juego en segundos. */
  time: number;
  resources: Resources;
  rng: Rng;
  /** Estado propio de cada módulo, por id. */
  modules: Record<string, unknown>;
}

import type { Rng } from './rng';

/** Un módulo solo toca sus recursos y los recursos comunes (ver CLAUDE.md). */
export interface SimModule<S = unknown> {
  id: string;
  version: number;
  init(): S;
  /** Avanza `dt` segundos. El tiempo entra como parámetro: sin relojes ocultos. */
  step(state: GameState, own: S, dt: number): void;
  serialize(own: S): unknown;
  load(data: unknown, savedVersion: number): S;
}
