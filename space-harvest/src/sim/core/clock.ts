/** Reloj de la simulación: el tiempo entra como parámetro, en segundos de juego. */
export const TICK_SECONDS = 0.25;
/** Tope de ganancias con el juego cerrado: 8 h (ver DISENO.md, D8). */
export const MAX_OFFLINE_SECONDS = 8 * 3600;

export class Clock {
  /** Segundos de juego transcurridos. */
  time = 0;
  private pending = 0;

  /** Acumula `dt` y devuelve cuántos pasos fijos hay que ejecutar. */
  advance(dt: number): number {
    this.pending += Math.max(0, dt);
    const steps = Math.floor(this.pending / TICK_SECONDS);
    this.pending -= steps * TICK_SECONDS;
    this.time += steps * TICK_SECONDS;
    return steps;
  }
}

/** Segundos que cuentan como juego cerrado entre dos instantes (ms), con tope. */
export function offlineSeconds(savedAtMs: number, nowMs: number, cap = MAX_OFFLINE_SECONDS): number {
  return Math.min(cap, Math.max(0, (nowMs - savedAtMs) / 1000));
}
