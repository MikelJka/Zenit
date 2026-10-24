import { describe, expect, it } from 'vitest';
import { ZONES, dockProductCap, newGame, zoneCapacity } from '../src/sim/game';
import { nextStep, purchaseScore, stepKey } from '../src/sim/advice';

describe('siguiente paso recomendado', () => {
  it('sin chatarra recomienda un camión de chatarra', () => {
    const s = newGame();
    const step = nextStep(s)!;
    expect(step.reason).toBe('scrap');
    expect(step.purchase.id).toBe('scrapTruck');
  });

  it('con el muelle lleno recomienda el camión de salida antes que nada', () => {
    const s = newGame();
    const crusher = ZONES[0];
    s.dockByZone[crusher.id] = dockProductCap(s, crusher);
    s.zones[crusher.id].buffer = zoneCapacity(s.zones[crusher.id]);
    const step = nextStep(s)!;
    expect(step.reason).toBe('dock');
    expect(step.purchase.id).toBe('dock');
  });

  it('con el palé lleno y sin carretillas que den abasto recomienda carretillas de esa línea', () => {
    const s = newGame();
    const z = s.zones[ZONES[0].id];
    s.scrap = 100;
    z.carts = 0;
    z.buffer = zoneCapacity(z);
    const step = nextStep(s)!;
    expect(step.reason).toBe('carts');
    expect(step.zoneId).toBe(ZONES[0].id);
    expect(['carts:' + ZONES[0].id, 'cartLevel:' + ZONES[0].id]).toContain(step.purchase.id);
  });

  it('sin atasco recomienda la compra que más rinde por dólar', () => {
    const s = newGame();
    s.scrap = 1e6;
    s.scrapTrucks = 50;
    const step = nextStep(s)!;
    expect(['best', 'unlock', 'level']).toContain(step.reason);
    if (step.reason !== 'level') expect(purchaseScore(s, step.purchase)).toBeGreaterThan(0);
  });

  it('no cambia la partida y la clave es estable', () => {
    const s = newGame();
    const before = JSON.stringify(s);
    const a = nextStep(s)!;
    expect(JSON.stringify(s)).toBe(before);
    expect(stepKey(a)).toBe(stepKey(nextStep(s)!));
  });
});
