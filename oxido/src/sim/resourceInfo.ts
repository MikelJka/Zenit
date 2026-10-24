/**
 * Información de un recurso para la ficha que sale al tocarlo en la barra de arriba (Z#22).
 * Todo sale de los datos (`buildings.json`, `recipes.json`, `resources.ts`); no hay textos de reglas nuevos.
 */
import { BUILDINGS } from '../data/buildings';
import { RECIPES } from '../data/recipes';
import { FOOD_RESOURCES, RESOURCE_ICONS, RESOURCE_NAMES } from '../data/resources';
import type { ResourceId } from '../data/resources';

export interface ResourceInfo {
  icon: string;
  name: string;
  /** Se puede comer. */
  edible: boolean;
  /** Nombres de las construcciones que lo piden (sin repetir). */
  builds: string[];
  /** Nombres de las recetas que lo gastan. */
  usedBy: string[];
  /** Nombres de las recetas que lo fabrican. */
  madeBy: string[];
}

const uniq = (xs: string[]) => [...new Set(xs)];

export function resourceInfo(r: ResourceId): ResourceInfo {
  return {
    icon: RESOURCE_ICONS[r],
    name: RESOURCE_NAMES[r],
    edible: FOOD_RESOURCES.includes(r),
    builds: uniq(BUILDINGS.filter((b) => (b.cost[r] ?? 0) > 0).map((b) => b.name)),
    usedBy: uniq(RECIPES.filter((x) => (x.inputs[r] ?? 0) > 0).map((x) => x.name)),
    madeBy: uniq(RECIPES.filter((x) => (x.outputs[r] ?? 0) > 0).map((x) => x.name)),
  };
}

/** Lista corta: los primeros `max` nombres y «y N más». */
export function shortList(names: string[], max = 4): string {
  if (names.length <= max) return names.join(', ');
  return `${names.slice(0, max).join(', ')} y ${names.length - max} más`;
}

/** Texto de la ficha: nombre, cantidad y para qué sirve. */
export function resourceInfoText(r: ResourceId, amount: number): string {
  const i = resourceInfo(r);
  const lines = [`${i.icon} ${i.name}: ${amount} en la colonia`];
  if (i.edible) lines.push('Se come.');
  if (i.builds.length) lines.push(`Para construir: ${shortList(i.builds)}.`);
  if (i.usedBy.length) lines.push(`Se gasta en: ${shortList(i.usedBy)}.`);
  if (i.madeBy.length) lines.push(`Se fabrica: ${shortList(i.madeBy)}.`);
  return lines.join('\n');
}
