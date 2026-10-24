/** Un módulo solo toca sus recursos y los recursos comunes. */
export interface GameState {
  /** Segundos de juego transcurridos. */
  time: number;
  rng: import('./rng').Rng;
  /** Recursos comunes (créditos, energía…) por id. */
  resources: Record<string, number>;
  /** Estado propio de cada módulo por id. */
  modules: Record<string, unknown>;
}

export interface SimModule<S = unknown> {
  id: string;
  /** Versión del formato de guardado de este módulo. */
  version: number;
  init(state: GameState): S;
  step(state: GameState, dt: number): void;
  serialize(state: GameState): unknown;
  /** Recibe `undefined` si la partida antigua no tenía este módulo. */
  load(state: GameState, data: unknown, savedVersion: number | undefined): void;
}
