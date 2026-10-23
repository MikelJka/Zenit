// Objetos en el suelo: montones de recursos, uno por casilla. Lo que hay en el suelo es el
// inventario de la colonia (más adelante se distinguirá lo que está en zonas de almacén).
import { MAX_STACK, RESOURCES, ResourceId } from '../data/resources';
import { shelfLife } from '../data/spoilage';
import { GameMap, inBounds, index, isPassable, isWater, Terrain } from './map';
import { emptyStockpile, Stockpile } from './resources';

/**
 * Lote de comida (caducidad, decisión de Mikel del 2026-10-23): `n` unidades a las que les quedan
 * `h` horas hasta estropearse. Solo cuentan las horas fuera de la nevera y sin frío.
 */
export interface Lot {
  n: number;
  h: number;
}

/** Montón de un recurso sobre una casilla. */
export interface ItemStack {
  resource: ResourceId;
  amount: number;
  /** Solo en la comida que caduca: sus lotes, del que caduca antes al que caduca después. */
  lots?: Lot[];
}

/**
 * Saca `n` unidades de una lista de lotes (del que caduca antes al que caduca después) y la deja con
 * lo que queda. Si la lista no llega a `n`, lo que falta es comida recién obtenida (`fresh` horas).
 */
export function takeLots(lots: Lot[] | undefined, n: number, fresh: number): Lot[] {
  const out: Lot[] = [];
  let left = Math.max(0, Math.floor(n));
  while (left > 0 && lots && lots.length > 0) {
    const l = lots[0];
    const k = Math.min(l.n, left);
    out.push({ n: k, h: l.h });
    l.n -= k;
    left -= k;
    if (l.n <= 0) lots.shift();
  }
  if (left > 0) out.push({ n: left, h: fresh });
  return out;
}

/** Junta lotes en una lista ordenada (los de las mismas horas, en uno). */
export function mergeLots(into: Lot[], add: Lot[]): void {
  for (const a of add) {
    if (a.n <= 0) continue;
    const same = into.find((l) => l.h === a.h);
    if (same) same.n += a.n;
    else into.push({ n: a.n, h: a.h });
  }
  into.sort((a, b) => a.h - b.h);
}

/** Montón con su casilla, para recorrerlos. */
export interface PlacedStack extends ItemStack {
  x: number;
  y: number;
}

/** Hasta qué distancia (en pasos) se buscan casillas libres al soltar recursos. */
export const DROP_RADIUS = 8;

const NEIGHBORS = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;

/** Montones de recursos en el suelo del mapa. Determinista: no usa azar. */
export class GroundItems {
  private stacks = new Map<number, ItemStack>();
  /** Aumenta con cada cambio: el dibujado lo usa para saber cuándo repintar. */
  version = 0;

  /** Cuántos montones normales caben en una casilla (2 o más con una estantería). Lo fija `World`. */
  capacityAt: (x: number, y: number, resource?: ResourceId) => number = () => 1;

  constructor(readonly map: GameMap) {}

  /** Máximo de un recurso en una casilla. */
  maxAt(x: number, y: number, resource: ResourceId): number {
    return MAX_STACK[resource] * this.capacityAt(x, y, resource);
  }

  /** Montón de una casilla, o undefined. */
  at(x: number, y: number): ItemStack | undefined {
    return inBounds(this.map, x, y) ? this.stacks.get(index(this.map, x, y)) : undefined;
  }

  /** Se puede dejar algo en la casilla: se pisa, no es agua y no tiene un objeto que bloquee. */
  canHold(x: number, y: number): boolean {
    if (!isPassable(this.map, x, y)) return false;
    const i = index(this.map, x, y);
    return !isWater(this.map.terrain[i] as Terrain) && !this.map.trench[i];
  }

  /** Cuánto de un recurso cabe todavía en una casilla. */
  room(x: number, y: number, resource: ResourceId): number {
    if (!this.canHold(x, y)) return 0;
    const s = this.at(x, y);
    if (!s) return this.maxAt(x, y, resource);
    return s.resource === resource ? Math.max(0, this.maxAt(x, y, resource) - s.amount) : 0;
  }

  /**
   * Deja en una casilla todo lo que quepa de un recurso (sin buscar otras).
   * Devuelve lo que no ha cabido. En la comida que caduca, `lots` son los lotes de lo que se deja
   * (se van sacando de la lista, del que caduca antes); sin ellos, es comida recién obtenida.
   */
  addAt(x: number, y: number, resource: ResourceId, amount: number, lots?: Lot[]): number {
    const put = Math.min(Math.max(0, Math.floor(amount)), this.room(x, y, resource));
    if (put > 0) {
      const i = index(this.map, x, y);
      const s: ItemStack = this.stacks.get(i) ?? { resource, amount: 0 };
      s.amount += put;
      this.stacks.set(i, s);
      const life = shelfLife(resource);
      if (life !== undefined) {
        // Un montón antiguo sin lotes (no debería pasar) cuenta como recién obtenido.
        if (!s.lots) s.lots = [{ n: s.amount - put, h: life }].filter((l) => l.n > 0);
        mergeLots(s.lots, takeLots(lots, put, life));
      }
      this.version++;
    }
    return amount - put;
  }

  /**
   * Suelta recursos cerca de una casilla: primero completa montones del mismo recurso,
   * después ocupa casillas libres, de la más cercana (a pie) a la más lejana.
   * Solo usa casillas a las que se llega andando desde el origen, hasta `DROP_RADIUS` pasos.
   * Devuelve lo que no ha cabido (normalmente nada).
   */
  drop(x: number, y: number, resource: ResourceId, amount: number, lots?: Lot[]): number {
    let left = Math.max(0, Math.floor(amount));
    if (left === 0) return 0;
    const tiles = this.nearbyTiles(x, y);
    // Primero, los montones del mismo recurso que no están llenos.
    for (const t of tiles) {
      if (left === 0) break;
      const s = this.at(t.x, t.y);
      if (s && s.resource === resource) left = this.addAt(t.x, t.y, resource, left, lots);
    }
    for (const t of tiles) {
      if (left === 0) break;
      if (!this.at(t.x, t.y)) left = this.addAt(t.x, t.y, resource, left, lots);
    }
    return left;
  }

  /** Suelta varios recursos (p. ej. lo obtenido al talar). Devuelve lo que no ha cabido. */
  dropAll(x: number, y: number, gains: Partial<Stockpile>): Partial<Stockpile> {
    const left: Partial<Stockpile> = {};
    for (const r of RESOURCES) {
      const rest = this.drop(x, y, r, gains[r] ?? 0);
      if (rest > 0) left[r] = rest;
    }
    return left;
  }

  /**
   * Coge hasta `amount` unidades del montón de una casilla (en la comida, primero lo que caduca
   * antes). Devuelve lo cogido, con sus lotes si caduca.
   */
  take(x: number, y: number, amount: number): ItemStack | null {
    const s = this.at(x, y);
    if (!s || amount <= 0) return null;
    const got = Math.min(s.amount, Math.floor(amount));
    if (got <= 0) return null;
    s.amount -= got;
    const life = shelfLife(s.resource);
    const lots = life !== undefined ? takeLots(s.lots, got, life) : undefined;
    if (s.amount === 0) this.stacks.delete(index(this.map, x, y));
    this.version++;
    return lots ? { resource: s.resource, amount: got, lots } : { resource: s.resource, amount: got };
  }

  /**
   * Pasan `hours` horas para la comida de una casilla: a cada lote le quedan menos y el que llega
   * a cero se estropea entero. Devuelve cuántas unidades se han estropeado.
   */
  age(x: number, y: number, hours: number): number {
    const s = this.at(x, y);
    if (!s || hours <= 0) return 0;
    const life = shelfLife(s.resource);
    if (life === undefined) return 0;
    if (!s.lots) s.lots = [{ n: s.amount, h: life }];
    let lost = 0;
    for (const l of s.lots) {
      l.h -= hours;
      if (l.h <= 0) lost += l.n;
    }
    if (lost === 0) return 0;
    s.lots = s.lots.filter((l) => l.h > 0);
    s.amount -= lost;
    if (s.amount <= 0) this.stacks.delete(index(this.map, x, y));
    this.version++;
    return lost;
  }

  /** Total de cada recurso en el suelo: el inventario de la colonia. */
  totals(): Stockpile {
    const total = emptyStockpile();
    for (const s of this.stacks.values()) total[s.resource] += s.amount;
    return total;
  }

  /** Todos los montones con su casilla. */
  list(): PlacedStack[] {
    const out: PlacedStack[] = [];
    for (const [i, s] of this.stacks) {
      const p: PlacedStack = { x: i % this.map.width, y: Math.floor(i / this.map.width), resource: s.resource, amount: s.amount };
      if (s.lots) p.lots = s.lots.map((l) => ({ ...l }));
      out.push(p);
    }
    return out;
  }

  get count(): number {
    return this.stacks.size;
  }

  /**
   * Casillas donde se puede dejar algo, ordenadas por pasos desde (x, y) (búsqueda en anchura,
   * orden fijo de vecinos). Si el origen no se puede pisar (p. ej. un árbol que aún está en pie),
   * se empieza por sus vecinas.
   */
  private nearbyTiles(x: number, y: number): { x: number; y: number }[] {
    const map = this.map;
    const seen = new Set<number>();
    let frontier: { x: number; y: number }[] = [];
    const visit = (px: number, py: number) => {
      if (!inBounds(map, px, py)) return;
      const i = index(map, px, py);
      if (seen.has(i) || !isPassable(map, px, py)) return;
      seen.add(i);
      frontier.push({ x: px, y: py });
    };
    visit(x, y);
    if (frontier.length === 0) for (const [dx, dy] of NEIGHBORS) visit(x + dx, y + dy);
    const out: { x: number; y: number }[] = [];
    for (let step = 0; step <= DROP_RADIUS && frontier.length > 0; step++) {
      const current = frontier;
      frontier = [];
      for (const t of current) {
        if (this.canHold(t.x, t.y)) out.push(t);
        for (const [dx, dy] of NEIGHBORS) visit(t.x + dx, t.y + dy);
      }
    }
    return out;
  }
}

/** Horas que le quedan a lo que caduca antes de un montón, o undefined si no caduca. */
export function nextExpiry(s: ItemStack): number | undefined {
  if (shelfLife(s.resource) === undefined) return undefined;
  return s.lots && s.lots.length > 0 ? s.lots[0].h : shelfLife(s.resource);
}

/** Texto de un montón para la interfaz, p. ej. «Madera ×40» o «Carne ×20 (caduca en 1 d 5 h)». */
export function describeStack(s: ItemStack, names: Record<ResourceId, string>): string {
  const base = `${names[s.resource]} ×${s.amount}`;
  const h = nextExpiry(s);
  if (h === undefined) return base;
  const hours = Math.max(1, Math.ceil(h));
  const d = Math.floor(hours / 24);
  const when = d > 0 ? `${d} d${hours % 24 ? ` ${hours % 24} h` : ''}` : `${hours} h`;
  const all = !s.lots || s.lots.length <= 1;
  return `${base} (${all ? 'caduca' : 'lo primero caduca'} en ${when})`;
}
