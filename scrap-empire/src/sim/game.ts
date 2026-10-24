/**
 * Simulación de Chatarrero: chatarra → zonas → carretillas → muelle → camiones → dólares.
 * TypeScript puro, sin DOM. El tiempo entra siempre como parámetro (segundos).
 */
import zonesData from '../data/zones.json';
import economyData from '../data/economy.json';
import achievementsData from '../data/achievements.json';

export type TransportId = 'rail' | 'sea';

/** Tren o barco del puerto: se llena despacio con lo de su línea y sale cuando está lleno. */
export interface TransportState {
  units: number;
  value: number;
  level: number;
  /** Segundos hasta que pueda salir otro viaje. */
  cooldown: number;
  sent: number;
  /** Destino elegido y destinos comprados (`routes` de economy.json; `local` es el de siempre y no se compra). */
  route: string;
  routesUnlocked: string[];
  /** Capitán (o jefe de estación): nivel, segundos de trabajo acumulados, espera del anuncio y si el próximo viaje paga ×2. */
  captainLevel: number;
  captainXp: number;
  adCooldown: number;
  doubleNext: boolean;
  /** Nivel del almacén intermedio (capacidad). */
  warehouseLevel: number;
}

/** Pedido especial: entregar `qty` unidades de un producto antes de que se acabe el plazo. */
import { dailyAdd, type DailyState } from './dailyCore';

export interface OrderState {
  zoneId: string;
  qty: number;
  delivered: number;
  left: number;
}

export interface ZoneDef {
  id: string;
  name: string;
  product: string;
  unitValue: number;
  scrapPerUnit: number;
  cycleSeconds: number;
  unlockCost: number;
  upgradeCostScale: number;
  /** Cómo sale lo producido: por el camión de expedición (por defecto), por el tren o por el barco. */
  transport?: TransportId;
  helper: { id: string; name: string; bio: string };
}

export type Economy = typeof economyData;

export const ZONES: readonly ZoneDef[] = zonesData as ZoneDef[];
export const ECONOMY: Economy = economyData;

export const SAVE_VERSION = 1;

/** Viaje de una carretilla: segundos que le faltan para llegar y unidades que lleva. */
export interface Trip {
  left: number;
  load: number;
}

export interface ZoneState {
  unlocked: boolean;
  machines: number;
  speed: number;
  capacity: number;
  machineLevel: number;
  /** Producto terminado esperando a una carretilla. */
  buffer: number;
  /** Nivel del ayudante de la zona (0 al abrirla). */
  helperLevel: number;
  /** Segundos que ha trabajado la zona desde el último nivel desbloqueado del ayudante. */
  helperXp: number;
  /** Carretillas de la línea y nivel de sus tandas (más piezas por viaje). */
  carts: number;
  cartLevel: number;
  /** Carretillas de viaje: segundos que les faltan para llegar al muelle y piezas que llevan. */
  trips: Trip[];
  /** Mayor múltiplo de 5 de nivel de máquina cuyo premio ya se cobró. */
  milestone: number;
}

export interface GameState {
  version: number;
  /** Segundos de juego simulados. */
  time: number;
  dollars: number;
  totalEarned: number;
  /** Chatarra en la pila del desguace. */
  scrap: number;
  scrapTrucks: number;
  dockLevel: number;
  /** Unidades y valor en dólares de lo que espera en el muelle. */
  dockUnits: number;
  dockValue: number;
  /** Unidades de cada producto (por id de zona) que esperan en el muelle; suman `dockUnits`. */
  dockByZone: Record<string, number>;
  /** Segundos que faltan para que llegue el siguiente camión de expedición. */
  truckCooldown: number;
  zones: Record<string, ZoneState>;
  /** Pase de chatarrero comprado: sin anuncios y tope de ganancias fuera más alto. */
  hasPass: boolean;
  /** Segundos que le quedan al empujón ×2 y a la espera para el siguiente. */
  boostSeconds: number;
  boostCooldown: number;
  /** Segundos hasta que llegue el camión dorado y segundos que le quedan a la vista. */
  goldenTimer: number;
  goldenVisible: number;
  /** Último día de la racha cobrado (1-7, 0 sin racha) y número del día en que se cobró (-1 nunca). */
  streakDay: number;
  lastClaimDay: number;
  /** Ids de los logros conseguidos (`src/data/achievements.json`). */
  achievements: string[];
  /** Camiones de expedición que han salido (incluye los dorados) y mejor día de racha alcanzado. */
  trucksSent: number;
  /** Tren y barco del puerto. */
  transports: Record<TransportId, TransportState>;
  /** Pedido especial en marcha (o null), segundos hasta el siguiente y pedidos cumplidos. */
  order: OrderState | null;
  orderTimer: number;
  ordersDone: number;
  bestStreak: number;
  /** Objetivos diarios (null hasta el primer sorteo) y camión dorado gratis pendiente de tocar. */
  daily: DailyState | null;
  freeGolden: boolean;
  /** Prestigio: Tornillos de oro (para siempre), dinero ganado en esta partida (desde el último reinicio) y reinicios hechos. */
  goldScrews: number;
  runEarned: number;
  prestiges: number;
}

function newTransport(): TransportState {
  return { units: 0, value: 0, level: 0, cooldown: 0, sent: 0, route: 'local', routesUnlocked: [], captainLevel: 0, captainXp: 0, adCooldown: 0, doubleNext: false, warehouseLevel: 0 };
}

export function newGame(): GameState {
  const zones: Record<string, ZoneState> = {};
  for (const z of ZONES) {
    zones[z.id] = {
      unlocked: z.unlockCost === 0,
      machines: z.unlockCost === 0 ? 1 : 0,
      speed: 0,
      capacity: 0,
      machineLevel: 0,
      buffer: 0,
      helperLevel: 0,
      helperXp: 0,
      carts: ECONOMY.carts.start,
      cartLevel: 0,
      trips: [],
      milestone: 0,
    };
  }
  return {
    version: SAVE_VERSION,
    time: 0,
    dollars: 0,
    totalEarned: 0,
    scrap: 0,
    scrapTrucks: 0,
    dockLevel: 0,
    dockUnits: 0,
    dockValue: 0,
    dockByZone: {},
    truckCooldown: 0,
    zones,
    hasPass: false,
    boostSeconds: 0,
    boostCooldown: 0,
    goldenTimer: ECONOMY.goldenTruck.everySeconds,
    goldenVisible: 0,
    streakDay: 0,
    lastClaimDay: -1,
    achievements: [],
    trucksSent: 0,
    transports: { rail: newTransport(), sea: newTransport() },
    order: null,
    orderTimer: ECONOMY.orders.everySeconds,
    ordersDone: 0,
    bestStreak: 0,
    daily: null,
    freeGolden: false,
    goldScrews: 0,
    runEarned: 0,
    prestiges: 0,
  };
}

/** Zonas ordenadas por dólares por unidad de chatarra: la chatarra y las carretillas van primero a la que más paga. */
const ZONES_BY_PROFIT = [...ZONES].sort((a, b) => b.unitValue / b.scrapPerUnit - a.unitValue / a.scrapPerUnit);

export function zoneCapacity(zone: ZoneState): number {
  const c = ECONOMY.zoneUpgrades.capacity;
  return Math.max(c.startCapacity + zone.capacity * c.effectPerLevel, cartBatch(zone));
}

/** Piezas que lleva cada carretilla por viaje: crece con su nivel (el palé siempre es al menos tan grande como una tanda). */
export function cartBatch(zone: ZoneState): number {
  const c = ECONOMY.carts;
  return c.batch + zone.cartLevel * c.batchPerLevel;
}

/** Piezas por segundo que las carretillas de la línea pueden llevar al muelle. */
export function cartThroughput(zone: ZoneState): number {
  return (zone.carts * cartBatch(zone)) / ECONOMY.carts.tripSeconds;
}

/** Multiplicador del valor de lo producido por el nivel del ayudante. */
export function helperValueMultiplier(zone: ZoneState): number {
  return 1 + zone.helperLevel * ECONOMY.helpers.valuePerLevel;
}

/** Valor en dólares de cada unidad que sale de la zona (con el ayudante y, si se pasa, la bonificación del prestigio). */
export function unitValue(def: ZoneDef, zone: ZoneState, bonus = 1): number {
  return def.unitValue * helperValueMultiplier(zone) * bonus;
}

/** Bonificación permanente del prestigio: +5 % a lo producido por cada Tornillo de oro. */
export function prestigeMultiplier(state: GameState): number {
  return 1 + state.goldScrews * ECONOMY.prestige.bonusPerScrew;
}

/** Suma dinero ganado: a la cartera, al total de siempre (ranking y logros) y al de esta partida (prestigio). */
export function earn(state: GameState, value: number): void {
  state.dollars += value;
  state.totalEarned += value;
  state.runEarned += value;
}

/** Niveles del ayudante que la experiencia ya ha desbloqueado y que se pueden pagar. */
export function helperLevelsReady(zone: ZoneState): number {
  const h = ECONOMY.helpers;
  return Math.min(Math.floor(zone.helperXp / h.secondsPerLevel), h.maxLevel - zone.helperLevel);
}

/** Unidades de producto por segundo de una zona. */
export function zoneRate(def: ZoneDef, zone: ZoneState): number {
  if (!zone.unlocked) return 0;
  const u = ECONOMY.zoneUpgrades;
  const speed = (1 + zone.speed * u.speed.effectPerLevel) * (1 + zone.helperLevel * ECONOMY.helpers.speedPerLevel);
  const level = Math.pow(u.machineLevel.outputMultiplierPerLevel, zone.machineLevel);
  return (zone.machines * speed * level) / def.cycleSeconds;
}

export type ZoneStatus = 'locked' | 'working' | 'starved' | 'full';

/** Qué le pasa a una línea: trabaja, no tiene chatarra que aplastar o tiene el palé lleno (esperando carretillas). */
export function zoneStatus(state: GameState, def: ZoneDef): ZoneStatus {
  const zone = state.zones[def.id];
  if (!zone.unlocked) return 'locked';
  if (zone.buffer >= zoneCapacity(zone) - 0.01) return 'full';
  if (state.scrap < def.scrapPerUnit) return 'starved';
  return 'working';
}

/** Dónde se atasca la fábrica: falta chatarra, los palés están llenos (faltan carretillas) o fluye bien. */
export function bottleneck(state: GameState): 'scrap' | 'carts' | 'none' {
  const open = ZONES.filter((d) => state.zones[d.id].unlocked);
  if (open.some((d) => zoneStatus(state, d) === 'starved')) return 'scrap';
  if (open.some((d) => zoneStatus(state, d) === 'full')) return 'carts';
  return 'none';
}

/** Chatarra por segundo que las máquinas podrían aplastar si no faltara. */
export function scrapDemand(state: GameState): number {
  return ZONES.reduce((sum, d) => sum + zoneRate(d, state.zones[d.id]) * d.scrapPerUnit, 0);
}

export function scrapPerSecond(state: GameState): number {
  return state.scrapTrucks * ECONOMY.scrapTrucks.scrapPerSecond;
}

export function dockLoad(state: GameState): number {
  return ECONOMY.dock.baseLoad + state.dockLevel * ECONOMY.dock.loadPerLevel;
}

export function transportLoad(id: TransportId, state: GameState): number {
  const c = ECONOMY.transports[id];
  return c.baseLoad + state.transports[id].level * c.loadPerLevel;
}

export interface RouteDef {
  id: string;
  /** Multiplicador del tiempo de viaje y de la paga respecto al transporte; `unlockMult` = veces el valor de un cargamento. */
  wait: number;
  pay: number;
  unlockMult: number;
}
export const ROUTES: readonly RouteDef[] = ECONOMY.routes;

/** Destino con el que viaja ahora el tren o el barco. */
export function routeOf(state: GameState, id: TransportId): RouteDef {
  return ROUTES.find((r) => r.id === state.transports[id].route) ?? ROUTES[0];
}

/** Valor de un cargamento completo (lo que paga un viaje al destino local). */
export function cargoValue(state: GameState, id: TransportId): number {
  const def = ZONES.find((z) => z.transport === id)!;
  return transportLoad(id, state) * unitValue(def, state.zones[def.id]) * ECONOMY.transports[id].payMultiplier;
}

/** Precio de comprar un destino: `unlockMult` cargamentos. */
export function routeCost(state: GameState, id: TransportId, route: RouteDef): number {
  return route.unlockMult * cargoValue(state, id);
}

/** Elige el destino del tren o el barco (solo uno ya comprado). */
export function setRoute(state: GameState, id: TransportId, routeId: string): boolean {
  const out = state.transports[id];
  if (routeId !== 'local' && !out.routesUnlocked.includes(routeId)) return false;
  if (!ROUTES.some((r) => r.id === routeId)) return false;
  out.route = routeId;
  return true;
}

/** Almacén del tren o el barco: lo que llevan las carretillas espera ahí hasta que sale el viaje. Siempre cabe al menos el doble de un cargamento. */
export function warehouseCapacity(state: GameState, id: TransportId): number {
  const w = ECONOMY.warehouse;
  return Math.max(w.baseCapacity + state.transports[id].warehouseLevel * w.capacityPerLevel, 2 * transportLoad(id, state));
}
/** Bonificación al salir un viaje: +5 % por cada 25 % del almacén lleno (máx. +20 %). */
export function warehouseBonus(state: GameState, id: TransportId): number {
  const w = ECONOMY.warehouse;
  const fill = Math.min(1, state.transports[id].units / warehouseCapacity(state, id));
  return 1 + w.bonusPerStep * Math.min(w.maxSteps, Math.floor(fill / w.stepFill + 1e-9));
}

/**
 * Tope de piezas de un producto esperando en su huella del muelle: al llegar, las carretillas de esa línea no pueden descargar,
 * el palé se llena y la línea para hasta que el camión se lleve producto. Siempre cabe al menos el doble de una tanda.
 */
export function dockProductCap(state: GameState, def: ZoneDef): number {
  return Math.max(ECONOMY.dock.productCap, 2 * cartBatch(state.zones[def.id]));
}

/** Paga ×(1 + nivel·10 %) y viaje −3 % por nivel del capitán. */
export function captainPay(state: GameState, id: TransportId): number {
  return 1 + state.transports[id].captainLevel * ECONOMY.captain.payPerLevel;
}
export function captainTrip(state: GameState, id: TransportId): number {
  return Math.max(0.25, 1 - state.transports[id].captainLevel * ECONOMY.captain.tripPerLevel);
}
export function captainLevelsReady(state: GameState, id: TransportId): number {
  const c = ECONOMY.captain;
  const out = state.transports[id];
  return Math.min(Math.floor(out.captainXp / c.secondsPerLevel), c.maxLevel - out.captainLevel);
}
/** Segundos que dura un viaje completo del tren o el barco (destino y capitán incluidos). */
export function tripSeconds(state: GameState, id: TransportId): number {
  return ECONOMY.transports[id].returnSeconds * routeOf(state, id).wait * captainTrip(state, id);
}

/** Anuncio del tren o el barco: «viaje ya» (sale en cuanto esté lleno) o «×2 cargamento» (el próximo viaje paga el doble). Espera larga entre usos; con el Pase no hay espera. */
export function useTransportAd(state: GameState, id: TransportId, kind: 'now' | 'double'): boolean {
  const out = state.transports[id];
  if (out.adCooldown > 0) return false;
  if (kind === 'now') {
    if (out.cooldown <= 0) return false;
    out.cooldown = 0;
  } else {
    if (out.doubleNext) return false;
    out.doubleNext = true;
  }
  out.adCooldown = state.hasPass ? 0 : ECONOMY.captain.adCooldownSeconds;
  return true;
}

/** Cuántas unidades de la zona caben en un viaje, por segundo, hacia su destino: camión de expedición, tren o barco. */
function outletCarry(state: GameState, def: ZoneDef): number {
  if (def.transport) return transportLoad(def.transport, state) / tripSeconds(state, def.transport);
  return dockLoad(state) / ECONOMY.dock.returnSeconds;
}

/** El jugador toca la pila de chatarra. */
export function tap(state: GameState): void {
  state.scrap += ECONOMY.tap.scrap;
  dailyAdd(state.daily, 'taps', 1);
}

/** Dólares por segundo a ritmo estable: la chatarra va a la zona que más paga, limitada por carretillas y muelle. Sin empujón. */
export function incomePerSecond(state: GameState, tapsPerSecond = 0): number {
  let scrap = scrapPerSecond(state) + tapsPerSecond * ECONOMY.tap.scrap;
  let carry = dockLoad(state) / ECONOMY.dock.returnSeconds;
  let income = 0;
  for (const def of ZONES_BY_PROFIT) {
    const own = def.transport ? outletCarry(state, def) : carry;
    const units = Math.min(zoneRate(def, state.zones[def.id]), scrap / def.scrapPerUnit, own, cartThroughput(state.zones[def.id]));
    scrap -= units * def.scrapPerUnit;
    if (!def.transport) carry -= units;
    income += units * unitValue(def, state.zones[def.id], prestigeMultiplier(state)) * (def.transport ? ECONOMY.transports[def.transport].payMultiplier * routeOf(state, def.transport).pay * captainPay(state, def.transport) : 1);
  }
  return income;
}

/** Tope de lo ganado con el juego cerrado (más alto con el pase). */
export function offlineCapSeconds(state: GameState): number {
  return state.hasPass ? ECONOMY.pass.offlineCapSeconds : ECONOMY.offlineCapSeconds;
}

/** Se puede activar el empujón ×2 (tras ver el anuncio, o directamente con el pase). */
export function canBoost(state: GameState): boolean {
  return state.boostSeconds === 0 && state.boostCooldown === 0;
}

export function activateBoost(state: GameState): boolean {
  if (!canBoost(state)) return false;
  state.boostSeconds = ECONOMY.boost.seconds;
  return true;
}

/** Cobra el camión dorado si está a la vista: paga ×10 lo que hay en el muelle y lo vacía. Devuelve lo cobrado. */
export function claimGoldenTruck(state: GameState): number {
  if (state.goldenVisible === 0) return 0;
  const value = state.dockValue * ECONOMY.goldenTruck.dockMultiplier;
  earn(state, value);
  state.dockUnits = 0;
  state.dockValue = 0;
  state.dockByZone = {};
  state.goldenVisible = 0;
  state.freeGolden = false;
  state.trucksSent += 1;
  dailyAdd(state.daily, 'trucks', 1);
  return value;
}

/** Hace aparecer un camión dorado que se cobra sin anuncio (premio de los objetivos diarios). */
export function claimGoldenTruckFree(state: GameState): void {
  state.goldenVisible = ECONOMY.dailyGoals.freeGoldenSeconds;
  state.freeGolden = true;
}

/** Día de la racha que se cobraría hoy (`today` = número de día local), o 0 si ya se cobró hoy. Si se falta un día, vuelve al 1. */
export function streakDayFor(state: GameState, today: number): number {
  if (state.lastClaimDay === today) return 0;
  const days = ECONOMY.dailyStreak.rewardMinutes.length;
  return state.lastClaimDay === today - 1 ? (state.streakDay % days) + 1 : 1;
}

/** Dólares del premio diario de hoy: minutos de producción según el día de la racha. */
export function dailyReward(state: GameState, today: number): number {
  const day = streakDayFor(state, today);
  if (day === 0) return 0;
  return ECONOMY.dailyStreak.rewardMinutes[day - 1] * 60 * incomePerSecond(state);
}

export function claimDaily(state: GameState, today: number): number {
  const day = streakDayFor(state, today);
  if (day === 0) return 0;
  const value = dailyReward(state, today);
  // Sin producción todavía (al empezar) el premio sería 0: no se gasta el día de la racha.
  if (value <= 0) return 0;
  earn(state, value);
  state.streakDay = day;
  state.bestStreak = Math.max(state.bestStreak, day);
  state.lastClaimDay = today;
  return value;
}

function step(state: GameState, dt: number): void {
  state.time += dt;
  if (state.boostSeconds > 0) {
    state.boostSeconds = Math.max(0, state.boostSeconds - dt);
    if (state.boostSeconds === 0) state.boostCooldown = ECONOMY.boost.cooldownSeconds;
  } else {
    state.boostCooldown = Math.max(0, state.boostCooldown - dt);
  }
  state.goldenVisible = Math.max(0, state.goldenVisible - dt);
  if (state.goldenVisible === 0) state.freeGolden = false;
  state.goldenTimer -= dt;
  if (state.goldenTimer <= 0) {
    state.goldenTimer += ECONOMY.goldenTruck.everySeconds;
    state.goldenVisible = ECONOMY.goldenTruck.visibleSeconds;
  }
  state.scrap += scrapPerSecond(state) * dt;

  for (const def of ZONES_BY_PROFIT) {
    const zone = state.zones[def.id];
    if (!zone.unlocked) continue;
    if (state.daily && zoneStatus(state, def) === 'working') dailyAdd(state.daily, 'working', dt, def.id);
    const space = Math.max(0, zoneCapacity(zone) - zone.buffer);
    const units = Math.min(zoneRate(def, zone) * dt, space, state.scrap / def.scrapPerUnit);
    if (units <= 0) continue;
    // El ayudante gana experiencia mientras su zona trabaja (hasta el nivel máximo).
    const h = ECONOMY.helpers;
    zone.helperXp = Math.min(zone.helperXp + dt, (h.maxLevel - zone.helperLevel) * h.secondsPerLevel);
    state.scrap -= units * def.scrapPerUnit;
    zone.buffer += units;
  }

  // Carretillas: cada una espera a tener una tanda completa en el palé, hace el viaje y solo al llegar suma al muelle.
  for (const def of ZONES_BY_PROFIT) {
    const zone = state.zones[def.id];
    if (!zone.unlocked) continue;
    for (const trip of zone.trips) trip.left = Math.max(0, trip.left - dt);
    const stuck = new Set<Trip>();
    for (const trip of zone.trips.filter((x) => x.left <= 0)) {
      if (def.transport) {
        const out = state.transports[def.transport];
        // Si el almacén está lleno, la carretilla espera con su tanda hasta que salga un viaje.
        if (out.units + trip.load > warehouseCapacity(state, def.transport) + 1e-9) {
          stuck.add(trip);
          continue;
        }
        out.units += trip.load;
        out.value += trip.load * unitValue(def, zone, prestigeMultiplier(state));
      } else {
        // Si la huella del producto está llena, la carretilla espera con su tanda y la línea acaba parando.
        if ((state.dockByZone[def.id] ?? 0) + trip.load > dockProductCap(state, def) + 1e-9) {
          stuck.add(trip);
          continue;
        }
        state.dockUnits += trip.load;
        state.dockValue += trip.load * unitValue(def, zone, prestigeMultiplier(state));
        state.dockByZone[def.id] = (state.dockByZone[def.id] ?? 0) + trip.load;
      }
      if (state.order?.zoneId === def.id) state.order.delivered += trip.load;
      dailyAdd(state.daily, 'units', trip.load, def.id);
    }
    zone.trips = zone.trips.filter((x) => x.left > 0 || stuck.has(x));
    const batch = cartBatch(zone);
    while (zone.trips.length < zone.carts && zone.buffer >= batch - 1e-9) {
      zone.buffer -= batch;
      zone.trips.push({ left: ECONOMY.carts.tripSeconds, load: batch });
    }
  }

  state.truckCooldown = Math.max(0, state.truckCooldown - dt);
  const load = dockLoad(state);
  if (state.truckCooldown === 0 && state.dockUnits >= load) {
    const value = (state.dockValue * load) / state.dockUnits;
    // El camión se lleva de cada producto la parte que le toca.
    const keep = (state.dockUnits - load) / state.dockUnits;
    for (const id of Object.keys(state.dockByZone)) state.dockByZone[id] *= keep;
    state.dockUnits -= load;
    state.dockValue -= value;
    // El empujón dobla lo que pagan los camiones de expedición.
    const paid = value * (state.boostSeconds > 0 ? ECONOMY.boost.multiplier : 1);
    earn(state, paid);
    state.trucksSent += 1;
    dailyAdd(state.daily, 'trucks', 1);
    state.truckCooldown = ECONOMY.dock.returnSeconds;
  }

  // Tren y barco: salen cuando están llenos y pagan más por viaje que el camión.
  for (const id of ['rail', 'sea'] as const) {
    const out = state.transports[id];
    out.cooldown = Math.max(0, out.cooldown - dt);
    out.adCooldown = Math.max(0, out.adCooldown - dt);
    if (out.units > 0 || out.cooldown > 0) out.captainXp = Math.min(out.captainXp + dt, (ECONOMY.captain.maxLevel - out.captainLevel) * ECONOMY.captain.secondsPerLevel);
    const cargo = transportLoad(id, state);
    if (out.cooldown === 0 && out.units >= cargo) {
      const value = (out.value * cargo) / out.units;
      const bonus = warehouseBonus(state, id);
      out.units -= cargo;
      out.value -= value;
      const paid = value * ECONOMY.transports[id].payMultiplier * routeOf(state, id).pay * captainPay(state, id) * bonus * (out.doubleNext ? 2 : 1) * (state.boostSeconds > 0 ? ECONOMY.boost.multiplier : 1);
      out.doubleNext = false;
      earn(state, paid);
      out.sent += 1;
      out.cooldown = tripSeconds(state, id);
    }
  }

  stepOrders(state, dt);
}

/**
 * Pedidos especiales. Cada `everySeconds` (desde que acaba el anterior) se pide una cantidad de un producto de una línea
 * abierta y trabajando; la cantidad cabe en el plazo con margen (`fillSeconds`), siempre en tandas enteras de las carretillas
 * porque lo entregado cuenta cuando llega la tanda. Cumplirlo paga una bonificación igual al valor de lo pedido; si no, no pasa nada.
 */
function stepOrders(state: GameState, dt: number): void {
  const o = ECONOMY.orders;
  if (state.order) {
    if (state.order.delivered >= state.order.qty) {
      const bonus = orderBonus(state, state.order);
      earn(state, bonus);
      state.ordersDone += 1;
      dailyAdd(state.daily, 'orders', 1);
      state.order = null;
      state.orderTimer = o.everySeconds;
    } else {
      state.order.left -= dt;
      if (state.order.left <= 0) {
        state.order = null;
        state.orderTimer = o.everySeconds;
      }
    }
    return;
  }
  state.orderTimer -= dt;
  if (state.orderTimer > 0) return;
  const candidates = ZONES.map((def) => ({ def, qty: orderQuantity(state, def) })).filter((c) => c.qty > 0);
  if (candidates.length === 0) {
    state.orderTimer = 60; // nada que pedir ahora: se vuelve a mirar en un minuto
    return;
  }
  // Rota entre las líneas posibles según el tiempo de juego (determinista, sin azar).
  const pick = candidates[Math.floor(state.time / o.everySeconds) % candidates.length];
  state.order = { zoneId: pick.def.id, qty: pick.qty, delivered: 0, left: o.windowSeconds };
}

/** Bonificación que paga un pedido al cumplirse. */
export function orderBonus(state: GameState, order: OrderState): number {
  const def = ZONES.find((d) => d.id === order.zoneId)!;
  return order.qty * unitValue(def, state.zones[def.id], prestigeMultiplier(state)) * ECONOMY.orders.bonusMultiplier;
}

/** Cantidad que se podría pedir a una línea: 0 si no está abierta, sin chatarra o con ritmo para llenar al menos una tanda a tiempo. */
export function orderQuantity(state: GameState, def: ZoneDef): number {
  const zone = state.zones[def.id];
  if (!zone.unlocked || zone.carts <= 0 || ['locked', 'starved'].includes(zoneStatus(state, def))) return 0;
  const batch = cartBatch(zone);
  let rate = Math.min(zoneRate(def, zone), cartThroughput(zone));
  if (!def.transport) {
    // Con la huella del muelle llena, lo que sale de cada producto es su parte de lo que se llevan los camiones.
    const lines = ZONES.filter((d) => !d.transport && state.zones[d.id].unlocked && state.zones[d.id].carts > 0).length;
    rate = Math.min(rate, dockLoad(state) / ECONOMY.dock.returnSeconds / Math.max(1, lines));
  }
  return Math.floor((rate * ECONOMY.orders.fillSeconds) / batch) * batch;
}

/** Avanza la simulación `seconds` segundos, en pasos de un segundo como máximo. */
export function advance(state: GameState, seconds: number): void {
  let left = seconds;
  while (left > 0) {
    const dt = Math.min(1, left);
    step(state, dt);
    left -= dt;
  }
}

export type PurchaseKind = 'scrapTruck' | 'carts' | 'cartLevel' | 'dock' | 'transport' | 'unlock' | 'speed' | 'capacity' | 'machines' | 'machineLevel' | 'helper' | 'route' | 'captain' | 'warehouse';

export interface Purchase {
  /** Identificador estable, p. ej. «cart» o «speed:crusher». */
  id: string;
  kind: PurchaseKind;
  zoneId?: string;
  cost: number;
}

function growthCost(base: number, count: number, growth = ECONOMY.costGrowth): number {
  return base * Math.pow(growth, count);
}

/** Todo lo que se puede comprar ahora (se pueda pagar o no). */
export function purchases(state: GameState): Purchase[] {
  const list: Purchase[] = [
    { id: 'scrapTruck', kind: 'scrapTruck', cost: growthCost(ECONOMY.scrapTrucks.baseCost, state.scrapTrucks) },
    { id: 'dock', kind: 'dock', cost: growthCost(ECONOMY.dock.baseCost, state.dockLevel) },
  ];
  const u = ECONOMY.zoneUpgrades;
  let nextLockedShown = false;
  for (const def of ZONES) {
    const zone = state.zones[def.id];
    if (!zone.unlocked) {
      // Solo se ofrece abrir la siguiente zona cerrada.
      if (!nextLockedShown) list.push({ id: `unlock:${def.id}`, kind: 'unlock', zoneId: def.id, cost: def.unlockCost });
      nextLockedShown = true;
      continue;
    }
    const s = def.upgradeCostScale;
    list.push(
      { id: `carts:${def.id}`, kind: 'carts', zoneId: def.id, cost: s * growthCost(ECONOMY.carts.baseCost, zone.carts - ECONOMY.carts.start) },
      { id: `cartLevel:${def.id}`, kind: 'cartLevel', zoneId: def.id, cost: s * growthCost(ECONOMY.carts.baseCost, zone.cartLevel) },
      ...(def.transport
        ? [{ id: `transport:${def.id}`, kind: 'transport' as const, zoneId: def.id, cost: growthCost(ECONOMY.transports[def.transport].baseCost, state.transports[def.transport].level) }]
        : []),
      ...(def.transport
        ? ROUTES.filter((r) => r.id !== 'local' && !state.transports[def.transport!].routesUnlocked.includes(r.id)).map((r) => ({
            id: `route:${def.id}:${r.id}`,
            kind: 'route' as const,
            zoneId: def.id,
            cost: routeCost(state, def.transport!, r),
          }))
        : []),
      { id: `speed:${def.id}`, kind: 'speed', zoneId: def.id, cost: s * growthCost(u.speed.baseCost, zone.speed) },
      { id: `capacity:${def.id}`, kind: 'capacity', zoneId: def.id, cost: s * growthCost(u.capacity.baseCost, zone.capacity) },
      { id: `machines:${def.id}`, kind: 'machines', zoneId: def.id, cost: s * growthCost(u.machines.baseCost, zone.machines - 1) },
      {
        id: `machineLevel:${def.id}`,
        kind: 'machineLevel',
        zoneId: def.id,
        cost: s * growthCost(u.machineLevel.baseCost, zone.machineLevel, u.machineLevel.growth),
      },
    );
    // El siguiente nivel del ayudante solo se ofrece cuando su experiencia lo ha desbloqueado.
    if (def.transport && state.transports[def.transport].warehouseLevel < ECONOMY.warehouse.maxLevel) {
      const w = ECONOMY.warehouse;
      list.push({ id: `warehouse:${def.id}`, kind: 'warehouse', zoneId: def.id, cost: growthCost(w.baseCostFraction * ECONOMY.transports[def.transport].baseCost, state.transports[def.transport].warehouseLevel, w.costGrowth) });
    }
    if (def.transport && captainLevelsReady(state, def.transport) > 0) {
      const c = ECONOMY.captain;
      list.push({ id: `captain:${def.id}`, kind: 'captain', zoneId: def.id, cost: s * growthCost(c.baseCost, state.transports[def.transport].captainLevel, c.costGrowth) });
    }
    if (helperLevelsReady(zone) > 0) {
      const h = ECONOMY.helpers;
      list.push({ id: `helper:${def.id}`, kind: 'helper', zoneId: def.id, cost: s * growthCost(h.baseCost, zone.helperLevel, h.costGrowth) });
    }
  }
  return list;
}

/** Premio por llegar a un múltiplo de 5 de nivel de máquina: 10 minutos de lo que produce la línea. */
export function milestoneReward(def: ZoneDef, zone: ZoneState, bonus = 1): number {
  return 600 * zoneRate(def, zone) * unitValue(def, zone, bonus);
}

export interface AchievementDef {
  id: string;
  name: string;
  kind: 'earned' | 'orders' | 'zones' | 'machineLevel' | 'carts' | 'helperLevel' | 'machines';
  value: number;
}
export const ACHIEVEMENTS: readonly AchievementDef[] = achievementsData as AchievementDef[];

function achievementProgress(state: GameState, kind: AchievementDef['kind']): number {
  const zs = Object.values(state.zones);
  switch (kind) {
    case 'earned':
      return state.totalEarned;
    case 'orders':
      return state.ordersDone;
    case 'zones':
      return zs.filter((z) => z.unlocked).length;
    case 'machineLevel':
      return Math.max(...zs.map((z) => z.machineLevel));
    case 'carts':
      return zs.reduce((n, z) => n + (z.unlocked ? z.carts : 0), 0);
    case 'helperLevel':
      return Math.max(...zs.map((z) => z.helperLevel));
    case 'machines':
      return Math.max(...zs.map((z) => z.machines));
  }
}

/** Marca los logros recién conseguidos y los devuelve (para avisar al jugador). */
export function checkAchievements(state: GameState): AchievementDef[] {
  const got = ACHIEVEMENTS.filter((a) => !state.achievements.includes(a.id) && achievementProgress(state, a.kind) >= a.value);
  for (const a of got) state.achievements.push(a.id);
  return got;
}

export type Goal = { kind: 'unlock'; zoneId: string; cost: number } | { kind: 'machineLevel'; zoneId: string; level: number; cost: number } | { kind: 'done' };

/** Objetivo a la vista: abrir la siguiente zona o, con todas abiertas, el siguiente múltiplo de 5 de máquina más cercano. */
export function currentGoal(state: GameState): Goal {
  const next = ZONES.find((d) => !state.zones[d.id].unlocked);
  if (next) return { kind: 'unlock', zoneId: next.id, cost: next.unlockCost };
  const p = purchases(state)
    .filter((x) => x.kind === 'machineLevel')
    .sort((a, b) => a.cost - b.cost)[0];
  if (!p) return { kind: 'done' };
  const zone = state.zones[p.zoneId!];
  return { kind: 'machineLevel', zoneId: p.zoneId!, level: (Math.floor(zone.machineLevel / 5) + 1) * 5, cost: p.cost };
}

/** Compra algo si hay dólares. Devuelve si se ha comprado. */
export function buy(state: GameState, id: string): boolean {
  const p = purchases(state).find((x) => x.id === id);
  if (!p || p.cost > state.dollars) return false;
  state.dollars -= p.cost;
  dailyAdd(state.daily, 'buys', 1);
  const zone = p.zoneId ? state.zones[p.zoneId] : undefined;
  switch (p.kind) {
    case 'scrapTruck':
      state.scrapTrucks++;
      break;
    case 'dock':
      state.dockLevel++;
      break;
    case 'transport':
      state.transports[ZONES.find((d) => d.id === p.zoneId)!.transport!].level++;
      break;
    case 'warehouse':
      state.transports[ZONES.find((d) => d.id === p.zoneId)!.transport!].warehouseLevel++;
      break;
    case 'captain': {
      const out = state.transports[ZONES.find((d) => d.id === p.zoneId)!.transport!];
      out.captainLevel++;
      out.captainXp -= ECONOMY.captain.secondsPerLevel;
      break;
    }
    case 'route': {
      const id = ZONES.find((d) => d.id === p.zoneId)!.transport!;
      const routeId = p.id.split(':')[2];
      state.transports[id].routesUnlocked.push(routeId);
      state.transports[id].route = routeId;
      break;
    }
    case 'unlock':
      zone!.unlocked = true;
      zone!.machines = 1;
      break;
    case 'speed':
    case 'carts':
    case 'cartLevel':
    case 'capacity':
    case 'machines':
      zone![p.kind]++;
      break;
    case 'machineLevel': {
      zone!.machineLevel++;
      // Hito cada 5 niveles de máquina: premio único de unos minutos de producción de la línea.
      if (zone!.machineLevel % 5 === 0 && zone!.machineLevel > zone!.milestone) {
        zone!.milestone = zone!.machineLevel;
        const reward = milestoneReward(ZONES.find((d) => d.id === p.zoneId)!, zone!, prestigeMultiplier(state));
        earn(state, reward);
      }
      break;
    }
    case 'helper':
      zone!.helperLevel++;
      zone!.helperXp -= ECONOMY.helpers.secondsPerLevel;
      break;
  }
  return true;
}

/** Partida guardada: JSON con versión. Lo que falte en partidas antiguas toma el valor de una partida nueva. */
export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

export function load(json: string): GameState {
  const data = JSON.parse(json) as Partial<GameState>;
  const base = newGame();
  const zones = { ...base.zones };
  for (const id of Object.keys(zones)) zones[id] = { ...zones[id], ...(data.zones?.[id] ?? {}) };
  // Partidas antiguas: las carretillas eran comunes; se reparten entre las líneas abiertas.
  const old = (data as { carts?: number }).carts;
  if (typeof old === 'number') {
    const open = Object.values(zones).filter((z) => z.unlocked && data.zones && z.carts === ECONOMY.carts.start);
    for (const z of open) z.carts = Math.max(1, Math.round(old / open.length));
  }
  for (const z of Object.values(zones)) z.trips = (z.trips ?? []).map((x) => ({ ...x }));
  const transports = {
    rail: { ...base.transports.rail, ...(data.transports?.rail ?? {}) },
    sea: { ...base.transports.sea, ...(data.transports?.sea ?? {}) },
  };
  // Un pedido guardado de una zona que ya no existe, o con datos raros, se descarta.
  const o = data.order;
  const order = o && ZONES.some((d) => d.id === o.zoneId) && Number.isFinite(o.qty) && o.qty > 0 ? { zoneId: o.zoneId, qty: o.qty, delivered: Number(o.delivered) || 0, left: Number(o.left) || 0 } : null;
  // Partidas de antes del prestigio: todo lo ganado cuenta como ganado en esta partida.
  const runEarned = typeof data.runEarned === 'number' ? data.runEarned : (data.totalEarned ?? 0);
  return { ...base, ...data, runEarned, transports, order, dockByZone: { ...(data.dockByZone ?? {}) }, version: SAVE_VERSION, zones };
}

/** Zona que hay que abrir para poder reiniciar con prestigio. */
export function prestigeUnlocked(state: GameState): boolean {
  return state.zones[ECONOMY.prestige.unlockZone]?.unlocked ?? false;
}

/** Tornillos de oro que daría reiniciar ahora: √(dinero ganado en la partida / 1 000 000 000), redondeado hacia abajo. */
export function prestigeReward(state: GameState): number {
  return Math.floor(Math.sqrt(Math.max(0, state.runEarned) / ECONOMY.prestige.screwDivisor) + 1e-12);
}

/** Se puede reiniciar: zona 8 abierta y al menos un Tornillo de oro que ganar. */
export function canPrestige(state: GameState): boolean {
  return prestigeUnlocked(state) && prestigeReward(state) >= 1;
}

/**
 * Reinicio con prestigio (Parte 28: PA1 PB1 PC3 PD2). Devuelve una partida nueva que conserva el Pase, la racha, los logros,
 * el total ganado de siempre (ranking), los destinos comprados del tren y el barco y los Tornillos de oro (más los ganados);
 * todo lo demás vuelve a cero. Se mantienen también el tiempo de juego y los objetivos del día (no son avance de la fábrica).
 * Si no se puede reiniciar, devuelve null.
 */
export function prestige(state: GameState): GameState | null {
  if (!canPrestige(state)) return null;
  const next = newGame();
  next.goldScrews = state.goldScrews + prestigeReward(state);
  next.prestiges = state.prestiges + 1;
  next.time = state.time;
  next.totalEarned = state.totalEarned;
  next.hasPass = state.hasPass;
  next.streakDay = state.streakDay;
  next.lastClaimDay = state.lastClaimDay;
  next.bestStreak = state.bestStreak;
  next.achievements = [...state.achievements];
  next.trucksSent = state.trucksSent;
  next.ordersDone = state.ordersDone;
  next.daily = state.daily ? JSON.parse(JSON.stringify(state.daily)) : null;
  for (const id of ['rail', 'sea'] as const) {
    const old = state.transports[id];
    next.transports[id].routesUnlocked = [...old.routesUnlocked];
    next.transports[id].route = old.routesUnlocked.includes(old.route) ? old.route : 'local';
  }
  return next;
}
