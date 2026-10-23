/**
 * Sueño (#5 del 🐞, decisión de Mikel del 2026-10-23, opción B).
 * Los números están en `sleep.json`:
 * - bedHours / groundHours: horas de sueño para descansar del todo en cama y en el suelo.
 * - window: franja de horas en la que los colonos se acuestan (de `from` a `to`, puede cruzar la medianoche).
 * - nightOwlWindow: la franja de los «Nocturno» (de día).
 * Fuera de su franja, un colono solo se acuesta si está agotado.
 */
import data from './sleep.json';

export interface SleepWindow {
  from: number;
  to: number;
}

export const SLEEP_BED_HOURS: number = data.bedHours;
export const SLEEP_GROUND_HOURS: number = data.groundHours;
export const SLEEP_WINDOW: SleepWindow = data.window;
export const NIGHT_OWL_SLEEP_WINDOW: SleepWindow = data.nightOwlWindow;
