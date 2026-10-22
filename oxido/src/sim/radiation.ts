// Radiación temporal: al saquear un barril tóxico, la casilla y las de alrededor quedan irradiadas
// unos días y luego vuelven a la radiación que tenían. Lógica pura (sin Phaser ni DOM).
import { BARREL_IRRADIATION } from '../data/uranium';
import { GameMap, inBounds } from './map';

/** Casilla irradiada por un tiempo: la radiación que tenía antes y el tick en que se le pasa. */
export interface HotTile {
  base: number;
  until: number;
}

/** Casillas irradiadas por un tiempo, por índice de casilla. */
export type HotTiles = Map<number, HotTile>;

/**
 * Irradia la casilla (x, y) y las de alrededor (a `radius` casillas o menos) hasta `until`.
 * Si ya estaban irradiadas por otro barril, se alarga el plazo y se guarda la radiación de antes.
 * Devuelve los índices de las casillas cambiadas (para repintarlas).
 */
export function irradiate(map: GameMap, hot: HotTiles, x: number, y: number, until: number,
  level = BARREL_IRRADIATION.level, radius = BARREL_IRRADIATION.radius): number[] {
  const changed: number[] = [];
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(map, nx, ny)) continue;
      const i = ny * map.width + nx;
      const prev = hot.get(i);
      const base = prev ? prev.base : map.radiation[i];
      // Una casilla que ya era más radiactiva (zona irradiada del mapa) no se toca.
      if (!prev && base >= level) continue;
      hot.set(i, { base, until: Math.max(until, prev?.until ?? 0) });
      map.radiation[i] = Math.max(map.radiation[i], level);
      changed.push(i);
    }
  }
  return changed;
}

/** Las casillas cuyo plazo ha pasado vuelven a su radiación de antes. Devuelve las cambiadas. */
export function coolDown(map: GameMap, hot: HotTiles, now: number): number[] {
  const changed: number[] = [];
  for (const [i, h] of hot) {
    if (now < h.until) continue;
    map.radiation[i] = h.base;
    hot.delete(i);
    changed.push(i);
  }
  return changed;
}
