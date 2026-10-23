import type { SimModule } from '../../core/types';

/** Núcleo de la estación. Hito 0: solo marca el sitio; el toque «Transmitir» y el panel solar llegan en el Hito 1. */
export const coreModule: SimModule<{ ticks: number }> = {
  id: 'core',
  version: 1,
  init(state) {
    const s = { ticks: 0 };
    state.modules.core = s;
    return s;
  },
  step(state, dt) {
    (state.modules.core as { ticks: number }).ticks += dt;
  },
  serialize(state) {
    return state.modules.core;
  },
  load(state, data) {
    const d = data as { ticks?: number } | undefined;
    state.modules.core = { ticks: typeof d?.ticks === 'number' ? d.ticks : 0 };
  },
};
