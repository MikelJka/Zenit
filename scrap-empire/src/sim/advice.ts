/**
 * Siguiente paso recomendado (decidido por Mikel el 2026-10-24): primero lo que atasca la fábrica
 * (muelle lleno → camión de salida; palé lleno → carretillas de esa línea; falta chatarra → camión de chatarra)
 * y, si no hay atasco, la compra que más dólares por segundo añade por cada dólar.
 */
import { ZONES, buy, cartThroughput, currentGoal, dockProductCap, incomePerSecond, purchases, zoneRate, zoneStatus, type GameState, type Purchase } from './game';

export type StepReason = 'dock' | 'carts' | 'scrap' | 'best' | 'unlock' | 'level';

export interface Step {
  reason: StepReason;
  purchase: Purchase;
  /** Línea afectada por el atasco (si lo hay). */
  zoneId?: string;
}

/** Dólares por segundo que añade la compra por cada dólar que cuesta (a ritmo estable). */
export function purchaseScore(state: GameState, p: Purchase): number {
  const after = structuredClone(state);
  after.dollars = Infinity;
  if (!buy(after, p.id)) return 0;
  return (incomePerSecond(after) - incomePerSecond(state)) / p.cost;
}

export function nextStep(state: GameState): Step | null {
  const list = purchases(state);
  const find = (id: string) => list.find((p) => p.id === id);
  const open = ZONES.filter((d) => state.zones[d.id].unlocked);
  // 1. Muelle lleno: el camión de salida no da abasto (solo las líneas que salen en camión).
  const dockFull = open.find((d) => !d.transport && (state.dockByZone[d.id] ?? 0) >= dockProductCap(state, d) - 1e-9);
  const dock = find('dock');
  if (dockFull && dock) return { reason: 'dock', purchase: dock, zoneId: dockFull.id };
  // 2. Palé lleno y las carretillas no dan abasto: la mejora de carretillas más barata de esa línea.
  const cartsFull = open.find((d) => zoneStatus(state, d) === 'full' && cartThroughput(state.zones[d.id]) <= zoneRate(d, state.zones[d.id]) * 1.01);
  if (cartsFull) {
    const cheapest = [find(`carts:${cartsFull.id}`), find(`cartLevel:${cartsFull.id}`)].filter((p): p is Purchase => !!p).sort((a, b) => a.cost - b.cost)[0];
    if (cheapest) return { reason: 'carts', purchase: cheapest, zoneId: cartsFull.id };
  }
  // 3. Falta chatarra.
  const starved = open.find((d) => zoneStatus(state, d) === 'starved');
  const truck = find('scrapTruck');
  if (starved && truck) return { reason: 'scrap', purchase: truck, zoneId: starved.id };
  // 4. Sin atasco: lo más rentable.
  let best: Purchase | null = null;
  let bestScore = 0;
  for (const p of list) {
    const s = purchaseScore(state, p);
    if (s > bestScore) [best, bestScore] = [p, s];
  }
  if (best) return { reason: best.kind === 'unlock' ? 'unlock' : 'best', purchase: best };
  // 5. Nada mejora el ritmo ahora mismo: el objetivo de siempre (abrir la siguiente zona o el siguiente nivel de máquina).
  const goal = currentGoal(state);
  if (goal.kind === 'unlock') {
    const p = find(`unlock:${goal.zoneId}`);
    if (p) return { reason: 'unlock', purchase: p };
  }
  if (goal.kind === 'machineLevel') {
    const p = find(`machineLevel:${goal.zoneId}`);
    if (p) return { reason: 'level', purchase: p };
  }
  return null;
}

/** Clave estable del paso, para recordar cuál ocultó el jugador con la ✕. */
export function stepKey(step: Step): string {
  return `${step.reason}|${step.purchase.id}`;
}
