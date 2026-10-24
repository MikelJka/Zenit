export interface GameModule<S = unknown> {
  id: string;
  /** Versión del formato guardado de este módulo. */
  version: number;
  init(): S;
  step(state: S, dtMs: number): void;
  serialize(state: S): unknown;
  /** Carga datos guardados con la versión `version`; los campos que falten toman su valor por defecto. */
  load(data: unknown, version: number): S;
}
