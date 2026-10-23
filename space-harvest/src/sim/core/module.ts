import type { Rng } from './rng'

/** Recursos comunes que cualquier módulo puede leer y escribir. */
export interface CommonState {
  credits: number
}

export interface SimContext {
  common: CommonState
  rng: Rng
}

/** Contrato de un módulo: solo toca sus recursos y los comunes. */
export interface SimModule<S = unknown> {
  id: string
  /** Versión del formato guardado de este módulo. */
  version: number
  init(): S
  step(state: S, ctx: SimContext, dt: number): void
  serialize(state: S): unknown
  /** `data` y `version` vienen del guardado; `undefined` si el módulo es nuevo. Migra o usa valores por defecto. */
  load(data: unknown, version: number | undefined): S
}
