import type { Rng } from './rng';

/** Estado común de la partida; los módulos añaden el suyo en `modules`. */
export interface GameState {
  time: number;
  credits: number;
  rng: Rng;
  modules: Record<string, unknown>;
}

/** Contrato de un módulo: solo toca su estado y los recursos comunes. */
export interface GameModule<S = unknown> {
  id: string;
  /** Versión del formato guardado del módulo. */
  version: number;
  init(state: GameState): S;
  step(state: GameState, mod: S, dt: number): void;
  serialize(mod: S): unknown;
  /** `data` puede ser undefined (partida antigua sin este módulo) o de una versión anterior. */
  load(data: unknown, savedVersion: number): S;
}
