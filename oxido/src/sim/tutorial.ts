// Primeros pasos: saber, mirando el estado de la partida, si el jugador ya ha hecho cada paso de la
// guía. La guía no cambia nada de la partida: solo lee. Dónde va la guía y qué enseña lo decide
// `src/data/tutorial.json`.
import { TutorialCheck, TutorialStep } from '../data/tutorial';
import { isWeapon } from '../data/weapons';
import type { World } from './world';

/** El paso ya está hecho en esta partida (algo de lo que pide existe ahora mismo). */
export function tutorialCheckDone(world: World, check: TutorialCheck): boolean {
  if (check.designation && world.designations.list().some((d) => d.job === check.designation)) return true;
  if (check.storageZone && world.zones.all().some((z) => z.furniture === undefined)) return true;
  if (check.growZone && world.farms.all().length > 0) return true;
  if (check.buildings || check.category) {
    for (const s of world.structures.all()) {
      if (check.buildings?.includes(s.def.id)) return true;
      if (check.category && s.def.category === check.category) return true;
    }
  }
  if (check.weaponBill) {
    for (const s of world.structures.all()) {
      if (s.bill && Object.keys(s.bill.recipe.outputs).some(isWeapon)) return true;
    }
  }
  if (check.researching && (world.research.current !== null || world.research.done.length > 0)) return true;
  if (check.drafted && world.colonists.some((c) => c.drafted)) return true;
  if (check.noneDrafted && !world.colonists.some((c) => c.drafted)) return true;
  return false;
}

/**
 * Paso en el que va la guía: desde `from`, se salta los que ya estén hechos (nunca vuelve atrás,
 * aunque luego se quite lo hecho). Devuelve `steps.length` cuando la guía ha terminado.
 */
export function advanceTutorial(world: World, steps: readonly TutorialStep[], from: number): number {
  let i = Math.max(0, from);
  while (i < steps.length && tutorialCheckDone(world, steps[i].check)) i++;
  return i;
}
