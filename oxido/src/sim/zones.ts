// Zonas de almacén: casillas marcadas en el suelo donde los colonos guardan recursos.
// Cada zona tiene un filtro (qué recursos acepta) y una prioridad (las de más prioridad se llenan antes).
import { RESOURCES, ResourceId } from '../data/resources';
import { GameMap, inBounds, index, isPassable, isWater, Terrain } from './map';
import type { TileRect } from './designations';

/** Prioridad de una zona: 1 baja, 2 normal, 3 alta, 4 crítica. Lo suelto en el suelo cuenta como 0. */
export type StoragePriority = 1 | 2 | 3 | 4;
export const STORAGE_PRIORITIES: readonly StoragePriority[] = [1, 2, 3, 4];
export const STORAGE_PRIORITY_NAMES: Record<StoragePriority, string> = {
  1: 'Baja',
  2: 'Normal',
  3: 'Alta',
  4: 'Crítica',
};

/** Prioridad con la que empieza el inventario de un mueble de guardar (se cambia al tocarlo). */
export const FURNITURE_PRIORITY: StoragePriority = 3;

export interface StorageZone {
  id: number;
  name: string;
  priority: StoragePriority;
  /** Recursos que acepta. */
  accepts: Record<ResourceId, boolean>;
  /** Casillas (índices del mapa). */
  tiles: Set<number>;
  /**
   * Si es el inventario de un mueble de guardar (nevera, estantería, armario, armero): el id de
   * esa construcción. Lo pone y lo quita el mundo (`syncFurniture`), no se dibuja a mano.
   */
  furniture?: number;
}

/** Se puede incluir la casilla en una zona: se pisa y no es agua. */
export function canZone(map: GameMap, x: number, y: number): boolean {
  const i = index(map, x, y);
  return isPassable(map, x, y) && !isWater(map.terrain[i] as Terrain) && !map.trench[i];
}

export class StorageZones {
  private zones = new Map<number, StorageZone>();
  /** Zona de cada casilla (0 = ninguna). */
  private zoneOf: Int32Array;
  /**
   * Casillas con un objeto encima (un mueble, un muro, un plano…): ahí no se dibuja almacén y, si se
   * pone uno, la casilla sale de la zona. Lo fija el mundo; sin él, no se excluye nada.
   */
  occupied?: (x: number, y: number) => boolean;
  private nextId = 1;
  /** Aumenta con cada cambio: el dibujado y el transporte lo usan para saber cuándo recalcular. */
  version = 0;

  constructor(readonly map: GameMap) {
    this.zoneOf = new Int32Array(map.width * map.height);
  }

  get(id: number): StorageZone | undefined {
    return this.zones.get(id);
  }

  all(): StorageZone[] {
    return [...this.zones.values()];
  }

  /** Zona de una casilla, o undefined. */
  at(x: number, y: number): StorageZone | undefined {
    if (!inBounds(this.map, x, y)) return undefined;
    const id = this.zoneOf[index(this.map, x, y)];
    return id ? this.zones.get(id) : undefined;
  }

  /**
   * Prioridad de almacén de una casilla para un recurso: la de su zona si lo acepta, 0 si no
   * (suelto en el suelo o en una zona que no lo quiere).
   */
  priorityFor(x: number, y: number, resource: ResourceId): number {
    const z = this.at(x, y);
    return z && z.accepts[resource] ? z.priority : 0;
  }

  /**
   * Crea una zona con las casillas libres del rectángulo (las que ya son de otra zona se
   * respetan). Si toca otra zona... se crea igualmente aparte. Devuelve la zona o null si no
   * había ninguna casilla válida.
   */
  create(r: TileRect, exclude?: (x: number, y: number) => boolean): StorageZone | null {
    const tiles = this.freeTiles(r, exclude);
    if (tiles.length === 0) return null;
    const id = this.nextId++;
    const zone: StorageZone = {
      id,
      name: `Almacén ${id}`,
      priority: 2,
      accepts: Object.fromEntries(RESOURCES.map((res) => [res, true])) as Record<ResourceId, boolean>,
      tiles: new Set(),
    };
    this.zones.set(id, zone);
    for (const i of tiles) {
      zone.tiles.add(i);
      this.zoneOf[i] = id;
    }
    this.version++;
    return zone;
  }

  /** Añade a una zona las casillas libres de un rectángulo. Devuelve cuántas. */
  extend(id: number, r: TileRect, exclude?: (x: number, y: number) => boolean): number {
    const zone = this.zones.get(id);
    if (!zone) return 0;
    const tiles = this.freeTiles(r, exclude);
    for (const i of tiles) {
      zone.tiles.add(i);
      this.zoneOf[i] = id;
    }
    if (tiles.length > 0) this.version++;
    return tiles.length;
  }

  /** Quita de cualquier zona las casillas del rectángulo; las zonas vacías desaparecen. Devuelve cuántas. */
  removeArea(r: TileRect): number {
    let removed = 0;
    this.forRect(r, (i) => {
      const id = this.zoneOf[i];
      if (!id || this.zones.get(id)?.furniture !== undefined) return; // el inventario de un mueble no se quita a mano
      this.zoneOf[i] = 0;
      const zone = this.zones.get(id)!;
      zone.tiles.delete(i);
      if (zone.tiles.size === 0) this.zones.delete(id);
      removed++;
    });
    if (removed > 0) this.version++;
    return removed;
  }

  /** Borra una zona entera. */
  delete(id: number): boolean {
    const zone = this.zones.get(id);
    if (!zone || zone.furniture !== undefined) return false;
    for (const i of zone.tiles) this.zoneOf[i] = 0;
    this.zones.delete(id);
    this.version++;
    return true;
  }

  /** Vuelve a poner una zona guardada (al cargar una partida). Se saltan las casillas no válidas u ocupadas. */
  restore(z: { id: number; name: string; priority: StoragePriority; accepts: Partial<Record<ResourceId, boolean>>; tiles: number[]; furniture?: number }): void {
    const accepts = Object.fromEntries(RESOURCES.map((r) => [r, z.accepts[r] ?? true])) as Record<ResourceId, boolean>;
    const zone: StorageZone = { id: z.id, name: z.name, priority: z.priority, accepts, tiles: new Set() };
    if (z.furniture !== undefined) zone.furniture = z.furniture;
    for (const i of z.tiles) {
      if (i < 0 || i >= this.zoneOf.length || this.zoneOf[i]) continue;
      if (z.furniture === undefined && !this.usable(i)) continue;
      zone.tiles.add(i);
      this.zoneOf[i] = z.id;
    }
    if (zone.tiles.size === 0) return;
    this.zones.set(z.id, zone);
    this.nextId = Math.max(this.nextId, z.id + 1);
    this.version++;
  }

  setPriority(id: number, priority: StoragePriority): void {
    const zone = this.zones.get(id);
    if (!zone || zone.priority === priority) return;
    zone.priority = priority;
    this.version++;
  }

  setAccepts(id: number, resource: ResourceId, accepts: boolean): void {
    const zone = this.zones.get(id);
    if (!zone || zone.accepts[resource] === accepts) return;
    zone.accepts[resource] = accepts;
    this.version++;
  }

  /** Quita de las zonas las casillas que ya no se pueden usar (p. ej. al construir un muro encima). */
  prune(): number {
    let removed = 0;
    for (const zone of [...this.zones.values()]) {
      for (const i of [...zone.tiles]) {
        if (zone.furniture === undefined && !this.usable(i)) {
          zone.tiles.delete(i);
          this.zoneOf[i] = 0;
          removed++;
        }
      }
      if (zone.tiles.size === 0) this.zones.delete(zone.id);
    }
    if (removed > 0) this.version++;
    return removed;
  }

  private forRect(r: TileRect, fn: (i: number, x: number, y: number) => void): void {
    const xa = Math.max(0, Math.min(r.x0, r.x1));
    const xb = Math.min(this.map.width - 1, Math.max(r.x0, r.x1));
    const ya = Math.max(0, Math.min(r.y0, r.y1));
    const yb = Math.min(this.map.height - 1, Math.max(r.y0, r.y1));
    for (let y = ya; y <= yb; y++) for (let x = xa; x <= xb; x++) fn(index(this.map, x, y), x, y);
  }

  private freeTiles(r: TileRect, exclude?: (x: number, y: number) => boolean): number[] {
    const out: number[] = [];
    this.forRect(r, (i, x, y) => {
      if (!this.zoneOf[i] && this.usable(i) && !exclude?.(x, y)) out.push(i);
    });
    return out;
  }

  /** Una casilla vale para un almacén dibujado: se pisa, no es agua y no tiene un objeto encima. */
  private usable(i: number): boolean {
    const x = i % this.map.width;
    const y = Math.floor(i / this.map.width);
    return canZone(this.map, x, y) && !this.occupied?.(x, y);
  }

  /** El inventario de un mueble de guardar (o undefined). */
  ofFurniture(structureId: number): StorageZone | undefined {
    for (const z of this.zones.values()) if (z.furniture === structureId) return z;
    return undefined;
  }

  /**
   * Pone el inventario de un mueble en sus casillas (quitándolas de cualquier almacén dibujado).
   * Si ya existía, conserva su prioridad y su filtro. Devuelve la zona.
   */
  setFurniture(structureId: number, name: string, tiles: number[], priority: StoragePriority, accepts: (r: ResourceId) => boolean): StorageZone {
    let zone = this.ofFurniture(structureId);
    if (!zone) {
      zone = {
        id: this.nextId++,
        name,
        priority,
        accepts: Object.fromEntries(RESOURCES.map((r) => [r, accepts(r)])) as Record<ResourceId, boolean>,
        tiles: new Set(),
        furniture: structureId,
      };
      this.zones.set(zone.id, zone);
      this.version++;
    }
    const want = new Set(tiles);
    for (const i of [...zone.tiles]) {
      if (want.has(i)) continue;
      zone.tiles.delete(i);
      this.zoneOf[i] = 0;
      this.version++;
    }
    for (const i of want) {
      if (this.zoneOf[i] === zone.id) continue;
      const other = this.zones.get(this.zoneOf[i]);
      if (other) {
        other.tiles.delete(i);
        if (other.tiles.size === 0) this.zones.delete(other.id);
      }
      zone.tiles.add(i);
      this.zoneOf[i] = zone.id;
      this.version++;
    }
    return zone;
  }

  /** Quita los inventarios de muebles que ya no están (o no están terminados). Devuelve cuántos. */
  dropFurniture(keep: (structureId: number) => boolean): number {
    let n = 0;
    for (const z of [...this.zones.values()]) {
      if (z.furniture === undefined || keep(z.furniture)) continue;
      for (const i of z.tiles) this.zoneOf[i] = 0;
      this.zones.delete(z.id);
      n++;
    }
    if (n > 0) this.version++;
    return n;
  }
}
