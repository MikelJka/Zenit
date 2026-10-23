import type { SimModule } from '../../core/module';

/** Módulo de mando de la estación (siempre presente). En el Hito 1 llevará el toque «Transmitir» y el panel solar. */
export interface CoreState {
  taps: number;
}

export const coreModule: SimModule<CoreState> = {
  id: 'core',
  version: 1,
  init(game) {
    game.resources.credits ??= 0;
    return { taps: 0 };
  },
  step() {},
  serialize: (s) => ({ taps: s.taps }),
  load(data) {
    const d = (data ?? {}) as Partial<CoreState>;
    return { taps: Number(d.taps) || 0 };
  },
  purchases: () => [],
};
