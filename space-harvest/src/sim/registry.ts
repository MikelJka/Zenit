import type { SimModule } from './core/module';

/** Módulos activos, en orden de ejecución. Los módulos del diseño se añaden por hitos. */
export const modules: SimModule[] = [];

export function registerModule(mod: SimModule): void {
  if (modules.some((m) => m.id === mod.id)) throw new Error(`Módulo repetido: ${mod.id}`);
  modules.push(mod);
}
