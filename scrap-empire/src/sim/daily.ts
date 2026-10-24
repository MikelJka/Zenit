import { ECONOMY, ZONES, cartBatch, cartThroughput, claimGoldenTruckFree, dockLoad, incomePerSecond, orderQuantity, zoneRate, type GameState, type ZoneDef } from './game';
import type { DailyGoal, DailyKind, DailyState } from './dailyCore';
import { Rng } from './rng';

/** Objetivos diarios: 3 al día (uno fácil, uno medio y uno difícil), de tipos distintos y sorteados con el número del día. */
const KINDS: readonly DailyKind[] = ['trucks', 'units', 'buys', 'orders', 'taps', 'working'];

/** Productos sobre los que se puede pedir «entregar» o «línea trabajando»: líneas abiertas con carretillas. */
function openZones(state: GameState): ZoneDef[] {
  return ZONES.filter((d) => state.zones[d.id].unlocked && state.zones[d.id].carts > 0);
}

/** Unidades por segundo que las líneas de camión pueden llevar al muelle (la menor entre producir y transportar). */
function dockUnitsPerSecond(state: GameState): number {
  return ZONES.filter((d) => !d.transport && state.zones[d.id].unlocked).reduce((n, d) => n + Math.min(zoneRate(d, state.zones[d.id]), cartThroughput(state.zones[d.id])), 0);
}

function feasible(state: GameState, kind: DailyKind, level: number): boolean {
  if (kind === 'orders') return level === 1 && ZONES.some((d) => orderQuantity(state, d) > 0);
  if (kind === 'units' || kind === 'working') return openZones(state).length > 0;
  return true;
}

function makeGoal(state: GameState, kind: DailyKind, level: 1 | 2 | 4, rng: Rng): DailyGoal {
  const c = ECONOMY.dailyGoals;
  const goal: DailyGoal = { kind, target: 1, progress: 0, level, claimed: false, rerolled: false };
  switch (kind) {
    case 'trucks':
      // Un camión sale como mucho cada `returnSeconds`: el objetivo nunca pide más de lo que el muelle puede despachar en la ventana.
      goal.target = Math.max(c.minTrucks, Math.round(Math.min((c.safety * c.windowSeconds * dockUnitsPerSecond(state)) / dockLoad(state), (c.safety * c.windowSeconds) / ECONOMY.dock.returnSeconds))) * level;
      break;
    case 'units': {
      const zones = openZones(state);
      const def = zones[rng.int(0, zones.length - 1)];
      const zone = state.zones[def.id];
      const batch = cartBatch(zone);
      goal.zoneId = def.id;
      goal.target = Math.max(batch, Math.round((c.safety * c.windowSeconds * Math.min(zoneRate(def, zone), cartThroughput(zone))) / batch) * batch) * level;
      break;
    }
    case 'buys':
      goal.target = c.buyBase * level;
      break;
    case 'orders':
      goal.target = 1;
      break;
    case 'taps':
      goal.target = c.tapBase * level;
      break;
    case 'working': {
      const zones = openZones(state);
      goal.zoneId = zones[rng.int(0, zones.length - 1)].id;
      goal.target = c.workingSeconds * level;
      break;
    }
  }
  return goal;
}

/** Elige un tipo posible que no esté en `taken`; si no queda ninguno, repite uno cualquiera posible. */
function pickKind(state: GameState, level: number, taken: DailyKind[], rng: Rng): DailyKind {
  const free = KINDS.filter((k) => !taken.includes(k) && feasible(state, k, level));
  const pool = free.length > 0 ? free : KINDS.filter((k) => feasible(state, k, level));
  return pool[rng.int(0, pool.length - 1)];
}

/** Sortea los objetivos de `today` (número de día local) si aún no están. Devuelve true si ha sorteado. */
export function refreshDaily(state: GameState, today: number): boolean {
  if (state.daily?.day === today) return false;
  const rng = new Rng(today * 7919 + 13);
  const goals: DailyGoal[] = [];
  // El orden de los niveles va de más difícil a más fácil para que el fácil (el único que puede ser un pedido) elija el último.
  for (const level of [...ECONOMY.dailyGoals.levels].reverse() as (1 | 2 | 4)[]) {
    goals.unshift(makeGoal(state, pickKind(state, level, goals.map((g) => g.kind), rng), level, rng));
  }
  state.daily = { day: today, goals, bonusPaid: false } satisfies DailyState;
  return true;
}

export function goalDone(g: DailyGoal): boolean {
  return g.progress >= g.target;
}

/** Cobra un objetivo cumplido: minutos de producción. Al cobrar los tres, llega un camión dorado gratis. Devuelve lo cobrado. */
export function claimGoal(state: GameState, index: number): number {
  const d = state.daily;
  const g = d?.goals[index];
  if (!d || !g || g.claimed || !goalDone(g)) return 0;
  const value = ECONOMY.dailyGoals.rewardMinutes * 60 * incomePerSecond(state);
  g.claimed = true;
  state.dollars += value;
  state.totalEarned += value;
  state.runEarned += value;
  if (!d.bonusPaid && d.goals.every((x) => x.claimed)) {
    d.bonusPaid = true;
    claimGoldenTruckFree(state);
  }
  return value;
}

/** Cambia un objetivo sin cumplir por otro del mismo nivel (una vez por objetivo y día; el anuncio lo pide la interfaz). */
export function rerollGoal(state: GameState, index: number): boolean {
  const d = state.daily;
  const g = d?.goals[index];
  if (!d || !g || g.claimed || g.rerolled || goalDone(g)) return false;
  const rng = new Rng(d.day * 104729 + index * 31 + 7);
  const taken = d.goals.map((x) => x.kind);
  const kind = pickKind(state, g.level, taken, rng);
  const next = makeGoal(state, kind, g.level, rng);
  next.rerolled = true;
  d.goals[index] = next;
  return true;
}
