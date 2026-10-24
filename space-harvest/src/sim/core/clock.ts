/** Reloj de la simulación: el tiempo entra como parámetro, nunca se lee del sistema. */
export const TICK_SECONDS = 0.25;

export class Clock {
  /** Segundos de juego transcurridos. */
  time = 0;
  private acc = 0;

  /** Avanza `dt` segundos y llama a `onTick(TICK_SECONDS)` por cada paso fijo completo. Devuelve los pasos dados. */
  advance(dt: number, onTick: (dt: number) => void): number {
    this.acc += Math.max(0, dt);
    let steps = 0;
    while (this.acc >= TICK_SECONDS - 1e-9) {
      this.acc -= TICK_SECONDS;
      this.time += TICK_SECONDS;
      onTick(TICK_SECONDS);
      steps++;
    }
    return steps;
  }

  serialize(): { time: number; acc: number } {
    return { time: this.time, acc: this.acc };
  }

  load(data: Partial<{ time: number; acc: number }> | undefined): void {
    this.time = data?.time ?? 0;
    this.acc = data?.acc ?? 0;
  }
}
