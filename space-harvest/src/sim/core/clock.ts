/** Reloj de la simulación: el tiempo entra como parámetro, nunca se lee del sistema. */
export interface Clock {
  /** Segundos simulados desde el inicio de la partida. */
  time: number;
}

export const STEP_SECONDS = 1;
