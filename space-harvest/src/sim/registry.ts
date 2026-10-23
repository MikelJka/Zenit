import type { GameState } from './core/state';

/** Contrato de un módulo: solo toca sus recursos y los comunes. */
export interface SimModule<S = unknown> {
  id: string;
  /** Versión del formato guardado de este módulo. */
  version: number;
  init(state: GameState): S;
  step(state: GameState, dt: number): void;
  serialize(state: GameState): unknown;
  /** `data` es `undefined` si la partida no lo tenía; `version` la guardada. */
  load(state: GameState, data: unknown, version: number): void;
}

/** Módulos activos, en orden fijo de ejecución. */
export class Registry {
  private list: SimModule[] = [];

  constructor(modules: SimModule[] = []) {
    modules.forEach((m) => this.register(m));
  }

  register(m: SimModule): void {
    if (this.list.some((x) => x.id === m.id)) throw new Error(`Módulo duplicado: ${m.id}`);
    this.list.push(m);
  }

  get modules(): readonly SimModule[] {
    return this.list;
  }

  init(state: GameState): void {
    for (const m of this.list) state.modules[m.id] = m.init(state);
  }

  step(state: GameState, dt: number): void {
    for (const m of this.list) m.step(state, dt);
  }
}

/** Módulos del juego, en orden de ejecución. Vacío hasta el Hito 1. */
export const activeModules: SimModule[] = [];
