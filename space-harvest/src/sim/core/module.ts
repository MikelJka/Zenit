/** Contrato que cumple cada módulo del juego (investigación, agricultura, solar, minería…). */
export interface Purchase {
  id: string;
  cost: number;
}

export interface GameModule<S = unknown> {
  id: string;
  /** Versión del formato guardado de este módulo. */
  version: number;
  init(): S;
  /** Avanza la simulación `dt` segundos. Puro: el tiempo entra como parámetro. */
  step(state: S, dt: number, common: CommonState): void;
  serialize(state: S): unknown;
  /** Carga datos guardados con la versión `version`; los campos nuevos reciben valor por defecto. */
  load(data: unknown, version: number): S;
  purchases(state: S): Purchase[];
}

/** Recursos comunes que cualquier módulo puede leer y escribir. */
export interface CommonState {
  credits: number;
}
