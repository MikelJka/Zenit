import type { Rng } from './rng';

/** Estado común a todos los módulos: lo que un módulo puede leer y escribir de los demás. */
export interface CoreState {
  /** Segundos de juego simulados. */
  time: number;
  /** Créditos, el recurso común. */
  credits: number;
  rng: Rng;
}

/** Contrato de un módulo: solo toca sus recursos y los comunes, nunca el código de otro. */
export interface GameModule<S = unknown> {
  id: string;
  /** Versión del formato guardado de este módulo. */
  version: number;
  init(core: CoreState): S;
  step(core: CoreState, own: S, dt: number): void;
  serialize(own: S): unknown;
  /** `data` es `undefined` si la partida es anterior al módulo: debe cargar con valores por defecto. */
  load(core: CoreState, data: unknown, savedVersion: number | undefined): S;
}
