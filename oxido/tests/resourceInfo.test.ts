// Z#22: ficha de un recurso al tocarlo en la barra de arriba (qué es y para qué sirve).
import { describe, expect, it } from 'vitest';
import { resourceInfo, resourceInfoText, shortList } from '../src/sim/resourceInfo';
import { RESOURCES } from '../src/data/resources';

describe('ficha de recursos', () => {
  it('la madera dice su nombre, la cantidad y que sirve para construir', () => {
    const t = resourceInfoText('madera', 120);
    expect(t).toContain('🪵 Madera: 120 en la colonia');
    expect(t).toContain('Para construir:');
    expect(resourceInfo('madera').builds.length).toBeGreaterThan(0);
  });

  it('la comida dice que se come; la piedra, no', () => {
    expect(resourceInfo('patata').edible).toBe(true);
    expect(resourceInfoText('patata', 3)).toContain('Se come.');
    expect(resourceInfo('piedra').edible).toBe(false);
  });

  it('lo que sale de una receta dice cómo se fabrica', () => {
    expect(resourceInfo('cuchillo').madeBy.length).toBeGreaterThan(0);
    expect(resourceInfoText('cuchillo', 0)).toContain('Se fabrica:');
  });

  it('todos los recursos tienen ficha sin nombres repetidos', () => {
    for (const r of RESOURCES) {
      const i = resourceInfo(r);
      expect(i.name.length).toBeGreaterThan(0);
      expect(new Set(i.builds).size).toBe(i.builds.length);
    }
  });

  it('las listas largas se acortan', () => {
    expect(shortList(['a', 'b'])).toBe('a, b');
    expect(shortList(['a', 'b', 'c', 'd', 'e', 'f'])).toBe('a, b, c, d y 2 más');
  });
});
