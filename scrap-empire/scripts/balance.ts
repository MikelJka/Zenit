/**
 * Simulación de un jugador humano acelerada (N1): sesiones cortas, juego cerrado entre medias (con el tope de 1 h)
 * y compras como el bot. Escribe cuándo se abre cada zona, cuándo se llega a los hitos y cuánto se espera entre alegrías.
 * Uso: npx vite-node scripts/balance.ts
 */
import { ECONOMY, ZONES, advance, newGame, tap, type GameState } from '../src/sim/game';
import { shop } from '../src/sim/bot';

interface Profile {
  name: string;
  /** Segundos entre el inicio de dos sesiones, horas del día en que se juega y minutos de cada sesión. */
  everyMin: number;
  fromHour: number;
  toHour: number;
  sessionMin: number;
}

const PROFILES: Profile[] = [
  { name: 'casual (4 sesiones de 5 min al día)', everyMin: 240, fromHour: 8, toHour: 23, sessionMin: 5 },
  { name: 'atento (cada 40 min, 4 min, 16 h al día)', everyMin: 40, fromHour: 8, toHour: 24, sessionMin: 4 },
];

/** Suma de todo lo comprado: sirve para contar compras entre dos momentos. */
function owned(s: GameState): number {
  let n = s.scrapTrucks + s.dockLevel;
  for (const z of Object.values(s.zones)) n += (z.unlocked ? 1 : 0) + z.speed + z.capacity + z.machines + z.machineLevel + z.carts + z.cartLevel + z.helperLevel;
  return n;
}
function maxLevel(s: GameState): number {
  return Math.max(...Object.values(s.zones).map((z) => z.machineLevel));
}
const fmtT = (sec: number) => (sec < 3600 ? `${Math.round(sec / 60)} min` : sec < 86400 * 2 ? `${(sec / 3600).toFixed(1)} h` : `${(sec / 86400).toFixed(1)} días`);

function run(p: Profile, days: number): void {
  const s = newGame();
  const marks: [string, number][] = [];
  const seen = new Set<string>();
  const mark = (k: string, at: number) => {
    if (!seen.has(k)) {
      seen.add(k);
      marks.push([k, at]);
    }
  };
  let clock = 0;
  let lastBuyAt = 0;
  let longestWait = 0;
  let totalBuys = 0;
  let sessions = 0;
  const waits: number[] = [];
  const end = days * 86400;
  while (clock < end) {
    const hour = (clock / 3600) % 24;
    if (hour < p.fromHour || hour >= p.toHour) {
      clock += 3600;
      advance(s, ECONOMY.offlineCapSeconds * 0 + 0);
      continue;
    }
    sessions++;
    // Al abrir: lo ganado fuera (tope 1 h), compra, y juega activo tocando.
    const sinceLast = Math.min(p.everyMin * 60, ECONOMY.offlineCapSeconds);
    advance(s, sinceLast);
    const before = owned(s);
    shop(s, 0);
    for (let t = 0; t < p.sessionMin * 60; t++) {
      for (let i = 0; i < 2; i++) tap(s);
      advance(s, 1);
      if (t % 15 === 0) shop(s, 2);
    }
    shop(s, 2);
    const bought = owned(s) - before;
    totalBuys += bought;
    if (bought > 0) {
      waits.push(clock - lastBuyAt);
      longestWait = Math.max(longestWait, clock - lastBuyAt);
      lastBuyAt = clock;
    }
    clock += p.everyMin * 60;
    for (const z of ZONES) if (s.zones[z.id].unlocked) mark(`zona ${z.name}`, clock);
    for (const lv of [5, 15, 30, 50]) if (maxLevel(s) >= lv) mark(`máquina nivel ${lv}`, clock);
    if (ZONES.every((z) => s.zones[z.id].unlocked)) {
      if (ZONES.every((z) => s.zones[z.id].helperLevel >= 10)) mark('todos los ayudantes nv 10', clock);
      if (ZONES.every((z) => s.zones[z.id].helperLevel >= ECONOMY.helpers.maxLevel)) mark('todos los ayudantes al máximo', clock);
      if (ZONES.every((z) => s.zones[z.id].machineLevel >= 30)) mark('todas las máquinas nv 30', clock);
    }
  }
  console.log(`\n== ${p.name} · ${days} días simulados, ${sessions} sesiones ==`);
  for (const [k, at] of marks) console.log(`  ${fmtT(at).padStart(9)}  ${k}`);
  waits.sort((a, b) => a - b);
  const med = waits[Math.floor(waits.length / 2)] ?? 0;
  console.log(`  compras: ${totalBuys} (${(totalBuys / sessions).toFixed(1)} por sesión) · espera mediana entre sesiones con compra: ${fmtT(med)} · la más larga: ${fmtT(longestWait)}`);
  for (const z of ZONES) {
    const q = s.zones[z.id];
    console.log(`  ${z.name.padEnd(30)} máq ${q.machines}×nv${q.machineLevel} vel ${q.speed} cap ${q.capacity} carr ${q.carts}×nv${q.cartLevel} ayud ${q.helperLevel}`);
  }
  console.log(`  camiones de chatarra ${s.scrapTrucks} · muelle nv ${s.dockLevel}`);
  console.log(`  total ganado: ${s.totalEarned.toExponential(2)} $ · ingreso ahora: ${s.dollars.toExponential(2)} $ en mano`);
}

for (const p of PROFILES) run(p, Number(process.argv[2] ?? 60));
