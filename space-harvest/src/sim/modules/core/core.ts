import type { SimModule } from '../../core/module';

export interface CoreState {
  taps: number;
}

/** Núcleo: de momento solo cuenta toques; el panel solar y «Transmitir» llegan en el Hito 1. */
export const coreModule: SimModule<CoreState> = {
  id: 'core',
  version: 1,
  init: () => ({ taps: 0 }),
  step: () => {},
  serialize: (s) => ({ taps: s.taps }),
  load: (raw) => ({ taps: Number((raw as Partial<CoreState> | null)?.taps ?? 0) }),
  purchases: () => [],
};
