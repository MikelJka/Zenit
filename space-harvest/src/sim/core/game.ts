import { Clock } from './clock';
import type { SimModule } from './module';
import { Rng } from './rng';

export const SAVE_VERSION = 1;

interface SaveFile {
  version: number;
  time: number;
  rng: number;
  modules: Record<string, { version: number; data: unknown }>;
}

/** Partida completa: reloj, Rng y el estado de cada módulo. */
export class Game {
  readonly clock = new Clock();
  readonly rng: Rng;
  readonly states: Record<string, unknown> = {};

  constructor(readonly modules: SimModule<any>[], seed = 1) {
    this.rng = new Rng(seed);
    for (const m of modules) this.states[m.id] = m.init();
  }

  /** Avanza `dt` segundos (también sirve para las ganancias con el juego cerrado). */
  advance(dt: number): void {
    this.clock.advance(dt, (step) => {
      for (const m of this.modules) m.step(this.states[m.id], step);
    });
  }

  serialize(): string {
    const modules: SaveFile['modules'] = {};
    for (const m of this.modules) {
      modules[m.id] = { version: m.version, data: m.serialize(this.states[m.id]) };
    }
    const file: SaveFile = { version: SAVE_VERSION, time: this.clock.time, rng: this.rng.getState(), modules };
    return JSON.stringify(file);
  }

  /** Carga una partida; un módulo ausente en el guardado arranca con sus valores por defecto. */
  static load(modules: SimModule<any>[], json: string): Game {
    const file = JSON.parse(json) as SaveFile;
    const game = new Game(modules);
    game.clock.time = file.time ?? 0;
    game.rng.setState(file.rng ?? 1);
    for (const m of modules) {
      const saved = file.modules?.[m.id];
      game.states[m.id] = saved ? m.load(saved.data, saved.version) : m.load(undefined, m.version);
    }
    return game;
  }
}
