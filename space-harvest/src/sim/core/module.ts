export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

export interface SimContext {
  /** Recursos comunes (créditos, energía…): los módulos leen y escriben aquí. */
  resources: Record<string, number>;
}

/** Contrato de un módulo: solo toca sus recursos y los comunes. */
export interface SimModule<S = unknown> {
  id: string;
  /** Versión del formato guardado de este módulo. */
  version: number;
  init(ctx: SimContext): S;
  step(state: S, ctx: SimContext, dtMs: number): void;
  serialize(state: S): Json;
  /** `data` puede venir de una versión anterior; undefined = módulo nuevo. */
  load(data: Json | undefined, savedVersion: number, ctx: SimContext): S;
}
