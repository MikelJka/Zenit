import { advance, createClock, TICK_SECONDS, type Clock } from './clock';
import type { Common, SimContext, SimModule } from './module';
import { Rng } from './rng';
import { migrateSave, SAVE_VERSION, type SaveFile } from './save';

export class Game {
  readonly common: Common = { credits: 0, energy: 0, data: 0 };
  readonly clock: Clock = createClock();
  readonly rng: Rng;
  readonly states = new Map<string, unknown>();

  constructor(private readonly modules: SimModule[], seed = 1) {
    this.rng = new Rng(seed);
    for (const m of modules) this.states.set(m.id, m.init());
  }

  private ctx(): SimContext {
    return { common: this.common, rng: this.rng };
  }

  /** Avanza `dt` segundos; sirve igual para el juego abierto que para las ganancias offline. */
  update(dt: number): void {
    const ticks = advance(this.clock, dt);
    for (let i = 0; i < ticks; i++) {
      for (const m of this.modules) m.step(this.states.get(m.id), this.ctx(), TICK_SECONDS);
    }
  }

  save(): SaveFile {
    const modules: SaveFile['modules'] = {};
    for (const m of this.modules) {
      modules[m.id] = { version: m.version, data: m.serialize(this.states.get(m.id)) };
    }
    return {
      version: SAVE_VERSION,
      common: { ...this.common },
      time: this.clock.time,
      rng: this.rng.getState(),
      modules,
    };
  }

  load(raw: unknown): void {
    const file = migrateSave(raw);
    Object.assign(this.common, file.common);
    this.clock.time = file.time;
    this.clock.pending = 0;
    this.rng.setState(file.rng);
    for (const m of this.modules) {
      const saved = file.modules[m.id];
      // Módulo nuevo en una partida antigua: valor por defecto.
      this.states.set(m.id, saved ? m.load(saved.data, saved.version) : m.init());
    }
  }
}
