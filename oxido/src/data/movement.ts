/**
 * Velocidad de movimiento (#3 del 🐞, decisión de Mikel del 2026-10-23, opción A).
 * Los números están en `movement.json`:
 * - globalSpeed: todo lo que se mueve por el mapa (colonos, enemigos, animales y vehículos) va a
 *   este tanto de la velocidad de antes.
 * - woundedFactor: quien tiene alguna herida camina a este tanto de su velocidad (0,7 = −30 %).
 */
import data from './movement.json';

/** Multiplicador común de la velocidad de colonos, enemigos, animales y vehículos. */
export const GLOBAL_MOVE_SPEED: number = data.globalSpeed;
/** Multiplicador de la velocidad al caminar de quien tiene alguna herida. */
export const WOUNDED_WALK_FACTOR: number = data.woundedFactor;
