import type { SimModule } from './core/module';
import { core } from './modules/core';

/** Módulos activos, en orden de ejecución. */
export const MODULES: SimModule<any>[] = [core];
