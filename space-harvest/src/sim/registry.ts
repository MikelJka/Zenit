import type { SimModule } from './core/module';

/** Módulos activos, en orden fijo de ejecución (determinista). Se añaden por hito. */
export const MODULES: SimModule<any>[] = [];
