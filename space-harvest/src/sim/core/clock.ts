/** Reloj de la simulación: el tiempo entra como parámetro, en segundos. */
export class Clock {
  /** Segundos de juego acumulados. */
  time = 0;

  advance(dt: number): number {
    if (!(dt > 0)) return 0;
    this.time += dt;
    return dt;
  }
}

/** Tope de segundos que se simulan con el juego cerrado (8 h, sin Pase). */
export const OFFLINE_CAP_SECONDS = 8 * 3600;

/** Segundos transcurridos entre dos marcas de tiempo (ms), acotados a [0, cap]. */
export function offlineSeconds(savedAtMs: number, nowMs: number, cap = OFFLINE_CAP_SECONDS): number {
  const s = (nowMs - savedAtMs) / 1000;
  return Math.min(Math.max(s, 0), cap);
}
