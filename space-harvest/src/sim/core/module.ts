import type { GameState } from './state';

/** Contrato de cada módulo: solo toca sus recursos y lee/escribe los comunes. */
export interface GameModule<S = unknown> {
  id: string;
  /** Versión de su parte del guardado. */
  version: number;
  init(state: GameState): S;
  step(state: GameState, mod: S, dt: number): void;
  serialize(mod: S): unknown;
  /** `data` es undefined si el módulo no estaba en la partida guardada: cargar valores por defecto. */
  load(state: GameState, data: unknown, savedVersion: number): S;
}
