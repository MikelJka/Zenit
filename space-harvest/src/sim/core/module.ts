/** Contrato de un módulo de la simulación. Un módulo no toca el código de otro. */
export interface SimContext {
  /** Recursos comunes (créditos, energía…) y los propios de cada módulo, por id. */
  resources: Record<string, number>;
  rng: import('./rng').Rng;
}

export interface SimModule<S = unknown> {
  id: string;
  /** Versión del formato guardado de este módulo. */
  version: number;
  init(ctx: SimContext): S;
  /** Avanza `dt` segundos de juego. */
  step(state: S, dt: number, ctx: SimContext): void;
  serialize(state: S): unknown;
  /** `data` es undefined si la partida no tiene este módulo; `version` es la guardada. */
  load(data: unknown, version: number, ctx: SimContext): S;
}
