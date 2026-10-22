import { Rng } from './rng';
import type { Registry } from './registry';
import type { Resources, SimContext } from './module';

export const SAVE_VERSION = 1;
/** Paso fijo de la simulación, en segundos. */
export const TICK = 1;

export interface SaveData {
  version: number;
  savedAt: number;
  seed: number;
  rngState: number;
  resources: Resources;
  modules: Record<string, { version: number; data: unknown }>;
}

export class Game {
  readonly ctx: SimContext;
  private states = new Map<string, unknown>();

  constructor(private registry: Registry, seed: number) {
    this.ctx = { resources: {}, rng: new Rng(seed) };
    for (const m of registry.all()) this.states.set(m.id, m.init(this.ctx));
  }

  state<S>(id: string): S {
    return this.states.get(id) as S;
  }

  /** Avanza `seconds` segundos en pasos fijos (también sirve para lo ganado con el juego cerrado). */
  advance(seconds: number): void {
    let left = seconds;
    while (left > 0) {
      const dt = Math.min(TICK, left);
      for (const m of this.registry.all()) m.step(this.states.get(m.id), dt, this.ctx);
      left -= dt;
    }
  }

  save(now: number, seed: number): SaveData {
    const modules: SaveData['modules'] = {};
    for (const m of this.registry.all()) {
      modules[m.id] = { version: m.version, data: m.serialize(this.states.get(m.id)) };
    }
    return {
      version: SAVE_VERSION,
      savedAt: now,
      seed,
      rngState: this.ctx.rng.getState(),
      resources: { ...this.ctx.resources },
      modules,
    };
  }

  /** Carga una partida; los módulos que falten en el guardado reciben `undefined`. */
  static load(registry: Registry, data: SaveData): Game {
    const g = new Game(registry, data.seed);
    g.ctx.rng.setState(data.rngState);
    g.ctx.resources = { ...data.resources };
    for (const m of registry.all()) {
      const saved = data.modules[m.id];
      g.states.set(m.id, m.load(saved?.data, saved?.version ?? 0, g.ctx));
    }
    return g;
  }
}

/** Segundos de ausencia que se simulan al volver, con el tope dado. */
export function offlineSeconds(savedAt: number, now: number, capSeconds: number): number {
  return Math.max(0, Math.min(capSeconds, Math.floor((now - savedAt) / 1000)));
}
