/** Contrato de cada módulo de juego: solo toca sus recursos y los comunes. */
export interface Purchase {
  id: string;
}

export interface GameModule<S = unknown> {
  id: string;
  /** Versión del formato guardado de este módulo. */
  version: number;
  init(): S;
  step(state: S, dt: number): void;
  serialize(state: S): unknown;
  /** `data` es undefined si la partida no tenía este módulo, o puede venir de una versión anterior. */
  load(data: unknown, savedVersion: number): S;
  purchases(state: S): Purchase[];
}
