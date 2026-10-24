/** Reloj de la simulación: el tiempo entra como parámetro, nunca se lee de Date ni de performance. */
export const TICK_MS = 100;
/** Tope de ganancias con el juego cerrado (Pase: 8 h; sin Pase: 1 h). Ver DISENO.md, D8. */
export const OFFLINE_CAP_MS = 60 * 60 * 1000;

export class Clock {
  /** Tiempo de simulación acumulado en ms. */
  time = 0;
  private rest = 0;

  /** Avanza `dtMs` y llama a `tick(TICK_MS)` por cada paso entero. Devuelve los pasos dados. */
  advance(dtMs: number, tick: (stepMs: number) => void): number {
    this.rest += Math.max(0, dtMs);
    let steps = 0;
    while (this.rest >= TICK_MS) {
      this.rest -= TICK_MS;
      this.time += TICK_MS;
      tick(TICK_MS);
      steps++;
    }
    return steps;
  }
}

/** Milisegundos que cuentan como juego cerrado entre dos instantes (con tope). */
export function offlineMs(lastSeenMs: number, nowMs: number, capMs = OFFLINE_CAP_MS): number {
  return Math.min(Math.max(0, nowMs - lastSeenMs), capMs);
}
