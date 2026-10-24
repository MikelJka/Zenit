import type { Rng } from './rng';

/** Recursos comunes que leen y escriben todos los módulos. */
export interface Common {
  credits: number;
  energy: number;
  data: number;
}

export interface Purchase {
  id: string;
  cost: number;
}

export interface SimContext {
  common: Common;
  rng: Rng;
}

/** Un módulo solo toca sus recursos y los comunes; nunca el código de otro módulo. */
export interface SimModule<S = unknown> {
  id: string;
  version: number;
  init(): S;
  step(state: S, ctx: SimContext, dt: number): void;
  serialize(state: S): unknown;
  load(raw: unknown, savedVersion: number): S;
  purchases(state: S, ctx: SimContext): Purchase[];
}
