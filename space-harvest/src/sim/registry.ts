import type { SimModule } from './core/module';
import { coreModule } from './modules/core/core';

/** Módulos activos, en orden fijo de ejecución. Los nuevos se añaden al final. */
export const modules: readonly SimModule[] = [coreModule as SimModule];
