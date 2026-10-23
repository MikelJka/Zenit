import type { GameModule } from './module';
import { advance } from '../registry';
import type { GameState } from './state';

/** Tope de ganancias con el juego cerrado: 1 h (8 h con el Pase). */
export const OFFLINE_CAP_SECONDS = 3600;
export const OFFLINE_CAP_PASS_SECONDS = 8 * 3600;

/** Aplica las ganancias de `elapsed` segundos con el juego cerrado y devuelve los segundos simulados. */
export function applyOffline(state: GameState, elapsed: number, active: GameModule[], hasPass = false): number {
  const cap = hasPass ? OFFLINE_CAP_PASS_SECONDS : OFFLINE_CAP_SECONDS;
  const seconds = Math.min(Math.max(0, elapsed), cap);
  advance(state, seconds, active);
  return seconds;
}
