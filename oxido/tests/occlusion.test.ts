import { describe, expect, it } from 'vitest';
import { OccluderIndex } from '../src/render/occlusion';

describe('construcciones que tapan lo de detrás', () => {
  const wall = { x0: 32, y0: 20, x1: 48, y1: 44, depth: 10.006 };

  it('un muro al sur de un colono, dibujado encima, lo tapa', () => {
    const idx = new OccluderIndex<string>();
    idx.add(wall, 'muro');
    const colonist = { x0: 36, y0: 18, x1: 44, y1: 34, depth: 10.0045 };
    expect([...idx.covering(colonist)]).toEqual(['muro']);
  });

  it('si el colono está delante (más al sur) no cuenta', () => {
    const idx = new OccluderIndex<string>();
    idx.add(wall, 'muro');
    const colonist = { x0: 36, y0: 30, x1: 44, y1: 46, depth: 10.0075 };
    expect(idx.covering(colonist).size).toBe(0);
  });

  it('al lado, sin solaparse, o apenas rozado por arriba, no cuenta', () => {
    const idx = new OccluderIndex<string>();
    idx.add(wall, 'muro');
    expect(idx.covering({ x0: 50, y0: 18, x1: 58, y1: 34, depth: 10.004 }).size).toBe(0);
    // Solo 2 de 16 píxeles de alto tapados (menos de la cuarta parte).
    expect(idx.covering({ x0: 36, y0: 42, x1: 44, y1: 58, depth: 10.004 }).size).toBe(0);
  });

  it('una construcción ancha se encuentra desde cualquier columna y sale una sola vez', () => {
    const idx = new OccluderIndex<string>();
    idx.add({ x0: 0, y0: 0, x1: 64, y1: 40, depth: 11 }, 'taller');
    const out = idx.covering({ x0: 10, y0: 0, x1: 60, y1: 30, depth: 10 });
    expect([...out]).toEqual(['taller']);
    idx.clear();
    expect(idx.covering({ x0: 10, y0: 0, x1: 60, y1: 30, depth: 10 }).size).toBe(0);
  });
});
