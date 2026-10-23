import { Rng } from './rng';
import type { GameState } from './types';

export function newState(seed: number): GameState {
  return {
    time: 0,
    rng: new Rng(seed),
    resources: { credits: 0, energy: 0, data: 0 },
    modules: {},
  };
}
