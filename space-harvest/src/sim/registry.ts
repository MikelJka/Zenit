import type { SimModule } from './core/module';

/** Módulos activos, en orden de ejecución. */
export class ModuleRegistry {
  private modules: SimModule<any>[] = [];

  register(mod: SimModule<any>): void {
    if (this.modules.some((m) => m.id === mod.id)) throw new Error(`Módulo duplicado: ${mod.id}`);
    this.modules.push(mod);
  }

  list(): readonly SimModule<any>[] {
    return this.modules;
  }
}

export const registry = new ModuleRegistry();
