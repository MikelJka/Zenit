import type { Rng } from './rng';

/** Recursos comunes que todos los módulos pueden leer y escribir. */
export interface CommonState {
  credits: number;
  data: number;
  energy: number;
}

export function newCommonState(): CommonState {
  return { credits: 0, data: 0, energy: 0 };
}

/** Contexto que recibe cada módulo en cada paso. */
export interface SimContext {
  common: CommonState;
  rng: Rng;
}

/** Contrato de un módulo: solo toca sus recursos y los comunes. */
export interface SimModule<S = unknown> {
  id: string;
  /** Versión del formato de guardado de este módulo. */
  version: number;
  init(): S;
  step(state: S, dt: number, ctx: SimContext): void;
  serialize(state: S): unknown;
  /** Carga datos guardados con `savedVersion`; usa valores por defecto para lo nuevo. */
  load(data: unknown, savedVersion: number): S;
}
