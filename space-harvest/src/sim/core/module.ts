/** Contrato de un módulo del juego: solo toca sus recursos y los comunes. */
export interface SimModule<S = unknown> {
  id: string;
  /** Versión del formato guardado de este módulo. */
  version: number;
  init(): S;
  step(state: S, dt: number): void;
  serialize(state: S): unknown;
  /** `data` es lo guardado (o undefined si el módulo es nuevo); `version` la versión con la que se guardó. */
  load(data: unknown, version: number): S;
}
