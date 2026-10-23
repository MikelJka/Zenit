import type { Rng } from './rng';

/** Estado común de la partida: lo único que los módulos comparten. */
export interface GameState {
  rng: Rng;
  /** Recursos comunes (créditos, energía…) por id. */
  resources: Record<string, number>;
  /** Estado propio de cada módulo por id. */
  modules: Record<string, unknown>;
}

export interface Purchase {
  id: string;
  cost: number;
  resource: string;
}

/** Contrato de un módulo. Un módulo solo toca sus recursos y los comunes, nunca el código de otro. */
export interface SimModule<S = unknown> {
  id: string;
  /** Versión del formato guardado del módulo. */
  version: number;
  init(game: GameState): S;
  step(game: GameState, state: S, dt: number): void;
  serialize(state: S): unknown;
  /** `data` es undefined si la partida no tenía el módulo, o viene de una versión anterior. */
  load(data: unknown, fromVersion: number): S;
  purchases(state: S): Purchase[];
}
