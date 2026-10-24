/** Contrato de cada módulo de juego: solo toca sus recursos y los comunes. */
export interface GameModule<S = unknown> {
  readonly id: string;
  /** Versión del formato de guardado de este módulo. */
  readonly version: number;
  init(): S;
  step(state: S, dt: number): void;
  serialize(state: S): unknown;
  /** Carga datos guardados (o `undefined` si el módulo es nuevo) con migración desde `fromVersion`. */
  load(data: unknown, fromVersion: number): S;
}
