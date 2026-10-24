import type { GameModule } from './core/module';

/** Módulos activos, en orden fijo de ejecución. Cada hito añade el suyo aquí. */
export const modules: GameModule<any>[] = [];
