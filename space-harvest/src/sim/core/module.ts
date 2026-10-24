import type { Rng } from './rng';

/** Recursos comunes que cualquier módulo puede leer y escribir. */
export interface CommonResources {
  credits: number;
  energy: number;
}

export interface SimContext {
  resources: CommonResources;
  rng: Rng;
}

/** Contrato de un módulo: solo añade sus recursos y reglas; no toca el código de otro. */
export interface SimModule<S = unknown> {
  readonly id: string;
  /** Versión del formato guardado de este módulo. */
  readonly version: number;
  init(ctx: SimContext): S;
  step(state: S, ctx: SimContext, dtMs: number): void;
  serialize(state: S): unknown;
  /** `data` es undefined si la partida es anterior al módulo: usar valores por defecto. */
  load(data: unknown, savedVersion: number, ctx: SimContext): S;
}
