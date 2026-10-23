import type { Resources } from './resources';
import type { Rng } from './rng';

/** Lo que un módulo puede ver y tocar: los recursos comunes, el azar con semilla y su propio estado. */
export interface SimContext {
  resources: Resources;
  rng: Rng;
}

/** Una compra que ofrece un módulo (el coste y los textos salen de los JSON de `src/data/`). */
export interface Purchase {
  id: string;
  cost: Partial<Resources>;
}

export interface SimModule<S = unknown> {
  id: string;
  /** Versión del formato guardado del módulo. */
  version: number;
  init(): S;
  step(state: S, ctx: SimContext, dt: number): void;
  serialize(state: S): unknown;
  /** Carga datos guardados con la versión `version`; lo que falte toma el valor por defecto. */
  load(data: unknown, version: number): S;
  purchases(state: S, ctx: SimContext): Purchase[];
}
