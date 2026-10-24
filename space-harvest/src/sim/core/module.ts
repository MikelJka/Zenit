/** Contrato de un módulo de juego (regla de módulos: solo toca sus recursos y los comunes). */
export interface Common {
  credits: number;
}

export interface Purchase {
  id: string;
  cost: number;
}

export interface GameModule<S = unknown> {
  id: string;
  /** Versión del formato guardado de este módulo. */
  version: number;
  init(): S;
  step(state: S, common: Common, dt: number): void;
  serialize(state: S): unknown;
  /** Recibe lo guardado con la versión con la que se guardó; debe migrar y poner valores por defecto. */
  load(data: unknown, savedVersion: number): S;
  purchases(state: S, common: Common): Purchase[];
}
