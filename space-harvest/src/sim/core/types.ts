/** Recursos comunes a todos los módulos (cada módulo añade los suyos en su propio estado). */
export interface CommonResources {
  credits: number;
  energy: number;
  data: number;
}

export interface GameState {
  /** Segundos de juego simulados desde el inicio de la partida. */
  time: number;
  rng: Rng;
  resources: CommonResources;
  /** Estado propio de cada módulo, por id. */
  modules: Record<string, unknown>;
}

import type { Rng } from './rng';

/** Contrato de un módulo: solo toca sus recursos y los comunes. */
export interface SimModule<S = unknown> {
  id: string;
  /** Versión del formato de guardado del módulo. */
  version: number;
  init(state: GameState): S;
  step(state: GameState, dt: number): void;
  serialize(state: GameState): unknown;
  /** Carga datos guardados (o `undefined` si la partida es anterior al módulo: valores por defecto). */
  load(state: GameState, data: unknown, savedVersion: number): void;
}
