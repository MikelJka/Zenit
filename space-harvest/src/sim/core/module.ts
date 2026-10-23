import type { Rng } from './rng';

/** Recursos comunes que todos los módulos pueden leer y escribir. */
export interface CommonState {
  credits: number;
  energy: number;
}

/** Contexto que recibe cada módulo en cada paso. El tiempo entra siempre como parámetro. */
export interface SimContext {
  common: CommonState;
  rng: Rng;
}

export interface Purchase {
  id: string;
  cost: number;
}

/**
 * Contrato de un módulo. Solo añade sus propios recursos y reglas;
 * no toca el código de otro módulo. `S` es el estado propio, serializable a JSON.
 */
export interface SimModule<S = unknown> {
  id: string;
  /** Versión del formato guardado de este módulo. */
  version: number;
  init(): S;
  step(state: S, dt: number, ctx: SimContext): void;
  serialize(state: S): unknown;
  /** `data` puede faltar (módulo nuevo) o venir de una versión anterior: migrar o usar valores por defecto. */
  load(data: unknown, savedVersion: number): S;
  purchases(state: S, ctx: SimContext): Purchase[];
}
