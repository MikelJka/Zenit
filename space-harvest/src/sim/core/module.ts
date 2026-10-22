import type { Rng } from './rng';

/** Recursos comunes: id de recurso → cantidad. Cada módulo añade los suyos. */
export type Resources = Record<string, number>;

export interface SimContext {
  resources: Resources;
  rng: Rng;
}

/** Contrato de un módulo: solo toca sus recursos y los comunes, nunca el código de otro. */
export interface GameModule<S = unknown> {
  id: string;
  /** Versión del formato guardado de este módulo. */
  version: number;
  init(ctx: SimContext): S;
  /** Avanza `dt` segundos de juego. */
  step(state: S, dt: number, ctx: SimContext): void;
  serialize(state: S): unknown;
  /** `data` es undefined en partidas antiguas sin este módulo, o trae una versión anterior. */
  load(data: unknown, version: number, ctx: SimContext): S;
}
