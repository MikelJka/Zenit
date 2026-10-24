import type { SimModule } from './core/module';
import { coreModule } from './modules/core/core';

/** Módulos activos, en orden de ejecución. */
export const activeModules: SimModule[] = [coreModule as SimModule];
