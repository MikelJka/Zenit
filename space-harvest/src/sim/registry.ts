import type { SimModule } from './core/types';
import { coreModule } from './modules/core/core';

/** Módulos activos, en el orden fijo en que se ejecutan. Añadir uno al final nunca rompe partidas antiguas. */
export const MODULES: SimModule[] = [coreModule];
