import { Clock } from './clock';
import type { CommonResources, SimContext, SimModule } from './module';
import { Rng } from './rng';
import { type SaveData, parseSave } from './save';

/** Una partida: recursos comunes, reloj, azar con semilla y el estado de cada módulo. */
export class Game {
  readonly clock = new Clock();
  readonly ctx: SimContext;
  readonly states = new Map<string, unknown>();

  constructor(
    readonly modules: readonly SimModule[],
    seed: number,
  ) {
    this.ctx = { resources: { credits: 0, energy: 0 }, rng: new Rng(seed) };
    for (const m of modules) this.states.set(m.id, m.init(this.ctx));
  }

  step(dtMs: number): void {
    this.clock.advance(dtMs, (stepMs) => {
      for (const m of this.modules) m.step(this.states.get(m.id), this.ctx, stepMs);
    });
  }

  /** Ganancias con el juego cerrado: simula el tiempo pasado de golpe (con tope). */
  simulateOffline(elapsedMs: number, capMs: number): number {
    const ms = Math.min(Math.max(elapsedMs, 0), capMs);
    this.step(ms);
    return ms;
  }

  serialize(nowMs: number): SaveData {
    const modules: SaveData['modules'] = {};
    for (const m of this.modules) {
      modules[m.id] = { version: m.version, data: m.serialize(this.states.get(m.id)) };
    }
    return {
      version: 1,
      savedAt: nowMs,
      resources: { ...this.ctx.resources },
      rngState: this.ctx.rng.getState(),
      elapsedMs: this.clock.elapsedMs,
      modules,
    };
  }

  /** Carga una partida; un módulo ausente del guardado arranca con sus valores por defecto. */
  static load(json: string, modules: readonly SimModule[]): Game {
    const save = parseSave(json);
    const game = new Game(modules, 0);
    game.ctx.rng.setState(save.rngState);
    const res: CommonResources = game.ctx.resources;
    res.credits = save.resources.credits;
    res.energy = save.resources.energy;
    game.clock.elapsedMs = save.elapsedMs;
    for (const m of modules) {
      const saved = save.modules[m.id];
      game.states.set(m.id, m.load(saved?.data, saved?.version ?? 0, game.ctx));
    }
    return game;
  }
}
