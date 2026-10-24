import type { GameModule } from './core/module';

/** Módulos activos, en orden de ejecución. */
export class Registry {
  private modules: GameModule<any>[] = [];

  register(mod: GameModule<any>): this {
    if (this.modules.some((m) => m.id === mod.id)) throw new Error(`Módulo duplicado: ${mod.id}`);
    this.modules.push(mod);
    return this;
  }

  all(): readonly GameModule<any>[] {
    return this.modules;
  }
}
