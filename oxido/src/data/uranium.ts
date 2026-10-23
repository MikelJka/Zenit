/**
 * Barriles tóxicos y ☢ uranio (propuesta B, aprobada por Mikel el 2026-10-22). Números en `uranium.json`:
 * - barrel: ☢ que da un barril tóxico al saquearlo y el trabajo que lleva.
 * - irradiated: la casilla saqueada (y las de alrededor, a `radius`) queda con radiación `level`
 *   durante `irradiatedDays` días.
 */
import data from './uranium.json';

export const TOXIC_BARREL = {
  amount: [data.barrel.amount[0], data.barrel.amount[1]] as const,
  work: data.barrel.work,
} as const;

export const BARREL_IRRADIATION = {
  level: data.irradiated.level,
  radius: data.irradiated.radius,
  days: data.irradiated.irradiatedDays,
} as const;

/** Reactor pequeño: al alcanzarle una explosión, irradia sus casillas y las de alrededor (a `radius` de su borde) `days` días. */
export const REACTOR_IRRADIATION = {
  radius: data.reactor.radius,
  days: data.reactor.irradiatedDays,
} as const;
