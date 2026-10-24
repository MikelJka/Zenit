import type { SimModule } from './core/module';

/** Módulos activos, en orden de ejecución. Se añaden aquí al llegar cada hito. */
export const activeModules: SimModule<any>[] = [];
