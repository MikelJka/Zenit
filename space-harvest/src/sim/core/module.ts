import type { Rng } from './rng';

/** Recursos comunes que todos los módulos leen y escriben. */
export interface Common {
  credits: number;
  energy: number;
  data: number;
}

export interface Purchase {
  id: string;
  cost: number;
}

/** Contrato de cada módulo (investigación, agricultura, solar, minería…). Ver CLAUDE.md. */
export interface SimModule<S = unknown> {
  id: string;
  /** Versión del formato guardado de este módulo. */
  version: number;
  init(): S;
  step(state: S, common: Common, dtMs: number, rng: Rng): void;
  serialize(state: S): unknown;
  /** Recibe lo guardado (puede ser de una versión antigua o faltar) y devuelve un estado válido. */
  load(raw: unknown, savedVersion: number): S;
  purchases(state: S, common: Common): Purchase[];
}
