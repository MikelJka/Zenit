import type { SimModule } from '../core/module';

export interface CoreState {
  credits: number;
}

/** Módulo de mando de la estación: recursos comunes. Se ampliará en el Hito 1. */
export const core: SimModule<CoreState> = {
  id: 'core',
  version: 1,
  init: () => ({ credits: 0 }),
  step: () => {},
  serialize: (s) => ({ credits: s.credits }),
  load: (data) => {
    const d = (data ?? {}) as Partial<CoreState>;
    return { credits: typeof d.credits === 'number' ? d.credits : 0 };
  },
};
