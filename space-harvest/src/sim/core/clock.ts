/** Reloj de la simulación: el tiempo entra como parámetro, en segundos. */
export const TICK_SECONDS = 1;

export class Clock {
  /** Segundos de juego transcurridos. */
  time = 0;

  /** Avanza `dt` segundos y devuelve cuántos pasos fijos hay que simular. */
  private pending = 0;

  advance(dt: number): number {
    this.time += dt;
    this.pending += dt;
    const steps = Math.floor(this.pending / TICK_SECONDS);
    this.pending -= steps * TICK_SECONDS;
    return steps;
  }
}
