import type { GameModule } from './core/module';

/** Módulos activos, en orden fijo de ejecución. Se añaden aquí al crear cada módulo. */
export const modules: GameModule<any>[] = [];
