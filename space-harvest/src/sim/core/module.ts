export interface Purchase {
  id: string;
  cost: number;
}

/** Contrato de cada módulo: solo toca sus recursos y los comunes. */
export interface SimModule<S = unknown> {
  id: string;
  version: number;
  init(): S;
  step(state: S, dt: number): void;
  serialize(state: S): unknown;
  load(data: unknown, savedVersion: number): S;
  purchases(state: S): Purchase[];
}
