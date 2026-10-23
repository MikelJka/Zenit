/** Reloj de la simulación: paso fijo; el tiempo entra como parámetro (nada de Date.now() aquí). */
export const STEP_SECONDS = 0.25;

export class Clock {
  /** Segundos simulados desde el inicio de la partida. */
  time = 0;
  private pending = 0;

  /** Avanza `dt` segundos y llama a `step` una vez por cada paso fijo completo. Devuelve los pasos dados. */
  advance(dt: number, step: (stepSeconds: number) => void): number {
    this.pending += dt;
    let steps = 0;
    while (this.pending >= STEP_SECONDS) {
      this.pending -= STEP_SECONDS;
      this.time += STEP_SECONDS;
      step(STEP_SECONDS);
      steps++;
    }
    return steps;
  }
}
