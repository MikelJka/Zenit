import type { GameModule } from './core/module';

/** Módulos activos, en orden de ejecución. Los módulos nuevos se añaden aquí. */
export const modules: GameModule[] = [];

export function findModule(id: string): GameModule | undefined {
  return modules.find((m) => m.id === id);
}
