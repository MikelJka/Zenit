import type { GameState } from './state';

export interface Purchase {
  id: string;
  /** Coste en créditos (los costes de otros recursos los añadirá cada módulo cuando haga falta). */
  cost: number;
}

/**
 * Contrato de un módulo. Un módulo solo añade sus recursos y reglas y lee/escribe los recursos comunes;
 * no toca el código de otro.
 */
export interface GameModule<S = unknown> {
  id: string;
  /** Versión del formato guardado de este módulo. */
  version: number;
  init(state: GameState): void;
  step(state: GameState, dt: number): void;
  serialize(state: GameState): S;
  /** Carga datos guardados con `savedVersion`; `undefined` si el módulo no estaba en la partida. */
  load(state: GameState, data: S | undefined, savedVersion: number): void;
  purchases(state: GameState): Purchase[];
}
