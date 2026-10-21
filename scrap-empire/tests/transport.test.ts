import { describe, expect, it } from 'vitest';
import { ECONOMY, ZONES, advance, buy, cartBatch, load, newGame, orderQuantity, purchases, serialize, transportLoad, unitValue } from '../src/sim/game';

/** Partida con las zonas abiertas hasta la `id` y mucha chatarra. */
function rich(openUpTo: string) {
  const s = newGame();
  for (const def of ZONES) {
    s.zones[def.id].unlocked = true;
    s.zones[def.id].machines = Math.max(1, s.zones[def.id].machines);
    if (def.id === openUpTo) break;
  }
  s.scrap = 1e12;
  return s;
}

describe('tren y barco', () => {
  it('los vagones y los contenedores no van al muelle de los camiones', () => {
    const s = newGame();
    s.zones.wagons.unlocked = true;
    s.zones.wagons.machines = 50;
    s.scrap = 1e9;
    advance(s, 400);
    expect(s.dockUnits).toBe(0);
    expect(s.transports.rail.units + s.transports.rail.sent * transportLoad('rail', s)).toBeGreaterThan(0);
  });

  it('el tren sale cuando está lleno y paga más que el camión', () => {
    const s = newGame();
    s.transports.rail.units = transportLoad('rail', s) + 5;
    s.transports.rail.value = (transportLoad('rail', s) + 5) * 100;
    advance(s, 1);
    expect(s.transports.rail.sent).toBe(1);
    expect(s.transports.rail.units).toBeCloseTo(5, 6);
    expect(s.dollars).toBeCloseTo(transportLoad('rail', s) * 100 * ECONOMY.transports.rail.payMultiplier, 4);
    expect(s.transports.rail.cooldown).toBeGreaterThan(0);
  });

  it('el barco no sale con menos carga que la suya', () => {
    const s = newGame();
    s.transports.sea.units = transportLoad('sea', s) - 1;
    s.transports.sea.value = 1000;
    advance(s, 5);
    expect(s.transports.sea.sent).toBe(0);
    expect(s.dollars).toBe(0);
  });

  it('la mejora de tren se ofrece solo en su línea y sube la carga', () => {
    const s = newGame();
    expect(purchases(s).some((p) => p.kind === 'transport')).toBe(false);
    s.zones.wagons.unlocked = true;
    s.dollars = 1e12;
    const before = transportLoad('rail', s);
    expect(buy(s, 'transport:wagons')).toBe(true);
    expect(transportLoad('rail', s)).toBe(before + ECONOMY.transports.rail.loadPerLevel);
  });

  it('una partida antigua sin tren ni barco se carga con ellos vacíos', () => {
    const s = load(JSON.stringify({ version: 1, dollars: 5 }));
    expect(s.transports.rail.units).toBe(0);
    expect(s.transports.sea.level).toBe(0);
    expect(s.order).toBeNull();
  });
});

describe('pedidos especiales', () => {
  it('no se pide nada de una línea cerrada, sin chatarra o demasiado lenta', () => {
    const s = newGame();
    expect(orderQuantity(s, ZONES[0])).toBe(0); // sin chatarra
    s.scrap = 100;
    expect(orderQuantity(s, ZONES[1])).toBe(0); // cerrada
    s.zones.wagons.unlocked = true;
    expect(orderQuantity(s, ZONES.find((d) => d.id === 'wagons')!)).toBe(0); // una máquina: no llena una tanda a tiempo
  });

  it('la cantidad pedida son tandas enteras que caben en el plazo', () => {
    const s = rich('beams');
    s.zones.crusher.machines = 20;
    const q = orderQuantity(s, ZONES[0]);
    expect(q).toBeGreaterThan(0);
    expect(q % cartBatch(s.zones.crusher)).toBe(0);
  });

  it('aparece a los 15 min, se cumple entregando y paga la bonificación una sola vez', () => {
    const s = newGame();
    s.zones.crusher.machines = 20;
    s.zones.crusher.carts = 5;
    s.scrap = 1e12;
    advance(s, ECONOMY.orders.everySeconds + 1);
    expect(s.order).not.toBeNull();
    const o = s.order!;
    const bonus = o.qty * unitValue(ZONES[0], s.zones.crusher) * ECONOMY.orders.bonusMultiplier;
    const dollarsBefore = s.dollars;
    advance(s, ECONOMY.orders.windowSeconds);
    expect(s.ordersDone).toBe(1);
    expect(s.order).toBeNull();
    // Lo ganado incluye la bonificación una vez (más los camiones que hayan salido).
    expect(s.dollars - dollarsBefore).toBeGreaterThanOrEqual(bonus);
    expect(s.orderTimer).toBeGreaterThan(0);
  });

  it('si no se cumple a tiempo se pierde sin castigo y se espera al siguiente', () => {
    const s = newGame();
    s.zones.crusher.machines = 20;
    s.scrap = 1e12;
    advance(s, ECONOMY.orders.everySeconds + 1);
    expect(s.order).not.toBeNull();
    const bonus = s.order!.qty * unitValue(ZONES[0], s.zones.crusher);
    s.zones.crusher.carts = 0; // sin carretillas no se entrega nada
    const before = s.dollars;
    advance(s, ECONOMY.orders.windowSeconds + 2);
    expect(s.order).toBeNull();
    expect(s.ordersDone).toBe(0);
    expect(s.dollars - before).toBeLessThan(bonus); // solo los camiones que ya iban, nunca la bonificación
    expect(s.orderTimer).toBeGreaterThan(ECONOMY.orders.everySeconds - 5);
  });

  it('sin ninguna línea posible vuelve a mirar en un minuto y no se atasca', () => {
    const s = newGame(); // sin chatarra
    advance(s, ECONOMY.orders.everySeconds + 1);
    expect(s.order).toBeNull();
    expect(s.orderTimer).toBeGreaterThan(0);
    expect(s.orderTimer).toBeLessThanOrEqual(60);
  });

  it('se guarda y se carga con el pedido en marcha; uno roto se descarta', () => {
    const s = newGame();
    s.order = { zoneId: 'crusher', qty: 20, delivered: 10, left: 50 };
    expect(load(serialize(s)).order).toEqual(s.order);
    const bad = JSON.parse(serialize(s));
    bad.order = { zoneId: 'no-existe', qty: 20, delivered: 0, left: 50 };
    expect(load(JSON.stringify(bad)).order).toBeNull();
    bad.order = { zoneId: 'crusher', qty: 'x' };
    expect(load(JSON.stringify(bad)).order).toBeNull();
  });
});

describe('destinos del tren y el barco (F3)', () => {
  it('sin destino comprado sale como siempre: espera y paga del transporte', async () => {
    const { routeOf } = await import('../src/sim/game');
    const s = newGame();
    expect(routeOf(s, 'rail').id).toBe('local');
    s.transports.rail.units = transportLoad('rail', s);
    s.transports.rail.value = s.transports.rail.units * 100;
    advance(s, 1);
    expect(s.dollars).toBeCloseTo(transportLoad('rail', s) * 100 * ECONOMY.transports.rail.payMultiplier, 3);
    expect(s.transports.rail.cooldown).toBeGreaterThan(ECONOMY.transports.rail.returnSeconds - 2);
  });

  it('comprar un destino cuesta veces el valor de un cargamento, lo elige y alarga el viaje y la paga', async () => {
    const { routeCost, ROUTES, cargoValue, setRoute } = await import('../src/sim/game');
    const s = rich('wagons');
    const mid = ROUTES.find((r) => r.id === 'mid')!;
    expect(routeCost(s, 'rail', mid)).toBeCloseTo(100 * cargoValue(s, 'rail'), 6);
    const p = purchases(s).find((x) => x.id === 'route:wagons:mid')!;
    expect(p.cost).toBeCloseTo(routeCost(s, 'rail', mid), 6);
    s.dollars = p.cost - 1;
    expect(buy(s, p.id)).toBe(false);
    s.dollars = p.cost;
    expect(buy(s, p.id)).toBe(true);
    expect(s.transports.rail.route).toBe('mid');
    expect(purchases(s).some((x) => x.id === 'route:wagons:mid')).toBe(false);
    s.dollars = 0;
    s.transports.rail.units = transportLoad('rail', s);
    s.transports.rail.value = s.transports.rail.units * 100;
    s.zones.wagons.machines = 0;
    advance(s, 1);
    expect(s.dollars).toBeCloseTo(transportLoad('rail', s) * 100 * ECONOMY.transports.rail.payMultiplier * mid.pay, 3);
    expect(s.transports.rail.cooldown).toBeGreaterThan(ECONOMY.transports.rail.returnSeconds * mid.wait - 2);
    expect(setRoute(s, 'rail', 'far')).toBe(false);
    expect(setRoute(s, 'rail', 'local')).toBe(true);
  });

  it('una partida antigua carga con destino local', () => {
    const old = JSON.parse(serialize(newGame()));
    delete old.transports.rail.route;
    delete old.transports.rail.routesUnlocked;
    const s = load(JSON.stringify(old));
    expect(s.transports.rail.route).toBe('local');
    expect(s.transports.rail.routesUnlocked).toEqual([]);
  });
});

describe('capitán y anuncio del tren y el barco (F5)', () => {
  it('el capitán gana nivel con el trabajo, se paga y sube la paga y acorta el viaje', async () => {
    const { captainLevelsReady, captainPay, captainTrip } = await import('../src/sim/game');
    const s = rich('wagons');
    s.transports.rail.units = 1;
    advance(s, ECONOMY.captain.secondsPerLevel * 2);
    expect(captainLevelsReady(s, 'rail')).toBe(2);
    const p = purchases(s).find((x) => x.id === 'captain:wagons')!;
    s.dollars = p.cost;
    expect(buy(s, p.id)).toBe(true);
    expect(s.transports.rail.captainLevel).toBe(1);
    expect(captainPay(s, 'rail')).toBeCloseTo(1 + ECONOMY.captain.payPerLevel, 9);
    expect(captainTrip(s, 'rail')).toBeCloseTo(1 - ECONOMY.captain.tripPerLevel, 9);
  });

  it('«viaje ya» deja salir sin esperar y tiene espera larga; con Pase no hay espera', async () => {
    const { useTransportAd } = await import('../src/sim/game');
    const s = newGame();
    s.transports.rail.cooldown = 50;
    expect(useTransportAd(s, 'rail', 'now')).toBe(true);
    expect(s.transports.rail.cooldown).toBe(0);
    expect(s.transports.rail.adCooldown).toBe(ECONOMY.captain.adCooldownSeconds);
    s.transports.rail.cooldown = 50;
    expect(useTransportAd(s, 'rail', 'now')).toBe(false);
    s.hasPass = true;
    s.transports.rail.adCooldown = 0;
    expect(useTransportAd(s, 'rail', 'now')).toBe(true);
    expect(s.transports.rail.adCooldown).toBe(0);
  });

  it('«cargamento ×2» paga el doble solo el próximo viaje', async () => {
    const { useTransportAd } = await import('../src/sim/game');
    const s = newGame();
    expect(useTransportAd(s, 'rail', 'double')).toBe(true);
    s.transports.rail.units = transportLoad('rail', s);
    s.transports.rail.value = s.transports.rail.units * 100;
    advance(s, 1);
    const first = s.dollars;
    expect(first).toBeCloseTo(transportLoad('rail', s) * 100 * ECONOMY.transports.rail.payMultiplier * 2, 3);
    expect(s.transports.rail.doubleNext).toBe(false);
  });

  it('una partida antigua carga sin capitán ni anuncio en espera', () => {
    const old = JSON.parse(serialize(newGame()));
    for (const k of ['captainLevel', 'captainXp', 'adCooldown', 'doubleNext']) delete old.transports.sea[k];
    const s = load(JSON.stringify(old));
    expect(s.transports.sea).toMatchObject({ captainLevel: 0, captainXp: 0, adCooldown: 0, doubleNext: false });
  });
});

describe('almacén del tren y el barco (F4)', () => {
  it('la capacidad crece por nivel y siempre cabe el doble de un cargamento', async () => {
    const { warehouseCapacity } = await import('../src/sim/game');
    const s = newGame();
    expect(warehouseCapacity(s, 'rail')).toBe(ECONOMY.warehouse.baseCapacity);
    s.transports.rail.warehouseLevel = 2;
    expect(warehouseCapacity(s, 'rail')).toBe(ECONOMY.warehouse.baseCapacity + 2 * ECONOMY.warehouse.capacityPerLevel);
    s.transports.rail.level = 100;
    expect(warehouseCapacity(s, 'rail')).toBe(2 * transportLoad('rail', s));
  });

  it('el viaje paga +5 % por cada 25 % del almacén lleno, hasta +20 %', async () => {
    const { warehouseBonus, warehouseCapacity } = await import('../src/sim/game');
    const s = newGame();
    const cap = warehouseCapacity(s, 'rail');
    const at = (f: number) => {
      s.transports.rail.units = cap * f;
      return warehouseBonus(s, 'rail');
    };
    expect(at(0.1)).toBe(1);
    expect(at(0.25)).toBeCloseTo(1.05, 9);
    expect(at(0.6)).toBeCloseTo(1.1, 9);
    expect(at(1)).toBeCloseTo(1.2, 9);
    s.transports.rail.units = cap;
    s.transports.rail.value = cap * 100;
    advance(s, 1);
    expect(s.dollars).toBeCloseTo(transportLoad('rail', s) * 100 * ECONOMY.transports.rail.payMultiplier * 1.2, 3);
  });

  it('con el almacén lleno las carretillas esperan con su tanda y no se pierde producto', () => {
    const s = rich('wagons');
    s.zones.wagons.machines = 500;
    s.zones.wagons.carts = 20;
    s.transports.rail.cooldown = 1e9;
    const cap = ECONOMY.warehouse.baseCapacity;
    advance(s, 600);
    expect(s.transports.rail.units).toBeLessThanOrEqual(cap + 1e-6);
    const inCarts = s.zones.wagons.trips.reduce((n, t) => n + t.load, 0);
    const before = s.transports.rail.units + inCarts;
    s.transports.rail.cooldown = 0;
    advance(s, 1);
    expect(s.transports.rail.sent).toBeGreaterThanOrEqual(1);
    expect(before).toBeGreaterThan(cap);
    expect(inCarts).toBeGreaterThan(0);
  });

  it('el almacén se compra por niveles hasta el máximo y una partida antigua carga con nivel 0', () => {
    const s = rich('wagons');
    s.dollars = 1e30;
    for (let i = 0; i < ECONOMY.warehouse.maxLevel; i++) expect(buy(s, 'warehouse:wagons')).toBe(true);
    expect(purchases(s).some((p) => p.id === 'warehouse:wagons')).toBe(false);
    const old = JSON.parse(serialize(newGame()));
    delete old.transports.rail.warehouseLevel;
    expect(load(JSON.stringify(old)).transports.rail.warehouseLevel).toBe(0);
  });
});

describe('tope de la huella de salida en el muelle', () => {
  it('con la huella llena la línea deja de producir hasta que el camión se lleva producto', async () => {
    const { dockProductCap, zoneStatus } = await import('../src/sim/game');
    const s = newGame();
    s.scrapTrucks = 50;
    s.zones.crusher.machines = 300;
    s.zones.crusher.carts = 12;
    s.truckCooldown = 1e9; // el camión no llega: nada sale del muelle
    advance(s, 600);
    const def = ZONES[0];
    const cap = dockProductCap(s, def);
    expect(s.dockByZone.crusher).toBeLessThanOrEqual(cap + 1e-6);
    expect(s.dockByZone.crusher).toBeGreaterThan(cap - cartBatch(s.zones.crusher) * 2);
    expect(zoneStatus(s, def)).toBe('full');
    const before = s.zones.crusher.buffer;
    advance(s, 60);
    expect(s.dockByZone.crusher).toBeLessThanOrEqual(cap + 1e-6);
    expect(s.zones.crusher.buffer).toBeCloseTo(before, 6); // no produce más
    s.truckCooldown = 0;
    const sent = s.trucksSent;
    advance(s, 30);
    expect(s.trucksSent).toBeGreaterThan(sent); // salen camiones y la huella se vuelve a llenar sin pasar del tope
    expect(s.dockByZone.crusher).toBeLessThanOrEqual(cap + 1e-6);
  });

  it('el tope nunca baja del doble de una tanda', async () => {
    const { dockProductCap } = await import('../src/sim/game');
    const s = newGame();
    s.zones.crusher.cartLevel = 500;
    expect(dockProductCap(s, ZONES[0])).toBe(2 * cartBatch(s.zones.crusher));
  });
});
