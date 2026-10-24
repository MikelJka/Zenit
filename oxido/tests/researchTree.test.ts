import { describe, expect, it } from 'vitest';
import { RESEARCH, type ResearchDef } from '../src/data/research';
import { researchTreeLayout } from '../src/sim/research';

const def = (id: string, requires: string[] = []): ResearchDef => ({ id, name: id, hours: 1, requires, unlocks: '' });

describe('árbol de investigación (Z#17)', () => {
  it('cada proyecto va a la derecha de lo que pide y no hay dos en la misma casilla', () => {
    const t = researchTreeLayout();
    expect(t.nodes).toHaveLength(RESEARCH.length);
    const at = new Map(t.nodes.map((n) => [n.id, n]));
    const cells = new Set(t.nodes.map((n) => `${n.col},${n.row}`));
    expect(cells.size).toBe(t.nodes.length);
    for (const p of RESEARCH) {
      for (const q of p.requires) expect(at.get(q)!.col).toBeLessThan(at.get(p.id)!.col);
      if (!p.requires.length) expect(at.get(p.id)!.col).toBe(0);
    }
    expect(t.edges).toHaveLength(RESEARCH.reduce((n, p) => n + p.requires.length, 0));
    for (const n of t.nodes) {
      expect(n.col).toBeLessThan(t.cols);
      expect(n.row).toBeLessThan(t.rows);
    }
  });

  it('las ramas no se cruzan: el padre está a la altura de su primer hijo y los hermanos debajo', () => {
    const t = researchTreeLayout([def('a'), def('b', ['a']), def('c', ['a']), def('d', ['c']), def('e')]);
    const at = Object.fromEntries(t.nodes.map((n) => [n.id, [n.col, n.row]]));
    expect(at).toEqual({ a: [0, 0], b: [1, 0], c: [1, 1], d: [2, 1], e: [0, 2] });
    expect(t.cols).toBe(3);
    expect(t.rows).toBe(3);
  });

  it('con dos requisitos cuelga del más profundo y el otro se une con una flecha', () => {
    const t = researchTreeLayout([def('x'), def('y'), def('y2', ['y']), def('m', ['x', 'y2'])]);
    const at = Object.fromEntries(t.nodes.map((n) => [n.id, [n.col, n.row]]));
    expect(at.m).toEqual([2, at.y2[1]]);
    expect(t.edges).toContainEqual({ from: 'x', to: 'm' });
    expect(t.edges).toContainEqual({ from: 'y2', to: 'm' });
  });
});
