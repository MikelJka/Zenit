/** Reloj de pasos fijos: convierte tiempo real en un número entero de pasos de simulación. */
export class Clock {
  private acc = 0;

  constructor(readonly stepSeconds = 0.1) {}

  /** Devuelve cuántos pasos hay que ejecutar para `dt` segundos reales. */
  advance(dt: number): number {
    this.acc += dt;
    const n = Math.floor(this.acc / this.stepSeconds + 1e-9);
    this.acc -= n * this.stepSeconds;
    return n;
  }
}
