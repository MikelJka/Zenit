/** Caducidad de la comida: horas que dura cada alimento desde que se obtiene (`spoilage.json`). */
import data from './spoilage.json';
import { RESOURCES, ResourceId } from './resources';

const HOURS_PER_DAY = 24;

export const SHELF_LIFE_HOURS: Partial<Record<ResourceId, number>> = Object.fromEntries(
  Object.entries(data.days)
    .filter(([r, d]) => (RESOURCES as readonly string[]).includes(r) && d > 0)
    .map(([r, d]) => [r, Math.round(d * HOURS_PER_DAY)]),
) as Partial<Record<ResourceId, number>>;

/** Horas que dura un recurso desde que se obtiene, o undefined si no caduca. */
export function shelfLife(r: ResourceId): number | undefined {
  return SHELF_LIFE_HOURS[r];
}
