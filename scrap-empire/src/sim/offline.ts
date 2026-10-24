/**
 * Guardado con marca de tiempo y ganancias con el juego cerrado.
 * El reloj entra como parámetro (milisegundos) para poder probarlo.
 */
import { ECONOMY, advance, offlineCapSeconds, load, newGame, serialize, type GameState } from './game';

export interface OfflineResult {
  state: GameState;
  /** Segundos realmente simulados (con el tope aplicado). */
  simulatedSeconds: number;
  /** Segundos que pasaron de verdad con el juego cerrado. */
  awaySeconds: number;
  /** Dólares ganados mientras estaba cerrado. */
  dollarsEarned: number;
  /** Segundos que se perdieron por pasar del tope y que un anuncio puede recuperar (hasta el tope del Pase). */
  lostSeconds: number;
  /** Lo que se habría ganado en esos segundos (aproximado: se calcula con la partida al volver). */
  lostDollars: number;
}

const NONE = { simulatedSeconds: 0, awaySeconds: 0, dollarsEarned: 0, lostSeconds: 0, lostDollars: 0 };

/** Guarda la partida junto con el instante en que se guardó. */
export function pack(state: GameState, nowMs: number): string {
  return JSON.stringify({ savedAt: nowMs, state: JSON.parse(serialize(state)) });
}

/** Lee una partida guardada y simula el tiempo pasado, con el tope de `offlineCapSeconds` (más alto con el pase). Sin datos, partida nueva. */
export function unpack(json: string | null, nowMs: number): OfflineResult {
  if (!json) return { state: newGame(), ...NONE };
  let parsed: { savedAt?: number; state?: unknown };
  try {
    parsed = JSON.parse(json);
  } catch {
    return { state: newGame(), ...NONE };
  }
  const state = load(JSON.stringify(parsed.state ?? {}));
  const savedAt = typeof parsed.savedAt === 'number' ? parsed.savedAt : nowMs;
  const awaySeconds = Math.max(0, (nowMs - savedAt) / 1000);
  const simulatedSeconds = Math.min(awaySeconds, offlineCapSeconds(state));
  const before = state.dollars;
  advance(state, simulatedSeconds);
  const dollarsEarned = state.dollars - before;
  // Lo que un anuncio puede recuperar: el tiempo entre el tope libre y el del Pase.
  const lostSeconds = Math.max(0, Math.min(awaySeconds, ECONOMY.pass.offlineCapSeconds) - simulatedSeconds);
  let lostDollars = 0;
  if (lostSeconds > 0) {
    const copy = load(serialize(state));
    const b = copy.dollars;
    advance(copy, lostSeconds);
    lostDollars = copy.dollars - b;
  }
  return { state, simulatedSeconds, awaySeconds, dollarsEarned, lostSeconds, lostDollars };
}

/** Anuncio «×2»: duplica lo ganado fuera. Devuelve lo que se añade. */
export function doubleOfflineEarnings(state: GameState, dollarsEarned: number): number {
  const extra = Math.max(0, dollarsEarned);
  state.dollars += extra;
  state.totalEarned += extra;
  state.runEarned += extra;
  return extra;
}

/** Anuncio «recuperar»: simula los segundos perdidos por pasar del tope. Devuelve lo que se añade. */
export function recoverLostTime(state: GameState, lostSeconds: number): number {
  const before = state.dollars;
  advance(state, Math.max(0, lostSeconds));
  return state.dollars - before;
}
