import type { GameState } from './state';

/** Algo que el jugador puede comprar en un módulo (la interfaz lo lista; el módulo lo aplica). */
export interface Purchase {
  id: string;
  cost: number;
  canBuy(state: GameState): boolean;
  buy(state: GameState): void;
}

/**
 * Contrato de un módulo (investigación, agricultura, solar, minería…).
 * Un módulo solo añade sus recursos y reglas y lee/escribe los recursos comunes;
 * no toca el código de otro.
 */
export interface SimModule<Data = unknown> {
  id: string;
  /** Versión del formato guardado de este módulo; súbela y añade migración si cambia. */
  version: number;
  init(state: GameState): void;
  /** Avanza `dt` segundos de juego (el tiempo siempre entra como parámetro). */
  step(state: GameState, dt: number): void;
  serialize(state: GameState): Data;
  /** Carga datos guardados con `savedVersion`; migra los antiguos y rellena lo nuevo con valores por defecto. */
  load(state: GameState, data: unknown, savedVersion: number): void;
  purchases(state: GameState): Purchase[];
}
