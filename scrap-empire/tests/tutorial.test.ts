import { describe, expect, it } from 'vitest';
import { ECONOMY, ZONES, buy, newGame } from '../src/sim/game';
import { TUTORIAL_END, TUTORIAL_STEPS, tutorialStep } from '../src/sim/tutorial';

describe('tutorial guiado', () => {
  it('empieza tocando la pila y pasa al puesto tras los toques pedidos', () => {
    const s = newGame();
    expect(tutorialStep(s, 0, 0)!.id).toBe('tap');
    expect(tutorialStep(s, 0, 0)!.target).toBe('pile');
    expect(tutorialStep(s, 0, ECONOMY.tutorial.taps - 1)!.id).toBe('tap');
    const st = tutorialStep(s, 0, ECONOMY.tutorial.taps)!;
    expect(st.id).toBe('upgrade');
    expect(st.target).toBe(ZONES[0].id);
    expect(st.purchase!.zoneId).toBe(ZONES[0].id);
  });

  it('sigue el orden pedido y cada compra hace avanzar', () => {
    const s = newGame();
    s.dollars = 1e9;
    const seen: string[] = [];
    let i = 0;
    for (let n = 0; n < 10; n++) {
      const st = tutorialStep(s, i, ECONOMY.tutorial.taps);
      if (!st || st.id === 'done') break;
      seen.push(st.id);
      if (st.id !== 'tap') expect(buy(s, st.purchase!.id)).toBe(true);
      i = st.index;
    }
    expect(seen).toEqual(['upgrade', 'scrapTruck', 'carts', 'dock', 'unlock']);
    expect(s.zones[ZONES[1].id].unlocked).toBe(true);
    expect(tutorialStep(s, i, ECONOMY.tutorial.taps)!.id).toBe('done');
  });

  it('se salta lo que ya está hecho y no vuelve atrás', () => {
    const s = newGame();
    s.scrapTrucks = 2;
    s.zones[ZONES[0].id].capacity = 1;
    expect(tutorialStep(s, 1, 0)!.id).toBe('carts');
    // Aunque falten toques, un índice más avanzado no retrocede.
    expect(tutorialStep(s, TUTORIAL_STEPS.indexOf('dock'), 0)!.id).toBe('dock');
  });

  it('el paso de despedida espera a su botón y después no hay más', () => {
    const s = newGame();
    expect(tutorialStep(s, TUTORIAL_STEPS.indexOf('done'), 0)!.id).toBe('done');
    expect(tutorialStep(s, TUTORIAL_END, 0)).toBeNull();
  });
});
