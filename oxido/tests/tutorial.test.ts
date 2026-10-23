import { describe, expect, it } from 'vitest';
import { TUTORIAL_INTRO, TUTORIAL_NARRATOR, TUTORIAL_OUTRO, TUTORIAL_STEPS } from '../src/data/tutorial';
import { recipeDef } from '../src/data/recipes';
import { BUILDINGS } from '../src/data/buildings';
import { Prop } from '../src/sim/map';
import { advanceTutorial, tutorialCheckDone } from '../src/sim/tutorial';
import { flatWorld } from './helpers';

describe('Primeros pasos', () => {
  it('tiene los pasos aprobados, en orden, contados por la radio, y señala construcciones que existen', () => {
    expect(TUTORIAL_STEPS.map((s) => s.id)).toEqual([
      'talar', 'almacen', 'huerto', 'pozo', 'cocina', 'cama', 'muro', 'banco', 'armas', 'investigacion', 'proyecto', 'barricada', 'reclutar', 'desreclutar',
    ]);
    expect(TUTORIAL_NARRATOR).toEqual({ name: 'Nora', station: 'Radio Óxido', portrait: 'radio' });
    expect(TUTORIAL_INTRO.text.length).toBeGreaterThan(20);
    expect(TUTORIAL_OUTRO.text.length).toBeGreaterThan(20);
    for (const s of TUTORIAL_STEPS) {
      if (s.target?.build) expect(BUILDINGS.some((b) => b.id === s.target!.build && b.category === s.target!.category)).toBe(true);
      for (const id of s.check.buildings ?? []) expect(BUILDINGS.some((b) => b.id === id)).toBe(true);
    }
  });

  it('en una partida nueva no hay nada hecho', () => {
    const w = flatWorld();
    expect(advanceTutorial(w, TUTORIAL_STEPS, 0)).toBe(0);
  });

  it('avanza paso a paso según lo que hace el jugador', () => {
    const w = flatWorld();
    const map = w.map;
    map.props[10 * map.width + 10] = Prop.DeadTree;
    map.stock[10 * map.width + 10] = 20;
    expect(w.designations.add(10, 10, 'talar')).toBe(true);
    expect(advanceTutorial(w, TUTORIAL_STEPS, 0)).toBe(1);

    expect(w.zones.create({ x0: 2, y0: 12, x1: 4, y1: 14 })).not.toBeNull();
    expect(advanceTutorial(w, TUTORIAL_STEPS, 1)).toBe(2);

    expect(w.farms.create({ x0: 12, y0: 12, x1: 14, y1: 14 })).not.toBeNull();
    expect(advanceTutorial(w, TUTORIAL_STEPS, 2)).toBe(3);

    expect(w.structures.place(20, 20, 'cama')).toBe(true); // un plano ya cuenta
    expect(advanceTutorial(w, TUTORIAL_STEPS, 3)).toBe(3); // la cama va después: sigue en el pozo;

    expect(w.structures.place(20, 24, 'pozo')).toBe(true);
    expect(advanceTutorial(w, TUTORIAL_STEPS, 3)).toBe(4);
    expect(w.structures.place(23, 24, 'cocina')).toBe(true);
    expect(advanceTutorial(w, TUTORIAL_STEPS, 4)).toBe(6); // la cama ya estaba

    expect(w.structures.place(25, 5, 'muro_piedra')).toBe(true); // cualquier muro vale
    expect(advanceTutorial(w, TUTORIAL_STEPS, 6)).toBe(7);

    expect(w.structures.place(5, 24, 'banco_trabajo')).toBe(true);
    expect(advanceTutorial(w, TUTORIAL_STEPS, 7)).toBe(8);
    // Un encargo que no es un arma no cuenta; una lanza, sí.
    const bench = w.structures.at(5, 24)!;
    w.structures.setBill(bench, { recipe: recipeDef('cortar_tablones')!, target: 5, paused: false });
    expect(advanceTutorial(w, TUTORIAL_STEPS, 8)).toBe(8);
    w.structures.setBill(bench, { recipe: recipeDef('fabricar_lanza')!, target: 2, paused: false });
    expect(advanceTutorial(w, TUTORIAL_STEPS, 8)).toBe(9);

    expect(w.structures.place(10, 24, 'banco_investigacion')).toBe(true);
    expect(advanceTutorial(w, TUTORIAL_STEPS, 9)).toBe(10);
    w.research.current = 'puentes';
    expect(advanceTutorial(w, TUTORIAL_STEPS, 10)).toBe(11);

    expect(w.structures.place(27, 27, 'sacos_arena')).toBe(true);
    expect(advanceTutorial(w, TUTORIAL_STEPS, 11)).toBe(12);

    // Reclutar y, después, devolverlo al trabajo.
    w.colonists[0].drafted = true;
    expect(advanceTutorial(w, TUTORIAL_STEPS, 12)).toBe(13);
    w.colonists[0].drafted = false;
    expect(advanceTutorial(w, TUTORIAL_STEPS, 13)).toBe(TUTORIAL_STEPS.length);
  });

  it('no se salta un paso que no está hecho aunque los siguientes sí lo estén', () => {
    const w = flatWorld();
    expect(w.structures.place(20, 20, 'cama')).toBe(true);
    expect(advanceTutorial(w, TUTORIAL_STEPS, 0)).toBe(0);
    expect(tutorialCheckDone(w, TUTORIAL_STEPS[5].check)).toBe(true);
  });

  it('nunca vuelve atrás aunque se quite lo hecho', () => {
    const w = flatWorld();
    expect(advanceTutorial(w, TUTORIAL_STEPS, 2)).toBe(2);
  });
});
