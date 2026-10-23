import type { Rng } from './rng';

/** Contexto que ve un módulo: recursos comunes y el generador con semilla. */
export interface SimContext {
  rng: Rng;
  /** Recursos comunes (créditos, energía…) por id. */
  resources: Record<string, number>;
}

/** Contrato de un módulo: solo toca sus recursos y los comunes, nunca el código de otro. */
export interface SimModule<S = unknown> {
  id: string;
  version: number;
  init(ctx: SimContext): S;
  step(state: S, ctx: SimContext, dt: number): void;
  serialize(state: S): unknown;
  load(data: unknown, savedVersion: number): S;
}
