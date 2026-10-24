// Contrato de un módulo de la simulación (ver docs/DISENO.md, sección 12).
export interface Purchase {
  id: string;
  cost: number;
}

export interface GameModule<S = unknown> {
  id: string;
  /** Versión del formato guardado de este módulo. */
  version: number;
  init(): S;
  step(state: S, dt: number, game: Game): void;
  serialize(state: S): unknown;
  /** Carga lo guardado; `data` puede ser undefined (módulo nuevo) o de una versión anterior. */
  load(data: unknown, savedVersion: number): S;
  purchases(state: S): Purchase[];
}

export interface Game {
  time: number;
  rng: import('./rng').Rng;
  /** Recursos comunes (créditos, energía…) por id. */
  resources: Record<string, number>;
  modules: Record<string, unknown>;
}
