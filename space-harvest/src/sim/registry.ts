import type { SimContext, SimModule } from './core/module';
import { Rng } from './core/rng';

export const SAVE_VERSION = 1;

interface SaveFile {
  version: number;
  rngState: number;
  resources: Record<string, number>;
  modules: Record<string, { version: number; data: unknown }>;
}

/** Registro de módulos activos, en orden de ejecución, con guardado versionado. */
export class Simulation {
  readonly ctx: SimContext;
  private states = new Map<string, unknown>();

  constructor(private modules: SimModule<any>[], seed = 1) {
    this.ctx = { resources: {}, rng: new Rng(seed) };
    for (const m of modules) this.states.set(m.id, m.init(this.ctx));
  }

  stateOf<S>(id: string): S {
    return this.states.get(id) as S;
  }

  step(dt: number): void {
    for (const m of this.modules) m.step(this.states.get(m.id), dt, this.ctx);
  }

  /** Ganancias con el juego cerrado: avanza `seconds` en pasos de `stepSeconds`. */
  fastForward(seconds: number, stepSeconds = 1): void {
    let left = seconds;
    while (left > 1e-9) {
      const dt = Math.min(stepSeconds, left);
      this.step(dt);
      left -= dt;
    }
  }

  save(): string {
    const modules: SaveFile['modules'] = {};
    for (const m of this.modules) {
      modules[m.id] = { version: m.version, data: m.serialize(this.states.get(m.id)) };
    }
    const file: SaveFile = {
      version: SAVE_VERSION,
      rngState: this.ctx.rng.getState(),
      resources: { ...this.ctx.resources },
      modules,
    };
    return JSON.stringify(file);
  }

  /** Un módulo ausente en la partida carga con sus valores por defecto. */
  load(json: string): void {
    const file = JSON.parse(json) as SaveFile;
    this.ctx.resources = { ...file.resources };
    this.ctx.rng.setState(file.rngState);
    for (const m of this.modules) {
      const saved = file.modules?.[m.id];
      this.states.set(m.id, m.load(saved?.data, saved?.version ?? 0, this.ctx));
    }
  }
}
