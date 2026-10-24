import { Clock } from './clock';
import type { Json, SimContext, SimModule } from './module';
import { Rng } from './rng';

export const SAVE_VERSION = 1;

interface SavedModule {
  v: number;
  d: Json;
}

export interface SaveData {
  version: number;
  now: number;
  rng: number;
  resources: Record<string, number>;
  modules: Record<string, SavedModule>;
}

export class Game {
  readonly clock = new Clock();
  readonly ctx: SimContext = { resources: {} };
  rng: Rng;
  private states = new Map<string, unknown>();

  constructor(private mods: SimModule[], seed: number, save?: SaveData) {
    this.rng = new Rng(seed);
    if (save) {
      this.clock.now = save.now;
      this.rng.setState(save.rng);
      this.ctx.resources = { ...save.resources };
    }
    for (const m of mods) {
      const saved = save?.modules[m.id];
      // Un módulo ausente en la partida carga con sus valores por defecto.
      this.states.set(m.id, saved ? m.load(saved.d, saved.v, this.ctx) : m.init(this.ctx));
    }
  }

  step(dtMs: number): void {
    this.clock.advance(dtMs, (tick) => {
      for (const m of this.mods) m.step(this.states.get(m.id), this.ctx, tick);
    });
  }

  /** Ganancias con el juego cerrado: avanza el tiempo transcurrido, con tope. */
  offline(elapsedMs: number, capMs: number): void {
    this.step(Math.max(0, Math.min(elapsedMs, capMs)));
  }

  stateOf<S>(id: string): S {
    return this.states.get(id) as S;
  }

  serialize(): SaveData {
    const modules: Record<string, SavedModule> = {};
    for (const m of this.mods) modules[m.id] = { v: m.version, d: m.serialize(this.states.get(m.id)) };
    return {
      version: SAVE_VERSION,
      now: this.clock.now,
      rng: this.rng.getState(),
      resources: { ...this.ctx.resources },
      modules,
    };
  }
}
