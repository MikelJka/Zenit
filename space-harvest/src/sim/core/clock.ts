// Reloj de simulación: el tiempo entra como parámetro, nunca se lee del sistema.
export const TICK_MS = 100;

export class Clock {
  /** Milisegundos simulados desde el inicio de la partida. */
  now = 0;
  private acc = 0;

  /** Avanza `dtMs` y llama a `step(tickMs)` por cada tick completo. */
  advance(dtMs: number, step: (tickMs: number) => void): void {
    this.acc += dtMs;
    while (this.acc >= TICK_MS) {
      this.acc -= TICK_MS;
      this.now += TICK_MS;
      step(TICK_MS);
    }
  }
}
