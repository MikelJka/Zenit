/**
 * Tutorial guiado (decidido por Mikel el 2026-10-24): 6 pasos cortos que enseñan el bucle básico
 * (tocar la pila, mejorar el puesto, camión de chatarra, carretillas, camión de salida y abrir la zona 2)
 * y un último bocadillo de despedida. Un paso ya hecho se salta solo.
 */
import { ECONOMY, ZONES, purchases, type GameState, type Purchase } from './game';

export const TUTORIAL_STEPS = ['tap', 'upgrade', 'scrapTruck', 'carts', 'dock', 'unlock', 'done'] as const;
export type TutorialStepId = (typeof TUTORIAL_STEPS)[number];
/** Índice que marca el tutorial terminado (o saltado). */
export const TUTORIAL_END = TUTORIAL_STEPS.length;

export interface TutorialStep {
  index: number;
  id: TutorialStepId;
  /** Lo que hay que tocar en el mapa: «pile», el id de una zona, «dock» o «trucks». */
  target: string;
  /** Compra que pide el paso (si pide una). */
  purchase?: Purchase;
}

const first = ZONES[0];
const second = ZONES[1];

/** El paso ya está hecho en esta partida (se mira el estado, no lo que se tocó). */
export function tutorialStepDone(state: GameState, id: TutorialStepId, taps: number): boolean {
  const z = state.zones[first.id];
  switch (id) {
    case 'tap':
      return taps >= ECONOMY.tutorial.taps;
    case 'upgrade':
      return z.speed + z.capacity + z.machineLevel > 0 || z.machines > 1;
    case 'scrapTruck':
      return state.scrapTrucks > 0;
    case 'carts':
      return z.carts > ECONOMY.carts.start || z.cartLevel > 0;
    case 'dock':
      return state.dockLevel > 0;
    case 'unlock':
      return state.zones[second.id].unlocked;
    case 'done':
      return false;
  }
}

function cheapest(list: Purchase[]): Purchase | undefined {
  return [...list].sort((a, b) => a.cost - b.cost)[0];
}

/**
 * Paso del tutorial que toca a partir de `index` (avanza sobre los que ya están hechos), o null si se acabó.
 * El de despedida («done») solo se cierra con su botón: la interfaz pasa entonces `TUTORIAL_END`.
 */
export function tutorialStep(state: GameState, index: number, taps: number): TutorialStep | null {
  let i = Math.max(0, Math.floor(index));
  while (i < TUTORIAL_END && tutorialStepDone(state, TUTORIAL_STEPS[i], taps)) i++;
  if (i >= TUTORIAL_END) return null;
  const id = TUTORIAL_STEPS[i];
  const list = purchases(state);
  const find = (pid: string) => list.find((p) => p.id === pid);
  switch (id) {
    case 'tap':
      return { index: i, id, target: 'pile' };
    case 'upgrade':
      return { index: i, id, target: first.id, purchase: cheapest(list.filter((p) => p.zoneId === first.id && (p.kind === 'speed' || p.kind === 'capacity' || p.kind === 'machines'))) };
    case 'scrapTruck':
      return { index: i, id, target: 'trucks', purchase: find('scrapTruck') };
    case 'carts':
      return { index: i, id, target: first.id, purchase: cheapest(list.filter((p) => p.zoneId === first.id && (p.kind === 'carts' || p.kind === 'cartLevel'))) };
    case 'dock':
      return { index: i, id, target: 'dock', purchase: find('dock') };
    case 'unlock':
      return { index: i, id, target: second.id, purchase: find(`unlock:${second.id}`) };
    default:
      return { index: i, id, target: 'pile' };
  }
}
