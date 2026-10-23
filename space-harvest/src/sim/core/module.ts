import type { Rng } from './rng';

/** Recursos comunes que todos los módulos pueden leer y escribir. */
export interface CommonState {
  credits: number;
  energy: number;
  data: number;
}

export interface SimContext {
  common: CommonState;
  rng: Rng;
}

/** Contrato de un módulo: cada uno lleva su estado y no toca el código de otro. */
export interface SimModule<S = unknown> {
  id: string;
  /** Versión del formato de guardado de este módulo. */
  version: number;
  init(): S;
  step(state: S, dt: number, ctx: SimContext): void;
  serialize(state: S): unknown;
  /** Carga datos guardados (pueden ser de otra versión o no existir). */
  load(data: unknown, savedVersion: number): S;
}
