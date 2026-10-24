import type { Rng } from './rng'

/** Recursos comunes que todos los módulos pueden leer y escribir. */
export interface Shared {
  credits: number
  energy: number
  rng: Rng
}

/** Contrato de cada módulo: solo toca sus recursos y los comunes, nunca el código de otro. */
export interface SimModule<S = unknown> {
  id: string
  /** Versión del formato guardado de este módulo. */
  version: number
  init(shared: Shared): S
  step(state: S, shared: Shared, dt: number): void
  serialize(state: S): unknown
  /** Recibe lo guardado con su versión; migra o rellena con valores por defecto. */
  load(data: unknown, version: number, shared: Shared): S
}
