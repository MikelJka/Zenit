import type { Clock } from './clock';
import type { Rng } from './rng';

/** Estado común a todos los módulos: recursos compartidos, reloj y azar. */
export interface GameState {
  clock: Clock;
  rng: Rng;
  /** Recursos comunes (créditos, energía…) por id. */
  resources: Record<string, number>;
  /** Estado propio de cada módulo, por id de módulo. */
  modules: Record<string, unknown>;
}

export interface PurchaseDef {
  id: string;
  cost: Record<string, number>;
}

/** Un módulo solo toca sus recursos y los recursos comunes; nunca el código de otro. */
export interface SimModule<S = unknown> {
  id: string;
  /** Versión de su formato de guardado. */
  version: number;
  init(game: GameState): S;
  step(game: GameState, state: S, dt: number): void;
  serialize(state: S): unknown;
  /** `data` es undefined si la partida es anterior al módulo, o viene de `fromVersion` anterior. */
  load(data: unknown, fromVersion: number, game: GameState): S;
  purchases(state: S): PurchaseDef[];
}
