// Qué construcciones tapan a alguien que está detrás (más al norte): esas se dibujan translúcidas
// para que se vea lo que hay detrás. Solo geometría de pantalla, sin Phaser: se puede probar.

/** Un rectángulo de pantalla (en píxeles del mundo) con su profundidad de dibujo. */
export interface ScreenBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Profundidad de dibujo: lo de más profundidad se pinta encima. */
  depth: number;
}

/** Ancho de las columnas del índice (en píxeles). */
const BUCKET = 16;

/**
 * Índice de las construcciones que pueden tapar algo, repartidas por columnas de pantalla para no
 * comprobar todas en cada fotograma.
 */
export class OccluderIndex<T> {
  private buckets = new Map<number, { box: ScreenBox; item: T }[]>();

  add(box: ScreenBox, item: T): void {
    const entry = { box, item };
    for (let c = Math.floor(box.x0 / BUCKET); c <= Math.floor((box.x1 - 0.001) / BUCKET); c++) {
      let list = this.buckets.get(c);
      if (!list) this.buckets.set(c, (list = []));
      list.push(entry);
    }
  }

  clear(): void {
    this.buckets.clear();
  }

  /**
   * Construcciones dibujadas por encima de `target` (más profundidad) cuyo dibujo se monta sobre él.
   * `minOverlap` (0–1): parte del alto de `target` que tiene que quedar tapada para contar.
   */
  covering(target: ScreenBox, minOverlap = 0.25, out = new Set<T>()): Set<T> {
    const h = target.y1 - target.y0;
    for (let c = Math.floor(target.x0 / BUCKET); c <= Math.floor((target.x1 - 0.001) / BUCKET); c++) {
      for (const { box, item } of this.buckets.get(c) ?? []) {
        if (box.depth <= target.depth) continue;
        const ox = Math.min(box.x1, target.x1) - Math.max(box.x0, target.x0);
        const oy = Math.min(box.y1, target.y1) - Math.max(box.y0, target.y0);
        if (ox <= 0 || oy <= 0) continue;
        if (oy < h * minOverlap) continue;
        out.add(item);
      }
    }
    return out;
  }
}
