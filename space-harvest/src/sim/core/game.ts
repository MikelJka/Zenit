import { Clock, offlineMs } from './clock';
import type { Common, SimModule } from './module';
import { Rng } from './rng';
import { SAVE_VERSION, type SaveData } from './save';

/** Partida completa: recursos comunes, estado de cada módulo, reloj y semilla. */
export class Game {
  common: Common = { credits: 0, energy: 0, data: 0 };
  clock = new Clock();
  rng: Rng;
  states = new Map<string, unknown>();

  constructor(private mods: SimModule[], seed = 1) {
    this.rng = new Rng(seed);
    for (const m of mods) this.states.set(m.id, m.init());
  }

  advance(dtMs: number): number {
    return this.clock.advance(dtMs, (step) => {
      for (const m of this.mods) m.step(this.states.get(m.id), this.common, step, this.rng);
    });
  }

  /** Ganancias con el juego cerrado: simula el tiempo ausente (con tope). */
  applyOffline(lastSeenMs: number, nowMs: number): number {
    return this.advance(offlineMs(lastSeenMs, nowMs));
  }

  save(nowMs: number): SaveData {
    const modules: SaveData['modules'] = {};
    for (const m of this.mods) {
      modules[m.id] = { version: m.version, data: m.serialize(this.states.get(m.id)) };
    }
    return { version: SAVE_VERSION, savedAt: nowMs, common: { ...this.common }, rng: this.rng.state, modules };
  }

  load(data: SaveData): void {
    this.common = { ...this.common, ...data.common };
    this.rng.state = data.rng;
    for (const m of this.mods) {
      const saved = data.modules[m.id];
      this.states.set(m.id, saved ? m.load(saved.data, saved.version) : m.init());
    }
  }
}
