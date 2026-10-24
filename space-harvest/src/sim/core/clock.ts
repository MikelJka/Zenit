/** Reloj de simulación: el tiempo entra como parámetro, nunca se lee del sistema. */
export const STEP_MS = 100;

export class Clock {
  /** Milisegundos de juego acumulados. */
  now = 0;
  private pending = 0;

  /** Avanza `dtMs` y llama a `step` una vez por cada paso fijo completo. */
  advance(dtMs: number, step: (stepMs: number) => void): number {
    this.pending += dtMs;
    let steps = 0;
    while (this.pending >= STEP_MS) {
      this.pending -= STEP_MS;
      this.now += STEP_MS;
      step(STEP_MS);
      steps++;
    }
    return steps;
  }
}
