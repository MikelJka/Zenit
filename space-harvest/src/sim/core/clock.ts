/**
 * Reloj de simulación con paso fijo. El tiempo entra siempre como parámetro
 * (milisegundos), nunca se lee de `Date.now()` aquí dentro.
 */
export const STEP_MS = 100;

export class Clock {
  /** Tiempo simulado total en ms. */
  elapsedMs = 0;
  private pendingMs = 0;

  /** Avanza `dtMs` y llama a `step(STEP_MS)` por cada paso completo; devuelve cuántos pasos hizo. */
  advance(dtMs: number, step: (stepMs: number) => void): number {
    if (dtMs <= 0) return 0;
    this.pendingMs += dtMs;
    let steps = 0;
    while (this.pendingMs >= STEP_MS) {
      this.pendingMs -= STEP_MS;
      this.elapsedMs += STEP_MS;
      step(STEP_MS);
      steps++;
    }
    return steps;
  }
}
