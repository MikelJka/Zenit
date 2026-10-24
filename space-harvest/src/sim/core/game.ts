import { Clock, TICK_SECONDS } from './clock';
import { newCommonState, type CommonState, type SimModule } from './module';
import { Rng } from './rng';

export const SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  savedAt: number;
  seed: number;
  rngState: number;
  time: number;
  common: CommonState;
  modules: Record<string, { version: number; data: unknown }>;
}

/** Partida: reúne el reloj, el Rng, los recursos comunes y el estado de cada módulo. */
export class Game {
  readonly clock = new Clock();
  readonly rng: Rng;
  common: CommonState = newCommonState();
  private states = new Map<string, unknown>();

  constructor(
    readonly modules: SimModule<any>[],
    readonly seed = 1,
  ) {
    this.rng = new Rng(seed);
    for (const m of modules) this.states.set(m.id, m.init());
  }

  getState<S>(id: string): S {
    return this.states.get(id) as S;
  }

  /** Avanza `dt` segundos de juego en pasos fijos. */
  advance(dt: number): void {
    const steps = this.clock.advance(dt);
    for (let i = 0; i < steps; i++) {
      for (const m of this.modules) {
        m.step(this.states.get(m.id), TICK_SECONDS, { common: this.common, rng: this.rng });
      }
    }
  }

  save(nowMs: number): SaveData {
    const modules: SaveData['modules'] = {};
    for (const m of this.modules) {
      modules[m.id] = { version: m.version, data: m.serialize(this.states.get(m.id)) };
    }
    return {
      version: SAVE_VERSION,
      savedAt: nowMs,
      seed: this.seed,
      rngState: this.rng.getState(),
      time: this.clock.time,
      common: { ...this.common },
      modules,
    };
  }

  /** Carga una partida; lo que falte (módulos nuevos, recursos nuevos) toma su valor por defecto. */
  static load(modules: SimModule<any>[], save: SaveData): Game {
    const game = new Game(modules, save.seed);
    game.rng.setState(save.rngState);
    game.clock.time = save.time;
    game.common = { ...newCommonState(), ...save.common };
    for (const m of modules) {
      const saved = save.modules[m.id];
      if (saved) game.states.set(m.id, m.load(saved.data, saved.version));
    }
    return game;
  }
}
