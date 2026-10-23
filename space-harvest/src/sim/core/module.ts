/** Contrato de un módulo de juego: solo toca sus recursos y los comunes (ver CLAUDE.md). */
export interface Purchase {
  id: string;
  cost: number;
}

export interface GameModule<S = unknown> {
  id: string;
  /** Versión del formato guardado de este módulo. */
  version: number;
  init(): S;
  step(state: S, dt: number): void;
  serialize(state: S): unknown;
  load(data: unknown, savedVersion: number): S;
  purchases(state: S): Purchase[];
}
