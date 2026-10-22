import type { GameModule } from './module';

/** Módulos activos, en el orden en que se ejecutan. */
export class Registry {
  private modules: GameModule<any>[] = [];

  register(mod: GameModule<any>): void {
    if (this.modules.some((m) => m.id === mod.id)) throw new Error(`Módulo repetido: ${mod.id}`);
    this.modules.push(mod);
  }

  all(): readonly GameModule<any>[] {
    return this.modules;
  }
}
