import { Clock } from './clock';
import type { Common, GameModule } from './module';
import { Rng } from './rng';
import { SAVE_VERSION, type SaveData, migrateSave } from './save';

/** Estado completo de una partida: recursos comunes, reloj, Rng y un estado por módulo. */
export class Game {
  common: Common = { credits: 0 };
  clock = new Clock();
  rng: Rng;
  states = new Map<string, unknown>();

  constructor(readonly modules: GameModule<any>[], seed = 1) {
    this.rng = new Rng(seed);
    for (const m of modules) this.states.set(m.id, m.init());
  }

  step(dt: number): number {
    return this.clock.advance(dt, (tick) => {
      for (const m of this.modules) m.step(this.states.get(m.id), this.common, tick);
    });
  }

  /** Ganancias con el juego cerrado: simula `seconds` (con tope) y devuelve los segundos aplicados. */
  offline(seconds: number, capSeconds: number): number {
    const used = Math.max(0, Math.min(seconds, capSeconds));
    this.step(used);
    return used;
  }

  serialize(): SaveData {
    const modules: SaveData['modules'] = {};
    for (const m of this.modules) modules[m.id] = { version: m.version, data: m.serialize(this.states.get(m.id)) };
    return { version: SAVE_VERSION, common: { ...this.common }, clock: this.clock.serialize(), rng: this.rng.getState(), modules };
  }

  load(raw: unknown): void {
    const save = migrateSave(raw);
    this.common = { credits: save.common.credits ?? 0 };
    this.clock.load(save.clock);
    this.rng.setState(save.rng ?? this.rng.getState());
    for (const m of this.modules) {
      const saved = save.modules[m.id];
      // Módulo nuevo en una partida antigua: valores por defecto.
      this.states.set(m.id, saved ? m.load(saved.data, saved.version) : m.init());
    }
  }
}
