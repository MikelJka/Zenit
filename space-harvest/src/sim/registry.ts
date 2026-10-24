import type { SimModule } from './core/module';
import { SAVE_VERSION, type SaveFile } from './core/save';

/** Módulos activos, en orden de ejecución. */
export class Registry {
  private modules: SimModule[] = [];
  private states = new Map<string, unknown>();

  register(mod: SimModule): void {
    if (this.modules.some((m) => m.id === mod.id)) throw new Error(`Módulo repetido: ${mod.id}`);
    this.modules.push(mod);
    this.states.set(mod.id, mod.init());
  }

  ids(): string[] {
    return this.modules.map((m) => m.id);
  }

  state<S>(id: string): S {
    if (!this.states.has(id)) throw new Error(`Módulo desconocido: ${id}`);
    return this.states.get(id) as S;
  }

  step(dt: number): void {
    for (const m of this.modules) m.step(this.states.get(m.id), dt);
  }

  save(now: number): SaveFile {
    const modules: SaveFile['modules'] = {};
    for (const m of this.modules) modules[m.id] = { version: m.version, data: m.serialize(this.states.get(m.id)) };
    return { version: SAVE_VERSION, savedAt: now, modules };
  }

  /** Módulos ausentes en la partida quedan con su valor inicial. */
  load(save: SaveFile): void {
    for (const m of this.modules) {
      const saved = save.modules[m.id];
      if (saved) this.states.set(m.id, m.load(saved.data, saved.version));
    }
  }
}
