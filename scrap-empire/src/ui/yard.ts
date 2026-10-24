// Chatarrería en vista isométrica (2D con bloques que parecen 3D). Solo lee el estado de la simulación.
// Fondo: carretera con los camiones de chatarra. Centro: las líneas de cada zona. Frente: muelle y camiones de expedición.
import { t as tr, zoneName, zoneProduct } from './texts';
import { ECONOMY, ZONES, dockLoad, purchases, scrapPerSecond, zoneCapacity, zoneRate, zoneStatus, type GameState, type ZoneDef } from '../sim/game';
import { block, iso, shade, tile, wheel } from './iso';
import { HELPER_LOOKS, ZONE_LOOKS, type HelperLook } from './look';
import { productIcon } from './icons';
import { PROP_HEIGHT, propIso } from './props';
import {
  HALL,
  HORIZON,
  PORT,
  cityMarkup,
  duskAmount,
  floorDetailsSvg,
  hallBackSvg,
  hallFrameSvg,
  hallInteriorSvg,
  hwayCarIso,
  hwayPoint,
  lampGlowSvg,
  nightAmount,
  portFrontSvg,
  shipSvg,
  scaffoldSvg,
  skySvg,
  spotlightsSvg,
  staticImage,
  terrainSvg,
} from './scenery';
import { TRUCK_SLOTS, agvIso, carIso, forkliftIso, goldenTruckIso, scrapTruckIso, shipTruckBackIso, shipTruckFrontIso, shipTruckIso } from './vehicles';
import { reducedMotion } from './prefs';
import { createMachineLayer, type AgvPose, type CartPose, type FloorFlow, type FloorTile, type MachineLayer } from './machineLayer';

const NS = 'http://www.w3.org/2000/svg';

// Plano del desguace (en baldosas).
const COL_X = [1, 5.5, 10, 14.5, 21.5]; // la quinta columna es el anexo del puerto (zonas 9 y 10)
const ROW_Y = [5, 10];
const SIZE = 3.5;
const BELT_Y = [4.0, 9.0];
const DOCK_Y = 15;
const BACK_Y = -2.6;
const FRONT_Y = 17.2;
const PILE = { x: 2.2, y: 1.9 };
const TRUCK_PARK_X = 7.5;
/** Pasillo de las carretillas de cada línea del anexo: la 9 descarga en el andén y la 10 en el muelle del barco. */
const ANNEX_LANE_X = [24.8, 26.0];

function fmtShort(n: number): string {
  if (n < 1000) return String(Math.floor(n));
  const units = ['K', 'M', 'B', 'T'];
  let i = -1;
  while (n >= 1000 && i < units.length - 1) {
    n /= 1000;
    i++;
  }
  return n.toFixed(n < 10 ? 1 : 0) + units[i];
}

function station(i: number): { x: number; y: number; row: number; col: number } {
  const row = i < 4 ? 0 : i < 8 ? 1 : i - 8;
  const col = i < 8 ? i % 4 : 4;
  return { x: COL_X[col], y: ROW_Y[row], row, col };
}

/** Esquinas en pantalla de un rectángulo del suelo (lo mismo que dibuja `tile()`). */
function tilePts(x: number, y: number, w: number, d: number, z = 0): [number, number][] {
  return [iso(x, y, z), iso(x + w, y, z), iso(x + w, y + d, z), iso(x, y + d, z)];
}

/** Punto del suelo en píxeles del mapa. */
function isoXY(x: number, y: number): { x: number; y: number } {
  const [px, py] = iso(x, y);
  return { x: px, y: py };
}

function at(x: number, y: number, z = 0): string {
  const [a, b] = iso(x, y, z);
  return `translate(${a.toFixed(1)} ${b.toFixed(1)})`;
}

// ---- Piezas ----

/** Ayudante o trabajador hecho de bloques. */
export function personIso(look: HelperLook): string {
  const { base, torso } = personParts(look);
  return `${base}<g class="torso">${torso}</g>`;
}

/** La persona en dos piezas: sombra y piernas (fijas) y el torso con la cabeza (se mueve al trabajar). */
export function personParts(look: HelperLook): { base: string; torso: string } {
  const { skin, hair, gear, accessory } = look;
  let top = block(0.0, -0.02, 1.0, 0.32, 0.28, 0.08, hair);
  let extra = '';
  switch (accessory) {
    case 'hardhat':
      top = block(-0.04, -0.06, 1.0, 0.4, 0.36, 0.1, gear) + block(0.04, 0.0, 1.1, 0.24, 0.22, 0.06, gear);
      break;
    case 'helmet':
      top = block(-0.03, -0.03, 0.82, 0.38, 0.32, 0.3, gear) + block(0.12, -0.03, 1.12, 0.08, 0.32, 0.01, '#fff');
      break;
    case 'cap':
      top = block(0.0, -0.02, 1.0, 0.32, 0.28, 0.08, gear) + block(0.04, 0.26, 1.0, 0.24, 0.14, 0.03, gear);
      break;
    case 'glasses':
      top = block(-0.04, -0.06, 1.0, 0.4, 0.36, 0.1, gear);
      extra = block(0.04, 0.245, 0.86, 0.24, 0.01, 0.06, '#2a1d14');
      break;
    case 'goggles':
      extra = block(0.0, 0.25, 0.94, 0.32, 0.02, 0.05, gear);
      break;
    case 'bandana':
      extra = block(-0.01, -0.01, 0.95, 0.34, 0.3, 0.06, gear);
      break;
    case 'beard':
      extra = block(0.04, 0.245, 0.75, 0.24, 0.04, 0.1, hair);
      break;
    case 'spiky':
      top = block(0.0, -0.02, 1.0, 0.32, 0.28, 0.06, hair) + block(0.05, 0.02, 1.06, 0.08, 0.08, 0.1, hair) + block(0.2, 0.1, 1.06, 0.08, 0.08, 0.12, hair);
      break;
  }
  const [e1x, e1y] = iso(0.1, 0.25, 0.9);
  const [e2x, e2y] = iso(0.21, 0.25, 0.9);
  return {
    base: `<ellipse cx="0" cy="${iso(0.15, 0.12)[1] + 2}" rx="11" ry="5" fill="#000" opacity="0.2"/>
    ${block(0.02, 0.02, 0, 0.12, 0.2, 0.36, '#3b4a6b')}${block(0.18, 0.02, 0, 0.12, 0.2, 0.36, '#3b4a6b')}`,
    torso: `${block(-0.02, -0.02, 0.36, 0.34, 0.26, 0.4, gear)}
    ${block(0.02, 0.0, 0.74, 0.28, 0.25, 0.27, skin)}
    <circle cx="${e1x.toFixed(1)}" cy="${e1y.toFixed(1)}" r="1.1" fill="#2a1d14"/><circle cx="${e2x.toFixed(1)}" cy="${e2y.toFixed(1)}" r="1.1" fill="#2a1d14"/>
    ${top}${extra}`,
  };
}

/** Grado de una máquina: sube uno cada 5 niveles de máquina y la transforma (máximo 6). */
export function machineGrade(level: number): number {
  return Math.min(6, Math.floor(level / 5));
}

/** Piezas que se añaden a la máquina en cada grado (cada 5 niveles): depósitos, segunda chimenea, dorado, neón, corona y aura. */
function gradeExtras(h: number, roof: string, grade: number): string {
  let s = '';
  if (grade >= 1) s += block(-0.2, 0.25, 0, 0.18, 0.6, 0.6, '#5f7d91') + block(-0.2, 0.25, 0.6, 0.18, 0.6, 0.05, '#2a1d14', { edge: false });
  if (grade >= 2) s += block(0.12, 0.78, h, 0.14, 0.14, 0.75, shade(roof, 1)) + block(0.12, 0.4, h + 0.35, 0.14, 0.42, 0.1, '#7a7a7a');
  if (grade >= 3) s += block(-0.04, -0.04, 0, 1.03, 1.18, 0.07, '#f2b705') + block(1.0, 0.25, 0, 0.16, 0.6, 0.6, '#f2b705');
  if (grade >= 4) {
    s += block(0, 1.1, h - 0.12, 0.95, 0.03, 0.06, '#6be3ff', { edge: false });
    const [nx, ny] = iso(0.48, 1.12, h - 0.09);
    s += `<circle class="shimmer" cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="7" fill="#6be3ff" opacity="0.45"/>`;
  }
  if (grade >= 5) {
    const [cx, cy] = iso(0.45, 0.5, h + 0.95);
    s += `<path class="shimmer" d="M${cx.toFixed(1)} ${(cy - 9).toFixed(1)} l2.6 6 l6.4 0.6 l-4.9 4.2 l1.6 6.3 l-5.7 -3.4 l-5.7 3.4 l1.6 -6.3 l-4.9 -4.2 l6.4 -0.6Z" fill="#ffd76a" stroke="#7a4a10" stroke-width="0.9"/>`;
  }
  if (grade >= 6) {
    const [ax, ay] = iso(0.5, 0.55, 0);
    s = `<ellipse class="shimmer" cx="${ax.toFixed(1)}" cy="${(ay + 3).toFixed(1)}" rx="46" ry="21" fill="url(#glow)"/>` + s;
  }
  return s;
}

/** Geometría de las partes que se mueven de una máquina (la capa de canvas las dibuja aparte). */
export interface MachineGeom {
  h: number;
  /** Punto de la chispa, de la chimenea (humo) y de la luz (o null), en píxeles locales de la máquina. */
  spark: [number, number];
  chimney: [number, number];
  lamp: [number, number] | null;
}

/** Variante de dibujo de la máquina: solo cambia con el tramo (0-3) y el grado (cada 5 niveles). */
export function machineVariant(level: number): string {
  return `${Math.min(3, level)}-${machineGrade(level)}`;
}

/**
 * Parte fija de una máquina (sin prensa, engranaje, chispa ni humo) y la geometría de lo que se mueve.
 * `blinkLamp`: la luz lleva la clase que la hace parpadear (en canvas parpadea por código).
 */
export function machineBody(id: string, level: number, blinkLamp = true): { svg: string; plate: string; geom: MachineGeom } {
  const look = ZONE_LOOKS[id] ?? { wall: '#999', roof: '#555' };
  const tier = Math.min(3, level);
  const grade = machineGrade(level);
  const h = [0.7, 0.85, 1.0, 1.1][tier] + grade * 0.05;
  const color = tier === 0 ? '#8a7a6a' : look.wall;
  let s = block(0, 0, 0, 0.95, 1.1, h, color);
  // Boca por donde entra la chatarra.
  s += block(0.25, -0.05, h - 0.25, 0.45, 0.1, 0.2, '#2a1d14');
  if (tier === 0) {
    s += block(0.7, 0.75, h, 0.12, 0.12, 0.35, '#5a4a3a');
    s += `<circle cx="${iso(0.3, 1.1, 0.4)[0]}" cy="${iso(0.3, 1.1, 0.4)[1]}" r="2" fill="#6b4a2b"/>`;
  } else {
    s += block(0, 1.1, 0.06, 0.95, 0.02, 0.12, '#f4c430', { edge: false });
    s += block(0.7, 0.7, h, 0.16, 0.16, 0.5, shade(look.roof, 1));
  }
  let lamp: [number, number] | null = null;
  if (tier >= 2) {
    s += block(0.1, 1.1, 0.3, 0.4, 0.12, 0.35, '#3b4a5a');
    const [lx, ly] = iso(0.3, 0.3, h + 0.05);
    lamp = [lx, ly - 3];
    s += `<circle${blinkLamp ? ' class="lamp"' : ''} cx="${lx.toFixed(1)}" cy="${(ly - 3).toFixed(1)}" r="3.2" fill="#7ee081" stroke="#2a1d14" stroke-width="0.8"/>`;
  }
  if (tier >= 3) {
    s += block(-0.02, -0.02, h, 0.99, 1.14, 0.05, '#f2b705');
    s += block(0.1, 0.1, h + 0.05, 0.14, 0.14, 0.45, '#f2b705');
  }
  s += gradeExtras(h, look.roof, grade);
  const geom: MachineGeom = { h, spark: iso(0.47, -0.04, h - 0.15), chimney: iso(0.78, 0.8, h + (tier === 0 ? 0.35 : 0.5)), lamp };
  // Placa con el producto en la cara frontal.
  const [px, py] = iso(0.62, 1.1, h * 0.5);
  const plate = `<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)}) scale(0.62)"><rect x="-11" y="-10" width="22" height="20" rx="3" fill="#fff3dc" stroke="#2a1d14"/>${productIcon(id)}</g>`;
  return { svg: `<ellipse cx="${iso(0.5, 0.55)[0]}" cy="${iso(0.5, 0.55)[1] + 3}" rx="30" ry="13" fill="#000" opacity="0.15"/>${s}`, plate, geom };
}

/** Máquina de una zona en SVG: cambia con su nivel (0 oxidada, 1 pintada, 2 con panel y luz, 3+ de lujo dorada) y se transforma cada 5 niveles. */
function machineIso(id: string, level: number): string {
  const { svg, plate, geom } = machineBody(id, level);
  const { h } = geom;
  let s = svg;
  // Partes que se mueven cuando la línea trabaja: prensa, engranaje, chispas y humo de la chimenea.
  s += `<g class="press">${block(0.12, 0.22, h, 0.5, 0.45, 0.16, '#3b3b3b')}</g>`;
  const [spx, spy] = geom.spark;
  s += `<g class="fx"><circle class="spark" cx="${spx.toFixed(1)}" cy="${spy.toFixed(1)}" r="3.4" fill="#ffe37a"/>`;
  const gz = h * 0.5;
  s += `<g transform="matrix(-28 14 0 -20 26.6 13.3)"><g transform="translate(0.55 ${gz.toFixed(2)})"><g class="gear" fill="#3b3b3b" stroke="#2a1d14" stroke-width="0.03"><circle r="0.13"/>${[0, 45, 90, 135].map((a) => `<rect x="-0.03" y="-0.19" width="0.06" height="0.38" transform="rotate(${a})"/>`).join('')}<circle r="0.05" fill="#8a8a8a"/></g></g></g>`;
  const [chx, chy] = geom.chimney;
  s += [0, 1, 2].map((k) => `<circle class="puff" cx="${chx.toFixed(1)}" cy="${chy.toFixed(1)}" r="5" fill="#e6dccb" style="animation-delay:${(-k * 0.8).toFixed(1)}s"/>`).join('') + '</g>';
  return s + plate;
}

const MAX_SHOWN = 9;

/** Cuadrícula de máquinas de un puesto según cuántas se ven. */
function machineGrid(n: number): { cols: number; scale: number; dx: number; dy: number } {
  if (n <= 2) return { cols: Math.max(1, n), scale: 1.35, dx: 1.6, dy: 0 };
  if (n <= 4) return { cols: 2, scale: 1.0, dx: 1.55, dy: 0.95 };
  return { cols: 3, scale: 0.78, dx: 1.05, dy: 0.72 };
}

const BELT_ATTR = 'fill="#5a5550" stroke="#2a1d14" stroke-width="0.8"';

/** Chatarra que avanza por las cintas principales (animada, va fuera de la imagen estática). */
function mainFlowSvg(): string {
  const flow = (x0: number, y0: number, x1: number, y1: number) => `<polyline class="flow" points="${iso(x0, y0)[0]},${iso(x0, y0)[1]} ${iso(x1, y1)[0]},${iso(x1, y1)[1]}" fill="none" stroke="#c9a24a" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 14"/>`;
  return `<g id="mainflow" class="belts">${flow(4.6, 4.2, 19, 4.2)}${flow(0.45, 4.0, 0.45, 9.4)}${flow(0.25, 9.2, 19, 9.2)}</g>`;
}

/**
 * Desgaste y luz del suelo, horneado en la imagen estática (no cuesta nada al jugar): brillo diagonal, borde más oscuro,
 * manchas de aceite, marcas de ruedas, motas de polvo y franja de peligro junto al muelle.
 */
function floorWearSvg(): string {
  let seed = 7;
  const rnd = (): number => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  let o = `<defs><linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6dc" stop-opacity="0.2"/><stop offset="0.45" stop-color="#fff6dc" stop-opacity="0"/><stop offset="1" stop-color="#3a1f08" stop-opacity="0.16"/></linearGradient>
    <radialGradient id="edge"><stop offset="0.62" stop-color="#3a2410" stop-opacity="0"/><stop offset="1" stop-color="#3a2410" stop-opacity="0.26"/></radialGradient>
    <pattern id="hz" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="14" fill="#f4c430"/><rect x="7" width="7" height="14" fill="#2a1d14"/></pattern></defs>`;
  o += tile(-0.6, -0.6, 20, 15.6, 'fill="url(#edge)"');
  o += tile(-0.6, -0.6, 20, 15.6, 'fill="url(#sheen)"');
  for (let i = 0; i < 44; i++) {
    const [x, y] = iso(rnd() * 19, rnd() * 14.5);
    const rx = 6 + rnd() * 16;
    o += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx / 2).toFixed(1)}" fill="#2a1a0c" opacity="${(0.05 + rnd() * 0.07).toFixed(2)}"/>`;
  }
  for (const [x0, y0, x1, y1] of [[0.9, 8.55, 18.2, 8.55], [1.0, 14.15, 18.2, 14.15], [-0.4, 3.4, -0.4, 9.6]]) {
    for (let k = 0; k < 2; k++) {
      const o2 = (k - 0.5) * 0.18;
      const [ax, ay] = iso(x0 + (x0 === x1 ? o2 : 0), y0 + (y0 === y1 ? o2 : 0));
      const [bx, by] = iso(x1 + (x0 === x1 ? o2 : 0), y1 + (y0 === y1 ? o2 : 0));
      o += `<polyline points="${ax.toFixed(1)},${ay.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}" stroke="#1a1008" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="${(30 + rnd() * 40).toFixed(0)} ${(10 + rnd() * 30).toFixed(0)}" opacity="0.1" fill="none"/>`;
    }
  }
  for (let i = 0; i < 380; i++) {
    const [x, y] = iso(rnd() * 19.2 - 0.4, rnd() * 15 - 0.4);
    o += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.5 + rnd() * 0.9).toFixed(1)}" fill="${rnd() > 0.5 ? '#7a6a52' : '#f5ead0'}" opacity="${(0.18 + rnd() * 0.2).toFixed(2)}"/>`;
  }
  o += tile(0.2, DOCK_Y - 0.22, 19, 0.16, 'fill="url(#hz)" stroke="#2a1d14" stroke-width="0.8"');
  return o;
}

function staticYard(): string {
  let s = '';
  // Carretera de atrás y valla.
  s += tile(-10, BACK_Y - 1.6, 44, 3.4, 'fill="#5b4632"');
  s += `<polyline points="${[iso(-10, BACK_Y - 0.85), iso(34, BACK_Y - 0.85)].map((p) => p.join(',')).join(' ')}" stroke="#e8d3a8" stroke-width="2" stroke-dasharray="12 10" opacity="0.6"/>`;
  // Suelo del desguace con baldosas.
  s += tile(-0.6, -0.6, 20, 15.6, 'fill="#cdbba0" stroke="#2a1d14" stroke-width="1.2"');
  // Anexo del puerto: suelo de las zonas 9 (tren) y 10 (barco), con sus cintas.
  s += tile(19.4, -0.6, 7.4, 15.6, 'fill="#c2b092" stroke="#2a1d14" stroke-width="1.2"');
  s += floorDetailsSvg();
  for (let x = 0; x <= 19; x++) s += `<polyline points="${[iso(x - 0.6, -0.6), iso(x - 0.6, 15)].map((p) => p.join(',')).join(' ')}" stroke="#b9a587" stroke-width="0.7"/>`;
  for (let y = 0; y <= 15; y++) s += `<polyline points="${[iso(-0.6, y - 0.6), iso(19.4, y - 0.6)].map((p) => p.join(',')).join(' ')}" stroke="#b9a587" stroke-width="0.7"/>`;
  s += floorWearSvg();
  for (let x = -0.6; x < 19.4; x += 0.8) s += block(x, -0.9, 0, 0.12, 0.12, 0.55, '#8a7a6a');
  s += block(-0.6, -0.86, 0.38, 20, 0.04, 0.06, '#8a7a6a', { edge: false });
  // Cintas que reparten la chatarra desde la pila.
  s += tile(4.6, BELT_Y[0], 20.9, 0.4, BELT_ATTR);
  s += tile(0.25, 4.0, 0.4, 5.4, BELT_ATTR);
  s += tile(0.25, BELT_Y[1], 25.25, 0.4, BELT_ATTR);
  // Rutas pintadas de los AGV.
  for (const [x0, y0, x1, y1] of [[-0.25, 3.2, -0.25, 9.8], [0.9, 8.7, 18.2, 8.7], [1.0, 14.3, 18.2, 14.3]]) {
    s += `<polyline points="${iso(x0, y0)[0]},${iso(x0, y0)[1]} ${iso(x1, y1)[0]},${iso(x1, y1)[1]}" stroke="#3f8fc4" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round" opacity="0.7" fill="none"/>`;
  }
  // Pasillos de las carretillas.
  for (const c of COL_X.slice(0, 4)) s += tile(c + 3.75, 4.6, 0.5, 10.2, 'fill="#f4c430" opacity="0.18"');
  // Muelle de carga.
  s += block(0.2, DOCK_Y, 0, 19, 1.4, 0.3, '#8a6a4a');
  // Estaciones propias del anexo: andén del tren (zona 9) y muelle del barco (zona 10), cada una al final de su pasillo.
  s += block(24.2, DOCK_Y, 0, 1.2, 1.4, 0.3, '#6f6a62');
  s += block(25.4, DOCK_Y, 0, 1.4, 1.4, 0.3, '#4f6f86');
  s += tile(24.3, DOCK_Y + 0.1, 1.0, 1.2, 'fill="none" stroke="#f4c430" stroke-width="1.4" stroke-dasharray="5 3"', 0.3);
  s += tile(25.5, DOCK_Y + 0.1, 1.2, 1.2, 'fill="none" stroke="#f4c430" stroke-width="1.4" stroke-dasharray="5 3"', 0.3);
  for (const x of ANNEX_LANE_X) s += tile(x - 0.25, 4.6, 0.5, 10.2, 'fill="#f4c430" opacity="0.18"');
  // Carretera de delante.
  s += tile(-10, FRONT_Y - 0.6, 44, 3.4, 'fill="#5b4632"');
  s += `<polyline points="${[iso(-10, FRONT_Y + 1.1), iso(30, FRONT_Y + 1.1)].map((p) => p.join(',')).join(' ')}" stroke="#e8d3a8" stroke-width="2" stroke-dasharray="12 10" opacity="0.6"/>`;
  return s;
}

/** Contorno del montón de la pila (puntos del mapa desde su esquina de atrás). */
const PILE_MOUND: [number, number][] = [[0, 1.6], [1.2, 0.2], [2.6, 0.2], [3.8, 1.4], [3.8, 2.8], [2.4, 3.8], [0.6, 3.6]];

/** Zona que se toca de la pila (transparente): con la capa de canvas, la pila se dibuja allí y aquí solo queda esto. */
function pileHitIso(): string {
  const [cx, cy] = iso(PILE.x, PILE.y);
  const [ex, ey] = iso(2, 2);
  return `<g class="pile-hit" fill="transparent"><ellipse cx="${ex - cx}" cy="${ey - cy}" rx="${3 * 28}" ry="${3 * 14}"/><polygon points="${PILE_MOUND.map(([x, y]) => iso(x, y)).map(([a, b]) => `${(a - cx).toFixed(1)},${(b - cy - 10).toFixed(1)}`).join(' ')}"/></g>`;
}

function pileIso(): string {
  const [cx, cy] = iso(PILE.x, PILE.y);
  const junk = [
    [1.0, 0.6, 0.3, 0.7, 0.5, 0.3, '#5f7d91'],
    [2.2, 1.0, 0.5, 0.6, 0.6, 0.4, '#b5523b'],
    [1.4, 1.8, 0.6, 0.8, 0.5, 0.3, '#9aa5ab'],
    [2.6, 2.3, 0.2, 0.6, 0.7, 0.3, '#c9a24a'],
    [1.6, 1.2, 1.0, 0.5, 0.5, 0.35, '#7d8b6a'],
    [0.6, 2.2, 0.2, 0.5, 0.6, 0.4, '#8c7b6b'],
  ] as const;
  const mound = PILE_MOUND.map(([x, y]) => iso(x, y));
  const [hx, hy] = iso(2, 2, 1.6);
  return `<g transform="translate(${-cx} ${-cy})">
    <ellipse cx="${iso(2, 2)[0]}" cy="${iso(2, 2)[1]}" rx="${3 * 28}" ry="${3 * 14}" fill="#000" opacity="0.15"/>
    <polygon points="${mound.map(([a, b]) => `${a},${b}`).join(' ')}" fill="#7a6d60" stroke="#2a1d14" stroke-width="1.2"/>
    <path d="M${iso(0.6, 1.8)[0]} ${iso(0.6, 1.8)[1]} Q${hx} ${hy - 30} ${iso(3.6, 2.2)[0]} ${iso(3.6, 2.2)[1]}" fill="#8a7b6c" stroke="#2a1d14" stroke-width="1.2"/>
    ${junk.map(([x, y, z, w, d, h, c]) => block(x, y, z, w, d, h, c)).join('')}
    ${wheel(2.0, 2.6, 0.3)}
  </g>`;
}

// ---- Escena ----

export interface Yard {
  el: SVGSVGElement;
  update(state: GameState): void;
  pop(text: string, where: 'pile' | 'dock'): void;
  /** Se llama con el id de la zona («crusher»…), «dock» o «trucks» al tocar un puesto. */
  onSelect(cb: (sel: string) => void): void;
  /** Resalta el puesto abierto en el panel (o ninguno). */
  setSelected(sel: string | null): void;
  /** Mueve la cámara para que el puesto quede en la parte de arriba, sobre el panel abierto. */
  focus(sel: string): void;
  /** Calidad baja: sin nubes, pájaros, autopista ni tren (menos que dibujar en móviles flojos). */
  setLowQuality(low: boolean): void;
  /** Animación de subida de nivel en un puesto. `big` para las de máquina (cada 5 niveles). */
  celebrate(zoneId: string, text: string, big: boolean): void;
}

/** Envolvente convexa de puntos (para el contorno de una caja isométrica). */
function hull(points: [number, number][]): [number, number][] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: [number, number][]) => {
    const out: [number, number][] = [];
    for (const p of list) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], p) <= 0) out.pop();
      out.push(p);
    }
    out.pop();
    return out;
  };
  return [...half(pts), ...half([...pts].reverse())];
}

/** Contorno (como texto de puntos SVG) de una caja del suelo con altura. */
function boxOutline(x: number, y: number, w: number, d: number, h: number): string {
  const corners: [number, number][] = [];
  for (const z of [0, h]) for (const [cx, cy] of [[x, y], [x + w, y], [x + w, y + d], [x, y + d]]) corners.push(iso(cx, cy, z));
  return hull(corners).map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ');
}

interface Obj {
  el: SVGGElement;
  depth: number;
}

export function createYard(container: HTMLElement): Yard {
  // Dos SVG con una capa de canvas en medio (las máquinas, con PixiJS): detrás el cielo, el suelo y la nave;
  // delante lo demás (pila, trabajadores, carretillas, vehículos, noche y rótulos). El de delante recibe los toques.
  const svgBack = document.createElementNS(NS, 'svg');
  svgBack.setAttribute('class', 'yard yard-back');
  svgBack.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'yard yard-front');
  const city = cityMarkup();
  const hallBox = [-500, -170, 1140, 600] as const;
  const defs = `<defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset="0.5" stop-color="#f2b705"/><stop offset="1" stop-color="#b07d00"/></linearGradient>
    <radialGradient id="ao"><stop offset="0" stop-color="#1a1008" stop-opacity="0.5"/><stop offset="0.6" stop-color="#1a1008" stop-opacity="0.22"/><stop offset="1" stop-color="#1a1008" stop-opacity="0"/></radialGradient>
    <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3d0" stop-opacity="0.18"/><stop offset="0.5" stop-color="#fff3d0" stop-opacity="0"/><stop offset="1" stop-color="#1a1530" stop-opacity="0.16"/></linearGradient></defs>`;
  svgBack.innerHTML = `${defs}
    ${skySvg()}
    <g id="clouds"></g>
    ${staticImage(city.base, -1900, HORIZON - 380, 3800, 480)}
    <g id="cityLit" opacity="0">${staticImage(city.lit, -1900, HORIZON - 380, 3800, 480)}</g>
    <g id="hway"></g>
    <g id="birds"></g>
    ${staticImage(terrainSvg(), -1900, HORIZON, 3800, 1250)}
    <g id="water"></g>
    ${staticImage(staticYard(), -900, -260, 2000, 1060)}
    ${mainFlowSvg()}
    <g id="ground"></g>
    <g id="back"></g>
    ${staticImage(hallBackSvg(), ...hallBox)}
    ${staticImage(hallInteriorSvg(), ...hallBox)}`;
  svg.innerHTML = `${defs}
    <g id="objects"></g>
    <g id="hits"></g>
    ${staticImage(hallFrameSvg(), ...hallBox)}
    <g id="front"></g>
    <g id="train"></g>
    <g id="ship"></g>
    ${staticImage(portFrontSvg(), -900, 200, 1800, 760)}
    <polygon points="${boxOutline(HALL.x0, HALL.y0, HALL.x1 - HALL.x0, HALL.y1 - HALL.y0, HALL.wall)}" fill="url(#sun)" pointer-events="none"/>
    <g id="lampglow" opacity="0" pointer-events="none">${lampGlowSvg()}</g>
    <rect id="duskR" x="-4000" y="-1700" width="8000" height="5000" fill="#ff8a3c" opacity="0" pointer-events="none"/>
    <path id="nightR" fill-rule="evenodd" fill="#0b1738" opacity="0" pointer-events="none" d="M-4000 -1700 H4000 V3300 H-4000Z ${boxOutline(HALL.x0, HALL.y0, HALL.x1 - HALL.x0, HALL.y1 - HALL.y0, HALL.wall).split(' ').map((q, i) => (i ? 'L' : 'M') + q.replace(',', ' ')).join(' ')}Z"/>
    <polygon id="nightHall" points="${boxOutline(HALL.x0, HALL.y0, HALL.x1 - HALL.x0, HALL.y1 - HALL.y0, HALL.wall)}" fill="#0b1738" opacity="0" pointer-events="none"/>
    <g id="spots" opacity="0" pointer-events="none">${spotlightsSvg()}</g>
    <g id="labels"></g>
    <g id="pops"></g>`;
  container.appendChild(svgBack);
  container.appendChild(svg);
  const q = (id: string) => (svg.querySelector<SVGGElement>('#' + id) ?? svgBack.querySelector<SVGGElement>('#' + id))!;
  /** Capa de canvas de las máquinas (null mientras arranca o si WebGL no va: entonces se dibujan en SVG). */
  let gpu: MachineLayer | null = null;
  let lowQ = false;
  const back = q('back');
  const objectsG = q('objects');
  const front = q('front');
  const labels = q('labels');
  const pops = q('pops');
  const clouds = q('clouds');
  const birds = q('birds');
  const mainFlow = q('mainflow');

  const mk = (parent: SVGGElement, html: string, cls = ''): SVGGElement => {
    const g = document.createElementNS(NS, 'g');
    if (cls) g.setAttribute('class', cls);
    g.innerHTML = html;
    parent.appendChild(g);
    return g;
  };

  /** Muestra la variante `key` de un objeto móvil. Cada variante se dibuja una sola vez y luego solo se enseña u oculta:
   * así no se destruyen y recrean nodos en cada fotograma (eso hacía parpadear los vehículos en el móvil). */
  const variants = new WeakMap<SVGGElement, { cur: SVGGElement | null; map: Map<string, SVGGElement> }>();
  const showVariant = (g: SVGGElement, key: string, html: () => string): void => {
    let v = variants.get(g);
    if (!v) variants.set(g, (v = { cur: null, map: new Map() }));
    let el = v.map.get(key);
    if (!el) {
      el = document.createElementNS(NS, 'g');
      el.innerHTML = html();
      g.appendChild(el);
      v.map.set(key, el);
    }
    if (v.cur === el) return;
    // Primero se enseña la nueva y luego se oculta la anterior.
    el.removeAttribute('display');
    v.cur?.setAttribute('display', 'none');
    v.cur = el;
  };

  // Nubes y pájaros del cielo.
  const cloudEls = [0, 1, 2, 3].map((i) => mk(clouds, `<g opacity="${0.5 + (i % 2) * 0.15}" fill="#fff6e6"><ellipse rx="${60 + i * 8}" ry="${14 + (i % 2) * 4}"/><ellipse cx="${-26 + i * 4}" cy="-10" rx="30" ry="14"/><ellipse cx="22" cy="-12" rx="34" ry="15"/></g>`));
  const birdEls = [0, 1, 2, 3, 4].map(() => mk(birds, '<path class="bird" d="M-7 0 Q-3.5 -5 0 0 Q3.5 -5 7 0" fill="none" stroke="#2a1d14" stroke-width="1.6" stroke-linecap="round"/>'));

  // Tráfico de la autopista elevada del fondo: dos carriles, cada uno a su velocidad y con huecos iguales.
  const hway = q('hway');
  const HWAY_COLORS = ['#c0392b', '#2f6fb3', '#e8e0d0', '#3fa7a0', '#d4a72c', '#4a4a4a'];
  const hwayCars = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const rev = i % 2 === 1;
    return { g: mk(hway, hwayCarIso(HWAY_COLORS[(i * 5) % HWAY_COLORS.length], rev)), rev, off: Math.floor(i / 2) * 27, v: rev ? -0.5 : 0.5, speed: rev ? 4.2 : 3.4 };
  });

  // Agua del puerto: destellos que parpadean.
  const water = q('water');
  water.innerHTML = Array.from({ length: 14 }, (_, k) => {
    const x = -24 + ((k * 37) % 70);
    const y = PORT.quayY + 1.2 + ((k * 13) % 9);
    return `<polyline class="shimmer" points="${iso(x, y)[0]},${iso(x, y)[1]} ${iso(x + 1.4, y)[0]},${iso(x + 1.4, y)[1]}" stroke="#e6f6ff" stroke-width="1.6" fill="none" style="animation-delay:${(-k * 0.37).toFixed(2)}s"/>`;
  }).join('');

  // Barco: zarpa al enviarse el cargamento y vuelve vacío.
  const ship = mk(q('ship'), shipSvg());

  // Tren de mercancías que pasa de vez en cuando por la vía de delante.
  const train = mk(
    q('train'),
    (() => {
      const y = PORT.trackY + 0.2;
      let t = block(0, y, 0.2, 2.4, 1.1, 1.0, '#c0392b') + block(1.7, y, 1.2, 0.9, 1.1, 0.7, '#e8e0d0') + block(0.2, y + 0.3, 1.2, 0.5, 0.5, 0.3, '#3b3b3b');
      const cols = ['#c0392b', '#2f6fb3', '#d4a72c', '#3fa7a0', '#6b5a8a', '#e8e0d0'];
      for (let k = 0; k < 6; k++) t += block(2.7 + k * 2.8, y, 0.2, 2.6, 1.1, 0.35, '#3b3b3b') + block(2.8 + k * 2.8, y + 0.05, 0.55, 2.4, 1.0, 0.95, cols[k % cols.length]);
      return t;
    })(),
  );

  // Pila de chatarra (se toca).
  const pile = mk(objectsG, `${pileHitIso()}<g class="pile-body">${pileIso()}</g>`, 'tappable');
  pile.id = 'pile';
  pile.setAttribute('role', 'button');
  pile.setAttribute('aria-label', tr('map.pileAria'));
  pile.setAttribute('transform', at(PILE.x, PILE.y));
  const pileBody = pile.querySelector<SVGGElement>('.pile-body')!;
  const pileHit = pile.querySelector<SVGGElement>('.pile-hit')!;
  const pileLabel = mk(labels, '', 'tag');
  const hint = mk(labels, `<rect x="-36" y="-12" width="72" height="20" rx="10" fill="#fff6e0" stroke="#2a1d14" stroke-width="1.2"/><text y="2.5" text-anchor="middle" font-size="10" font-weight="800" fill="#2a1d14">${tr('map.touchMe')}</text>`, 'hint');
  hint.setAttribute('pointer-events', 'none');
  {
    const [x, y] = iso(PILE.x + 0.8, PILE.y + 0.8, 2.6);
    hint.setAttribute('transform', `translate(${x} ${y})`);
  }

  /** Parte del mapa que se ve ahora (se actualiza al mover la cámara): lo que queda fuera no se anima. */
  const view = { x0: -1e9, x1: 1e9, y0: -1e9, y1: 1e9 };
  const objs: Obj[] = [{ el: pile, depth: PILE.x + PILE.y + 2 }];

  // Camiones de chatarra (atrás): llegan, se acercan a la pila, vuelcan la caja y se van.
  const scrapTrucks = [0, 1, 2].map(() => mk(back, ''));
  const scrapKey: string[] = ['', '', ''];

  // Tráfico de fondo en las dos carreteras.
  const CAR_COLORS = ['#c0392b', '#2f6fb3', '#e8e0d0', '#3fa7a0', '#d4a72c', '#6b5a8a', '#4a4a4a'];
  /** Aspecto de un coche de fondo desde su clave «color|furgoneta|al revés». */
  const carSvg = (key: string): string => {
    const [color, van, rev] = key.split('|');
    return carIso(color, van === '1', rev === '1');
  };
  const mkCars = (parent: SVGGElement, lanes: { y: number; dir: 1 | -1; speed: number }[], perLane: number) => {
    const list: { g: SVGGElement; key: string; y: number; dir: 1 | -1; speed: number; off: number }[] = [];
    let n = 0;
    for (const lane of lanes)
      for (let i = 0; i < perLane; i++) {
        // Misma velocidad en cada carril y huecos iguales: así nunca se alcanzan ni se atraviesan.
        const key = `${CAR_COLORS[(n * 3 + 1) % CAR_COLORS.length]}|${n % 3 === 2 ? 1 : 0}|${lane.dir < 0 ? 1 : 0}`;
        const g = mk(parent, carSvg(key));
        list.push({ g, key, y: lane.y, dir: lane.dir, speed: lane.speed, off: (i / perLane) * 44 });
        n++;
      }
    return list;
  };
  const backCars = mkCars(back, [{ y: BACK_Y - 1.55, dir: -1, speed: 2.6 }, { y: BACK_Y - 0.7, dir: 1, speed: 3.0 }], 2);
  const frontCars = mkCars(front, [{ y: FRONT_Y + 2.2, dir: 1, speed: 2.8 }], 3);

  // Camión de expedición (delante): carga los productos poco a poco y se va.
  const shipTruck = mk(front, '');
  let shipKey = '';
  let shipMix: string[] = [];
  let shipPhase: 'park' | 'leave' | 'return' = 'park';
  let shipT = 0;
  let shipFill = 0;
  let shipPending = 0;
  let pendingMoney = 0;
  let prevCooldown = -1;
  let lastTime = -1;
  const golden = mk(front, `<g class="bob">${goldenTruckIso()}</g><g class="sparkles" fill="#fffbd1"><path d="M0 -40 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2Z"/><path d="M50 -30 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5Z"/></g>`, 'tappable');
  golden.id = 'golden';
  golden.dataset.action = 'golden';


  // Vehículos guiados (AGV) que llevan contenedores de chatarra por rutas fijas pintadas en el suelo.
  const agvs = [
    { x0: -0.25, y0: 3.2, x1: -0.25, y1: 9.8, speed: 1.1 }, // de la pila al inicio de las cintas
    { x0: 0.9, y0: 8.7, x1: 18.2, y1: 8.7, speed: 1.0 }, // reparte por el pasillo central
    { x0: 18.2, y0: 14.3, x1: 1.0, y1: 14.3, speed: 1.2 }, // pasillo del muelle
  ].map((r) => {
    const g = mk(objectsG, '');
    const o: Obj = { el: g, depth: 0 };
    objs.push(o);
    return { ...r, g, o, key: '' };
  });

  // Líneas de cada zona.
  interface Line {
    def: ZoneDef;
    key: string;
    floor: SVGGElement;
    machines: SVGGElement;
    worker: SVGGElement;
    pallet: SVGGElement;
    label: SVGGElement;
    belts: SVGGElement;
    palletShown: number;
    /** Cuánto está trabajando (0-1), suavizado para que las animaciones arranquen y paren sin saltos. */
    level: number;
    phase: number;
    gearAngle: number;
    press: SVGElement[];
    gears: SVGElement[];
    fx: SVGElement[];
    flows: SVGElement[];
    torso: SVGElement | null;
    stat: SVGTextElement | null;
    cnt: SVGTextElement | null;
    statText: string;
    cntText: string;
  }
  const floorLayer = q('ground');
  const lines: Line[] = ZONES.map((def, i) => {
    const st = station(i);
    const line: Line = {
      def,
      key: '',
      floor: mk(floorLayer, ''),
      belts: mk(floorLayer, '', 'belts'),
      machines: mk(objectsG, ''),
      worker: mk(objectsG, '', 'worker'),
      pallet: mk(objectsG, ''),
      label: mk(labels, ''),
      palletShown: -1,
      level: 0,
      phase: 0,
      gearAngle: 0,
      press: [],
      gears: [],
      fx: [],
      flows: [],
      torso: null,
      stat: null,
      cnt: null,
      statText: '',
      cntText: '',
    };
    line.worker.setAttribute('transform', at(st.x + 1.3, st.y + 2.3));
    line.pallet.setAttribute('transform', at(st.x + 2.45, st.y + 2.45));
    objs.push({ el: line.machines, depth: st.x + st.y + 1.2 }, { el: line.worker, depth: st.x + st.y + 3.6 }, { el: line.pallet, depth: st.x + st.y + 5.5 });
    return line;
  });

  // Zonas que se tocan para abrir sus mejoras: cada puesto, el muelle (carretillas y carga) y la carretera (camiones de chatarra).
  const hitsG = q('hits');
  const selOutlines = new Map<string, SVGElement>();
  const badges = new Map<string, SVGElement>();
  const addHit = (sel: string, outline: string, badgeAt: [number, number]) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'tappable');
    g.dataset.sel = sel;
    g.innerHTML = `<polygon class="sel" points="${outline}" fill="#ffd76a" fill-opacity="0.12" stroke="#ffd76a" stroke-width="2.4" stroke-dasharray="8 5" display="none"/><polygon points="${outline}" fill="#000" fill-opacity="0"/>`;
    hitsG.appendChild(g);
    selOutlines.set(sel, g.firstElementChild as SVGElement);
    const badge = mk(labels, `<circle r="9" fill="#3fbf5a" stroke="#fff" stroke-width="1.6"/><path d="M-4.5 2.5 L0 -3.5 L4.5 2.5Z" fill="#fff"/>`, 'badge');
    badge.setAttribute('transform', `translate(${badgeAt[0].toFixed(1)} ${badgeAt[1].toFixed(1)})`);
    badge.setAttribute('display', 'none');
    badge.setAttribute('pointer-events', 'none');
    badges.set(sel, badge);
  };
  ZONES.forEach((def, i) => {
    const st = station(i);
    const [bx, by] = iso(st.x + 0.1, st.y + SIZE - 0.1, 0.2);
    addHit(def.id, boxOutline(st.x, st.y, SIZE, SIZE, 2.2), [bx, by - 18]);
  });
  addHit('dock', boxOutline(0.2, DOCK_Y, 19, 1.4, 0.3), iso(19.2, DOCK_Y + 0.7, 0.8));
  addHit('trucks', boxOutline(-6, BACK_Y - 1.4, 24, 3, 0.1), iso(17.5, BACK_Y - 0.2, 0.6));
  for (const [text, x, y] of [[tr('map.trucks'), 5.5, BACK_Y - 0.7], [tr('map.dock'), 16.2, DOCK_Y + 1.7]] as const) {
    const [tx, ty] = iso(x, y, 0.4);
    const tag = mk(labels, `<text text-anchor="middle" font-size="10" font-weight="900" fill="#fff6e0" stroke="#2a1d14" stroke-width="3" paint-order="stroke">${text}</text>`);
    tag.setAttribute('transform', `translate(${tx.toFixed(1)} ${ty.toFixed(1)})`);
    tag.setAttribute('pointer-events', 'none');
  }
  let onSelect: (sel: string) => void = () => {};
  svg.addEventListener('click', (e) => {
    const sel = (e.target as Element).closest<SVGElement>('[data-sel]')?.dataset.sel;
    if (sel) onSelect(sel);
  });

  // Huellas de salida del muelle: una por producto, con sus unidades.
  interface Pad {
    id: string;
    floor: SVGGElement;
    stack: SVGGElement;
    count: SVGGElement;
    countText: SVGTextElement;
    shown: number;
    text: string;
  }
  const PAD_W = 2.0;
  const pads: Pad[] = ZONES.filter((d) => !d.transport).map((def, k) => {
    const px = 0.9 + k * 2.3;
    const py = DOCK_Y + 0.15;
    const look = ZONE_LOOKS[def.id] ?? { wall: '#999', roof: '#555' };
    // Sombra suave bajo las máquinas (oclusión ambiental falsa).
    const [aox, aoy] = iso(px + PAD_W / 2, py + 0.7, 0.3);
    const aoSvg = `<ellipse cx="${aox.toFixed(1)}" cy="${(aoy + 4).toFixed(1)}" rx="${(PAD_W * 30).toFixed(1)}" ry="${(PAD_W * 15).toFixed(1)}" fill="url(#ao)" pointer-events="none"/>`;
    const floor = mk(floorLayer, tile(px, py, PAD_W, 1.1, `fill="${shade(look.wall, 0.8)}" stroke="#f4c430" stroke-width="1.6" stroke-dasharray="6 4"`, 0.3) + aoSvg, 'pad');
    floor.setAttribute('display', 'none');
    const stack = mk(objectsG, '');
    stack.setAttribute('transform', at(px, py));
    objs.push({ el: stack, depth: px + py + 1.4 });
    const count = mk(labels, `<text text-anchor="middle" font-size="11" font-weight="900" fill="#fff6e0" stroke="#2a1d14" stroke-width="3" paint-order="stroke"></text>`);
    const [cx, cy] = iso(px + PAD_W / 2, py + 1.25, 0.3);
    count.setAttribute('transform', `translate(${cx.toFixed(1)} ${cy.toFixed(1)})`);
    count.setAttribute('display', 'none');
    count.setAttribute('pointer-events', 'none');
    return { id: def.id, floor, stack, count, countText: count.firstElementChild as SVGTextElement, shown: -1, text: '' };
  });

  // Carretillas.
  interface Cart {
    g: SVGGElement;
    o: Obj;
    key: string;
    loadN: number;
    /** Viaje de la simulación al que sigue (por identidad), o null si espera junto al palé. */
    bound: { left: number; load: number } | null;
    home: string;
  }
  const carts: Cart[] = [];

  /** Apertura de zona: el andamio se levanta y se desvanece mientras la máquina entra desde arriba. */
  function animateOpening(l: Line, scaffold: string): void {
    if (reducedMotion() || !l.machines.animate) return;
    gpu?.opening(ZONES.indexOf(l.def));
    l.machines.animate(
      [
        { transform: 'translateY(-46px)', opacity: 0 },
        { transform: 'translateY(4px)', opacity: 1, offset: 0.7 },
        { transform: 'translateY(0)', opacity: 1 },
      ],
      { duration: 900, easing: 'ease-out' },
    );
    const ghost = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    ghost.setAttribute('pointer-events', 'none');
    ghost.innerHTML = scaffold;
    l.machines.parentNode?.insertBefore(ghost, l.machines.nextSibling);
    ghost.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-60px)', opacity: 0 }], { duration: 900, easing: 'ease-in' }).onfinish = () => ghost.remove();
  }

  function buildLine(l: Line, state: GameState, i: number, isNext: boolean): void {
    const st = station(i);
    const zone = state.zones[l.def.id];
    const look = ZONE_LOOKS[l.def.id] ?? { wall: '#999', roof: '#555' };
    if (!zone.unlocked) {
      if (gpu) {
        l.floor.innerHTML = '';
        gpu.setFloor(i, [{ pts: tilePts(st.x, st.y, SIZE, SIZE), fill: '#000000', stroke: '#2a1d14', width: 1.2, dash: [6, 5], alpha: isNext ? 0.12 : 0.06 }], []);
      } else l.floor.innerHTML = tile(st.x, st.y, SIZE, SIZE, `fill="#000" opacity="${isNext ? 0.12 : 0.06}" stroke="#2a1d14" stroke-width="1.2" stroke-dasharray="6 5"`);
      l.belts.innerHTML = '';
      l.worker.innerHTML = l.pallet.innerHTML = '';
      l.machines.innerHTML = `<g transform="${at(st.x, st.y)}">${scaffoldSvg(0, 0, SIZE)}</g>`;
      gpu?.setLine(i, [], '', () => ({ svg: '', geom: { h: 0, spark: [0, 0], chimney: [0, 0], lamp: null } }));
      gpu?.setWorker(i, null, '', () => ({ base: '', torso: '' }));
      gpu?.setPallet(i, null, '', () => '');
      l.press = l.gears = l.fx = l.flows = [];
      l.torso = null;
      l.stat = l.cnt = null;
      const [x, y] = iso(st.x + SIZE / 2, st.y + SIZE / 2, 0.4);
      l.label.innerHTML = `<g transform="translate(${x} ${y})" opacity="${isNext ? 1 : 0.6}"><rect x="-10" y="-5" width="20" height="15" rx="3" fill="#c9a24a" stroke="#2a1d14"/><path d="M-6 -5 V-9 Q0 -16 6 -9 V-5" stroke="#2a1d14" stroke-width="2.2" fill="none"/>
        ${isNext ? `<text y="26" text-anchor="middle" font-size="11" font-weight="900" fill="#fff6e0" stroke="#2a1d14" stroke-width="3" paint-order="stroke">${zoneName(l.def)}</text><text y="40" text-anchor="middle" font-size="11" font-weight="900" fill="#ffd76a" stroke="#2a1d14" stroke-width="3" paint-order="stroke">$${fmtShort(l.def.unlockCost)}</text>` : `<text y="24" text-anchor="middle" font-size="9" font-weight="900" fill="#fff6e0" stroke="#2a1d14" stroke-width="3" paint-order="stroke">${tr('map.soon')}</text>`}</g>`;
      return;
    }
    // Suelo del puesto y cintas: en la capa de canvas si está (debajo de las máquinas); si no, en el SVG.
    const floorTiles: FloorTile[] = [
      { pts: tilePts(st.x, st.y, SIZE, SIZE), fill: shade(look.wall, 0.75), alpha: 0.35 },
      { pts: tilePts(st.x + 0.1, st.y + 0.1, SIZE - 0.2, SIZE - 0.2), stroke: '#f4c430', width: 2.2, dash: [7, 6] },
    ];
    const flows: FloorFlow[] = [];
    l.floor.innerHTML = gpu
      ? ''
      : tile(st.x, st.y, SIZE, SIZE, `fill="${shade(look.wall, 0.75)}" opacity="0.35"`) +
        tile(st.x + 0.1, st.y + 0.1, SIZE - 0.2, SIZE - 0.2, 'fill="none" stroke="#f4c430" stroke-width="2.2" stroke-dasharray="7 6"');
    // Las máquinas se ven una a una hasta 9 (cuadrícula de 1-2, 2×2 o 3×3), para que se note la diferencia entre pocas y muchas.
    const n = Math.min(MAX_SHOWN, zone.machines);
    const { cols, scale, dx, dy } = machineGrid(n);
    const cells = Array.from({ length: n }, (_, j) => ({ c: j % cols, r: Math.floor(j / cols) }));
    let belts = '';
    let machines = '';
    for (let c = 0; c < Math.min(cols, n); c++) {
      const mx = st.x + 0.2 + c * dx;
      const [fx0, fy0] = iso(mx + 0.4 * scale + 0.25, BELT_Y[st.row] + 0.4);
      const [fx1, fy1] = iso(mx + 0.4 * scale + 0.25, st.y + 0.3);
      if (gpu) {
        floorTiles.push({ pts: tilePts(mx + 0.4 * scale, BELT_Y[st.row] + 0.4, 0.5, st.y + 0.3 - BELT_Y[st.row] - 0.4), fill: '#5a5550', stroke: '#2a1d14', width: 0.8 });
        flows.push({ a: [fx0, fy0], b: [fx1, fy1], color: look.wall });
        continue;
      }
      belts += tile(mx + 0.4 * scale, BELT_Y[st.row] + 0.4, 0.5, st.y + 0.3 - BELT_Y[st.row] - 0.4, BELT_ATTR);
      belts += `<polyline class="flow" points="${fx0.toFixed(1)},${fy0.toFixed(1)} ${fx1.toFixed(1)},${fy1.toFixed(1)}" fill="none" stroke="${look.wall}" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="4 14"/>`;
    }
    gpu?.setFloor(i, floorTiles, flows);
    // Pintadas de atrás hacia delante.
    cells.sort((a, b) => a.c + a.r - (b.c + b.r));
    if (gpu) {
      const spots = cells.map(({ c, r }) => {
        const [x, y] = iso(st.x + 0.2 + c * dx, st.y + 0.25 + r * dy);
        return { x, y, scale };
      });
      gpu.setLine(i, spots, `${l.def.id}-${machineVariant(zone.machineLevel)}`, () => {
        const m = machineBody(l.def.id, zone.machineLevel, false);
        return { svg: m.svg + m.plate, geom: m.geom };
      });
    } else for (const { c, r } of cells) machines += `<g transform="${at(0.2 + c * dx, 0.25 + r * dy)} scale(${scale})">${machineIso(l.def.id, zone.machineLevel)}</g>`;
    if (zone.machines > MAX_SHOWN) {
      const [bx, by] = iso(2.9, 2.0, 0.1);
      machines += `<g transform="translate(${bx.toFixed(1)} ${by.toFixed(1)})"><rect x="-16" y="-8" width="32" height="15" rx="7" fill="#2a1d14" opacity="0.9"/><text y="3" text-anchor="middle" font-size="9.5" font-weight="900" fill="#ffd76a">+${zone.machines - MAX_SHOWN}</text></g>`;
    }
    l.belts.innerHTML = belts;
    l.machines.innerHTML = `<g transform="${at(st.x, st.y)}">${machines}</g>`;
    // El ayudante del puesto: en la capa de canvas si está (encima de las máquinas); si no, en el SVG.
    const helperLook = HELPER_LOOKS[l.def.helper.id];
    if (gpu) {
      l.worker.innerHTML = '';
      gpu.setWorker(i, { x: iso(st.x + 1.3, st.y + 2.3)[0], y: iso(st.x + 1.3, st.y + 2.3)[1], scale: 1.45 }, l.def.helper.id, () => personParts(helperLook));
    } else l.worker.innerHTML = `<g transform="scale(1.45)">${personIso(helperLook)}</g>`;
    const [lx, ly] = iso(st.x + 0.3, st.y + SIZE + 0.2);
    const extra = zone.machines > 1 ? ` · ${zone.machines} ${tr('map.machShort')}` : '';
    l.label.innerHTML = `<g transform="translate(${lx} ${ly})"><text text-anchor="middle" font-size="10" font-weight="900" fill="#fff6e0" stroke="#2a1d14" stroke-width="3" paint-order="stroke">${zoneProduct(l.def)}${extra}</text></g>
      <g class="lvl" transform="translate(${iso(st.x + 1.3, st.y + 2.3, 2.75)[0]} ${iso(st.x + 1.3, st.y + 2.3, 2.75)[1]})"><rect x="-17" y="-9" width="34" height="15" rx="7.5" fill="#2a1d14" opacity="0.85"/><text y="2.5" text-anchor="middle" font-size="9" font-weight="900" fill="#ffd76a"></text></g>`;
    l.palletShown = -1;
    l.press = [...l.machines.querySelectorAll<SVGElement>('.press')];
    l.gears = [...l.machines.querySelectorAll<SVGElement>('.gear')];
    l.fx = [...l.machines.querySelectorAll<SVGElement>('.fx')];
    l.flows = [...l.belts.querySelectorAll<SVGElement>('.flow')];
    l.torso = l.worker.querySelector<SVGElement>('.torso');
    l.stat = l.label.querySelector<SVGTextElement>('.stat');
    l.cnt = l.label.querySelector<SVGTextElement>('.cnt');
    l.statText = l.cntText = '';
  }

  let lastDepthOrder = '';
  let lastRailSent = -1;
  let lastSeaSent = -1;
  let seaStart = -1e9;
  let railStart = -1e9;
  let lastHourCheck = -1;
  let lastSparkCheck = -1;
  let sparksInSvg = true;
  let spkOn = false;
  let pileShown = '';
  let pileScaleShown = '';
  let pileText: SVGTextElement | null = null;
  let lastBadgeCheck = -1;
  let lastEarned = -1;
  let mainLevel = 0;

  // Un viaje de carretilla dura CYC s: ir (MOVE), girar en el muelle (TURN), volver (MOVE) y girar junto al palé (TURN).
  const MOVE = 4.2; // CYC = 10 s, lo que tarda el viaje de una carretilla en la simulación (`economy.json`)
  const TURN = 0.8;
  const CYC = 2 * MOVE + 2 * TURN;
  const lerp = (a: number, b: number, f: number) => a + (b - a) * Math.min(1, Math.max(0, f));

  function cartPose(u: number, p0: { x: number; y: number }, ax: number): { x: number; y: number; ang: number; phase: 0 | 1 | 2 | 3 } {
    const legA = ax - p0.x;
    const legB = DOCK_Y - 0.9 - p0.y;
    const total = legA + legB;
    const at2 = (d: number) => (d < legA ? { x: p0.x + d, y: p0.y } : { x: ax, y: p0.y + (d - legA) });
    const w = 0.6;
    if (u < MOVE) {
      const d = (u / MOVE) * total;
      return { ...at2(d), ang: lerp(0, Math.PI / 2, (d - legA + w) / (2 * w)), phase: 0 };
    }
    if (u < MOVE + TURN) return { ...at2(total), ang: Math.PI / 2 + Math.PI * ((u - MOVE) / TURN), phase: 1 };
    if (u < 2 * MOVE + TURN) {
      const d = (1 - (u - MOVE - TURN) / MOVE) * total;
      return { ...at2(d), ang: lerp((3 * Math.PI) / 2, Math.PI, (legA - d + w) / (2 * w)), phase: 2 };
    }
    return { ...at2(0), ang: Math.PI + Math.PI * ((u - 2 * MOVE - TURN) / TURN), phase: 3 };
  }

  function update(state: GameState): void {
    const t = state.time;
    const nextLocked = ZONES.find((z) => !state.zones[z.id].unlocked)?.id ?? '';
    const working = state.scrap > 0.01 || state.scrapTrucks > 0;
    const dtv = lastTime < 0 ? 0 : Math.min(0.25, Math.max(0, t - lastTime));
    lastTime = t;

    // Hora del día real (o ?hora=22 para probar): cielo, luces y noche.
    const nowMs = performance.now();
    if (nowMs - lastHourCheck > 2000 || lastHourCheck < 0) {
      lastHourCheck = nowMs;
      const forced = Number(new URLSearchParams(location.search).get('hora'));
      const d = new Date();
      const hour = Number.isFinite(forced) && new URLSearchParams(location.search).has('hora') ? forced : d.getHours() + d.getMinutes() / 60;
      const night = nightAmount(hour);
      const dusk = duskAmount(hour);
      q('skyNightR').setAttribute('opacity', night.toFixed(3));
      q('skyDuskR').setAttribute('opacity', Math.min(1, dusk * (1 - night * 0.6)).toFixed(3));
      q('duskR').setAttribute('opacity', (dusk * 0.14).toFixed(3));
      q('nightR').setAttribute('opacity', (night * 0.55).toFixed(3));
      q('nightHall').setAttribute('opacity', (night * 0.24).toFixed(3));
      q('spots').setAttribute('opacity', Math.min(1, night * 1.6 + dusk * 0.5).toFixed(3));
      q('cityLit').setAttribute('opacity', Math.min(1, night * 1.6 + dusk * 0.5).toFixed(3));
      q('lampglow').setAttribute('opacity', Math.min(1, night * 1.5 + dusk * 0.6).toFixed(3));
      clouds.setAttribute('opacity', (1 - night * 0.8).toFixed(2));
      birds.setAttribute('opacity', (1 - night).toFixed(2));
    }
    // Autopista y tren.
    hwayCars.forEach((c) => {
      const run = (((c.off + (c.rev ? -1 : 1) * t * c.speed) % 108) + 108) % 108;
      const [x, y, z] = hwayPoint(-52 + run, c.v);
      c.g.setAttribute('transform', at(x, y, z));
    });
    // Con la zona de vagones abierta, el tren pasa solo cuando sale cargado; antes pasa de adorno cada cierto tiempo.
    const railSent = state.transports.rail.sent;
    if (lastRailSent >= 0 && railSent > lastRailSent && t - railStart >= PORT.trainPeriod) railStart = t;
    lastRailSent = railSent;
    const trainPos = state.zones.wagons?.unlocked
      ? t - railStart < PORT.trainPeriod
        ? -48 + ((t - railStart) / PORT.trainPeriod) * 130
        : 400
      : -48 + ((t % PORT.trainPeriod) / PORT.trainPeriod) * 130;
    train.setAttribute('transform', at(trainPos, 0));
    // Barco: sale hacia la derecha (6 s), está fuera y vuelve por la izquierda (6 s).
    const seaSent = state.transports.sea.sent;
    if (lastSeaSent >= 0 && seaSent > lastSeaSent && t - seaStart >= 14) seaStart = t;
    lastSeaSent = seaSent;
    const sa = t - seaStart;
    const shipX = sa < 0 || sa >= 14 ? 0 : sa < 6 ? (sa / 6) ** 2 * 60 : sa < 8 ? 400 : -60 + (1 - (1 - (sa - 8) / 6) ** 2) * 60;
    ship.setAttribute('transform', at(shipX, 0));
    // Cielo: nubes y pájaros.
    // Cambiar la clase del svg obliga a recalcular los estilos de todo el mapa: solo se hace si quedan chispas en el SVG
    // (con la capa de canvas, las chispas de las máquinas van allí y en el SVG no queda ninguna).
    if (nowMs - lastSparkCheck > 2000) {
      lastSparkCheck = nowMs;
      sparksInSvg = svg.querySelector('.spark') !== null || svgBack.querySelector('.spark') !== null;
    }
    const spk = sparksInSvg && Math.floor(t / 0.14) % 2 === 1;
    if (spk !== spkOn) {
      spkOn = spk;
      svg.classList.toggle('spk', spk);
      svgBack.classList.toggle('spk', spk);
    }
    cloudEls.forEach((g, i) => g.setAttribute('transform', `translate(${(((t * 2.5 + i * 700) % 2800) - 1200).toFixed(1)} ${HORIZON - 190 - i * 38})`));
    birdEls.forEach((g, i) => g.setAttribute('transform', `translate(${(((t * (16 + i * 3) + i * 520) % 2600) - 1100).toFixed(1)} ${(HORIZON - 120 - i * 34 + Math.sin(t * 1.3 + i) * 10).toFixed(1)})`));
    mainLevel += ((working ? 1 : 0) - mainLevel) * Math.min(1, dtv * (working ? 6 : 1.4));
    mainFlow.style.display = mainLevel > 0 ? '' : 'none';
    mainFlow.style.opacity = (0.95 * mainLevel).toFixed(2);

    // Pila.
    const s = 0.85 + Math.min(0.3, Math.log10(1 + state.scrap) / 10);
    // Solo se toca si cambia (antes se reescribía en cada fotograma); con la capa de canvas, la pila se dibuja allí.
    const pileScale = s.toFixed(3);
    if (pileScale !== pileScaleShown) {
      pileScaleShown = pileScale;
      pileBody.setAttribute('transform', `scale(${pileScale})`);
      pileHit.setAttribute('transform', `scale(${pileScale})`);
      gpu?.setPileScale(s);
    }
    const [plx, ply] = iso(PILE.x + 1.8, PILE.y + 2.6, 0);
    // El rótulo solo se toca si cambia el texto (antes se rehacía en cada fotograma).
    const pileTxt = state.scrap >= 1 ? tr('map.scrapPile', { n: fmtShort(state.scrap) }) : `+${fmtShort(scrapPerSecond(state))}/s`;
    if (pileTxt !== pileShown) {
      if (!pileText) {
        pileLabel.innerHTML = `<text x="${plx}" y="${ply}" text-anchor="middle" font-size="11" font-weight="900" fill="#fff6e0" stroke="#2a1d14" stroke-width="3" paint-order="stroke"></text>`;
        pileText = pileLabel.querySelector('text');
      }
      pileShown = pileTxt;
      if (pileText) pileText.textContent = pileTxt;
    }
    hint.setAttribute('visibility', state.scrapTrucks === 0 ? 'visible' : 'hidden');

    // Camiones de chatarra: llegan por detrás, maniobran hasta la pila, vuelcan la caja y se van vacíos.
    const nTrucks = Math.min(3, state.scrapTrucks);
    scrapTrucks.forEach((g, i) => {
      if (i >= nTrucks) return g.setAttribute('visibility', 'hidden');
      const p = (t / 12 + i / nTrucks) % 1;
      const lane = BACK_Y;
      let x = 1.2;
      let y = lane;
      let tilt = 0;
      let slide = 0;
      let dust = 0;
      if (p < 0.3) x = -5 + (p / 0.3) * 6.2;
      else if (p < 0.36) y = lane + ((p - 0.3) / 0.06) * 0.85;
      else if (p < 0.5) {
        y = lane + 0.85;
        tilt = Math.min(1, (p - 0.36) / 0.06) * 0.6;
        slide = Math.min(1, Math.max(0, (p - 0.42) / 0.07));
        dust = slide > 0.9 ? Math.min(1, (p - 0.49) / 0.04) : 0;
      } else if (p < 0.56) {
        y = lane + 0.85;
        tilt = (1 - (p - 0.5) / 0.06) * 0.6;
        slide = 1;
      } else if (p < 0.6) {
        y = lane + 0.85 * (1 - (p - 0.56) / 0.04);
        slide = 1;
      } else {
        x = 1.2 + ((p - 0.6) / 0.4) * 34;
        slide = 1;
      }
      const loaded = p < 0.5;
      const key = `${Math.round(tilt * 30)}|${Math.round(slide * 12)}|${Math.round(dust * 6)}|${loaded ? 1 : 0}`;
      if (scrapKey[i] !== key) {
        scrapKey[i] = key;
        showVariant(g, key, () => scrapTruckIso(tilt, true, slide, dust));
      }
      g.setAttribute('visibility', 'visible');
      g.setAttribute('transform', at(x, y));
    });

    // Tráfico de fondo.
    const drive = (list: typeof backCars) =>
      list.forEach((c) => {
        const run = (((c.off + c.dir * t * c.speed) % 44) + 44) % 44;
        c.g.setAttribute('transform', at(-8 + run, c.y));
      });
    drive(backCars);
    // Los coches de la carretera de delante van en la capa de canvas cuando está.
    if (gpu) {
      gpu.setCars(
        frontCars.map((c) => {
          c.g.setAttribute('visibility', 'hidden');
          const run = (((c.off + c.dir * t * c.speed) % 44) + 44) % 44;
          return { ...isoXY(-8 + run, c.y), key: c.key };
        }),
        carSvg,
      );
    } else drive(frontCars);

    // Líneas.
    const openIds: string[] = [];
    lines.forEach((l, i) => {
      const zone = state.zones[l.def.id];
      if (zone.unlocked && !l.def.transport) openIds.push(l.def.id); // en el camión solo van los productos de camión
      const key = `${zone.unlocked ? 1 : 0}-${zone.machineLevel}-${Math.min(MAX_SHOWN, zone.machines)}-${zone.machines}-${l.def.id === nextLocked ? 1 : 0}`;
      if (key !== l.key) {
        const opening = l.key.startsWith('0-') && zone.unlocked;
        const scaffold = opening ? l.machines.innerHTML : '';
        l.key = key;
        buildLine(l, state, i, l.def.id === nextLocked);
        if (opening) animateOpening(l, scaffold);
      }
      if (!zone.unlocked) return;
      const running = working && zone.buffer < zoneCapacity(zone) - 0.01;
      // Arranca rápido y para despacio; así no hay saltos cuando la chatarra llega a golpes.
      l.level += ((running ? 1 : 0) - l.level) * Math.min(1, dtv * (running ? 6 : 1.4));
      if (l.level < 0.004) l.level = 0;
      l.phase += dtv * l.level * 11;
      l.gearAngle = (l.gearAngle + dtv * l.level * 320) % 360;
      const wave = 0.5 + 0.5 * Math.sin(l.phase);
      const [mx, my] = iso(station(i).x + SIZE / 2, station(i).y + SIZE / 2);
      const inView = mx > view.x0 - 130 && mx < view.x1 + 130 && my > view.y0 - 130 && my < view.y1 + 130;
      gpu?.animate(i, l.level, l.phase, l.gearAngle, inView);
      if (inView) {
        for (const e of l.press) e.style.translate = `0 ${(l.level * wave * 7).toFixed(2)}px`;
        for (const e of l.gears) e.style.rotate = `${l.gearAngle.toFixed(1)}deg`;
        const shown = l.level > 0;
        for (const e of l.fx) {
          e.style.display = shown ? '' : 'none';
          e.style.opacity = l.level.toFixed(2);
        }
        for (const e of l.flows) {
          e.style.display = shown ? '' : 'none';
          e.style.opacity = (0.95 * l.level).toFixed(2);
        }
        if (l.torso) l.torso.style.translate = `0 ${(-2 * l.level * (0.5 + 0.5 * Math.sin(l.phase * 1.3))).toFixed(2)}px`;
      }
      const lvl = l.label.querySelector('.lvl text');
      const txt = `${tr('lvl')} ${zone.helperLevel}`;
      if (lvl && lvl.textContent !== txt) lvl.textContent = txt;
      const status = zoneStatus(state, l.def);
      const rate = zoneRate(l.def, zone);
      const statTxt = status === 'starved' ? '✖ sin chatarra' : status === 'full' ? '■ palé lleno' : `▶ ${rate < 10 ? rate.toFixed(1) : fmtShort(rate)}/s`;
      if (l.stat && statTxt !== l.statText) {
        l.statText = statTxt;
        l.stat.textContent = statTxt;
        l.stat.setAttribute('fill', status === 'starved' ? '#ff8a7a' : status === 'full' ? '#ffb347' : '#8be28b');
      }
      const cntTxt = `${Math.floor(zone.buffer)}/${Math.floor(zoneCapacity(zone))}`;
      if (l.cnt && cntTxt !== l.cntText) {
        l.cntText = cntTxt;
        l.cnt.textContent = cntTxt;
      }
      const stack = Math.ceil(Math.min(1, zone.buffer / zoneCapacity(zone)) * 8);
      if (stack !== l.palletShown) {
        l.palletShown = stack;
        const hgt = PROP_HEIGHT[l.def.id] ?? 0.3;
        let h = block(0, 0, 0, 0.8, 0.8, 0.12, '#b07a45');
        for (let k = 0; k < stack; k++) h += `<g transform="${at(0.03 + (k % 2) * 0.4, 0.03 + (Math.floor(k / 2) % 2) * 0.4, 0.12 + Math.floor(k / 4) * hgt)}">${propIso(l.def.id)}</g>`;
        // En la capa de canvas si está (encima de los ayudantes y debajo de las carretillas); si no, en el SVG.
        if (gpu) {
          l.pallet.innerHTML = '';
          const [px, py] = iso(station(i).x + 2.45, station(i).y + 2.45);
          gpu.setPallet(i, { x: px, y: py }, `${l.def.id}-${stack}`, () => `<g transform="scale(1.25)">${h}</g>`);
        } else l.pallet.innerHTML = `<g transform="scale(1.25)">${h}</g>`;
      }
    });

    // Carretillas: cada una atiende una zona abierta. Si hay producto (o la zona está produciendo) sale a trabajar,
    // gira en cada extremo y lleva solo lo que hay; si no, espera junto al palé.
    const open = ZONES.map((z, i) => ({ z, i })).filter(({ z }) => state.zones[z.id].unlocked);
    // Cada línea abierta enseña hasta 3 de sus carretillas (las primeras de cada línea antes); el viaje sigue a la simulación.
    const slots: { z: ZoneDef; i: number; j: number }[] = [];
    for (let j = 0; j < 3; j++) for (const o of open) if (j < state.zones[o.z.id].carts) slots.push({ z: o.z, i: o.i, j });
    const nCarts = Math.min(8, slots.length);
    while (carts.length < nCarts) {
      const g = mk(objectsG, '');
      const o: Obj = { el: g, depth: 0 };
      objs.push(o);
      carts.push({ g, o, key: '', loadN: 0, bound: null, home: '' });
    }
    // Cada carretilla visible sigue a un viaje concreto de la simulación hasta que termina; libre, espera junto al palé y
    // solo coge viajes recién salidos (si no, en las líneas con muchas carretillas siempre cogería el más viejo y haría bucle en el palé).
    const taken = new Set<object>();
    // Con la capa de canvas, las carretillas se dibujan allí (encima de los palés) y las del SVG se quedan ocultas.
    const poses: CartPose[] = [];
    carts.forEach((c, k) => {
      const src = slots[k];
      if (k < nCarts && c.home === src.z.id && c.bound && state.zones[src.z.id].trips.includes(c.bound)) taken.add(c.bound);
      else c.bound = null;
    });
    carts.forEach((c, k) => {
      if (k >= nCarts) {
        c.g.setAttribute('visibility', 'hidden');
        c.o.depth = -99;
        return;
      }
      const src = slots[k];
      c.home = src.z.id;
      const zone = state.zones[src.z.id];
      const st = station(src.i);
      const p0 = { x: st.x + 3.0, y: st.y + 2.7 };
      if (!c.bound) {
        const fresh = zone.trips.find((x) => !taken.has(x) && ECONOMY.carts.tripSeconds - x.left <= 0.6);
        if (fresh) {
          c.bound = fresh;
          taken.add(fresh);
          c.loadN = Math.max(1, Math.min(3, Math.ceil(fresh.load / 10)));
        }
      }
      // El viaje empieza girando junto al palé (donde carga) y da la vuelta al muelle.
      const u = c.bound ? (CYC - TURN + (ECONOMY.carts.tripSeconds - c.bound.left)) % CYC : 0;
      const trip = c.bound !== null;
      const pose = trip ? cartPose(u, p0, src.z.transport ? ANNEX_LANE_X[Math.min(1, src.i - 8)] : st.x + 4.0) : { x: p0.x, y: p0.y, ang: Math.PI, phase: 3 as const };
      const dockMid = MOVE + TURN / 2;
      const midTurn = CYC - TURN / 2;
      const carrying = trip && (u < dockMid || u >= midTurn) ? c.loadN : 0;
      if (gpu) {
        poses.push({ ...isoXY(pose.x, pose.y), ang: pose.ang, zone: src.z.id, loads: carrying });
        c.g.setAttribute('visibility', 'hidden');
        c.o.depth = -99;
        return;
      }
      const key = `${src.z.id}|${Math.round((pose.ang * 18) / Math.PI)}|${carrying}`;
      if (key !== c.key) {
        c.key = key;
        showVariant(c.g, key, () =>
          forkliftIso(
            pose.ang,
            Array.from({ length: carrying }, () => propIso(src.z.id)),
          ),
        );
      }
      c.g.setAttribute('visibility', 'visible');
      c.g.setAttribute('transform', at(pose.x, pose.y));
      c.o.depth = pose.x + pose.y;
    });
    gpu?.setCarts(poses, propIso);

    // Camión de expedición: espera en el muelle mientras se llena, y se va cuando está completo.
    if (prevCooldown >= 0 && state.truckCooldown > prevCooldown + 0.5) {
      shipPending = Math.min(2, shipPending + 1);
      pendingMoney += Math.max(0, state.totalEarned - lastEarned);
    }
    prevCooldown = state.truckCooldown;
    const load = dockLoad(state);
    if (shipPhase === 'park') {
      const target = shipPending > 0 ? 1 : Math.min(1, state.dockUnits / load);
      shipFill = target < shipFill ? target : Math.min(target, shipFill + dtv * 1.4);
      if (shipPending > 0 && shipFill >= 0.999) {
        shipPhase = 'leave';
        shipT = 0;
        shipPending--;
        if (pendingMoney > 0) pop('+$' + fmtShort(pendingMoney), 'dock');
        pendingMoney = 0;
      }
    } else {
      shipT += dtv;
      if (shipT >= 2.4) {
        shipT = 0;
        shipPhase = shipPhase === 'leave' ? 'return' : 'park';
        shipFill = 0;
      }
    }
    lastEarned = state.totalEarned;
    let tx = TRUCK_PARK_X;
    if (shipPhase === 'leave') tx = TRUCK_PARK_X + (shipT / 2.4) * 24;
    else if (shipPhase === 'return') tx = TRUCK_PARK_X - 24 + (shipT / 2.4) * 24;
    const count = shipPhase === 'leave' ? TRUCK_SLOTS : shipPhase === 'return' ? 0 : Math.round(shipFill * TRUCK_SLOTS);
    // La caja se llena con lo que hay en cada huella (a partes proporcionales); al salir conserva lo último que llevaba.
    if (shipPhase === 'park') {
      const total = openIds.reduce((a, id) => a + (state.dockByZone[id] ?? 0), 0);
      shipMix = [];
      if (total > 0) {
        for (const id of openIds) for (let n = Math.round(((state.dockByZone[id] ?? 0) / total) * TRUCK_SLOTS); n > 0; n--) shipMix.push(id);
      }
      if (shipMix.length === 0) shipMix = openIds.slice();
      while (shipMix.length < TRUCK_SLOTS) shipMix.push(shipMix[shipMix.length % Math.max(1, shipMix.length)] ?? openIds[0]);
    }
    const ids = Array.from({ length: count }, (_, k) => shipMix[k] ?? openIds[0]);
    if (gpu) {
      shipTruck.setAttribute('visibility', 'hidden');
      gpu.setShipTruck(isoXY(tx, FRONT_Y), ids, () => ({ back: shipTruckBackIso(), front: shipTruckFrontIso() }), propIso);
    } else {
      const sk = ids.join(',');
      if (sk !== shipKey) {
        shipKey = sk;
        shipTruck.innerHTML = shipTruckIso(ids);
      }
      shipTruck.setAttribute('transform', at(tx, FRONT_Y));
    }

    // Huellas de salida: cuánto hay de cada producto esperando en el muelle.
    const load0 = dockLoad(state);
    for (const pad of pads) {
      const open = state.zones[pad.id].unlocked;
      if (!open) {
        if (pad.shown !== -2) {
          pad.shown = -2;
          pad.floor.setAttribute('display', 'none');
          pad.count.setAttribute('display', 'none');
          pad.stack.innerHTML = '';
        }
        continue;
      }
      const have = state.dockByZone[pad.id] ?? 0;
      const shown = have < 0.5 ? 0 : Math.min(6, Math.ceil(Math.min(1, have / load0) * 6));
      if (shown !== pad.shown) {
        if (pad.shown < 0) {
          pad.floor.removeAttribute('display');
          pad.count.removeAttribute('display');
        }
        pad.shown = shown;
        pad.stack.innerHTML = Array.from({ length: shown }, (_, k) => `<g transform="${at(0.2 + (k % 3) * 0.6, 0.12 + Math.floor(k / 3) * 0.5, 0.3)}">${propIso(pad.id)}</g>`).join('');
      }
      const txt = `×${Math.floor(have)}`;
      if (txt !== pad.text) {
        pad.text = txt;
        pad.countText.textContent = txt;
      }
    }

    // Marca verde en lo que se puede mejorar ahora mismo.
    if (nowMs - lastBadgeCheck > 400) {
      lastBadgeCheck = nowMs;
      const can = new Set<string>();
      for (const p of purchases(state)) if (p.cost <= state.dollars) can.add(p.zoneId ?? (p.kind === 'scrapTruck' ? 'trucks' : 'dock'));
      badges.forEach((b, sel) => b.setAttribute('display', can.has(sel) ? '' : 'none'));
    }

    // Camión dorado.
    if (state.goldenVisible > 0) {
      const p = 1 - state.goldenVisible / ECONOMY.goldenTruck.visibleSeconds;
      golden.setAttribute('visibility', 'visible');
      golden.setAttribute('transform', at(-2 + p * 10, FRONT_Y + 1.05));
    } else golden.setAttribute('visibility', 'hidden');

    // AGV: van al final de su ruta cargados, giran, descargan y vuelven vacíos.
    const agvPoses: AgvPose[] = [];
    agvs.forEach((r, i) => {
      const len = Math.hypot(r.x1 - r.x0, r.y1 - r.y0);
      const move = len / r.speed;
      const turn = 0.7;
      const cyc = 2 * (move + turn);
      const u = (t + i * 5.3) % cyc;
      const dir = Math.atan2(r.y1 - r.y0, r.x1 - r.x0);
      let f: number;
      let ang: number;
      let loaded: boolean;
      if (u < move) {
        f = u / move;
        ang = dir;
        loaded = true;
      } else if (u < move + turn) {
        f = 1;
        ang = dir + Math.PI * ((u - move) / turn);
        loaded = u < move + turn / 2;
      } else if (u < 2 * move + turn) {
        f = 1 - (u - move - turn) / move;
        ang = dir + Math.PI;
        loaded = false;
      } else {
        f = 0;
        ang = dir + Math.PI + Math.PI * ((u - 2 * move - turn) / turn);
        loaded = u >= 2 * move + turn + turn / 2;
      }
      const x = lerp(r.x0, r.x1, f);
      const y = lerp(r.y0, r.y1, f);
      if (gpu) {
        agvPoses.push({ ...isoXY(x, y), ang, loaded });
        if (r.key !== 'gpu') {
          r.key = 'gpu';
          r.g.setAttribute('visibility', 'hidden');
        }
        r.o.depth = -99;
        return;
      }
      if (r.key === 'gpu') r.g.setAttribute('visibility', 'visible');
      const key = `${Math.round((ang * 18) / Math.PI)}|${loaded ? 1 : 0}`;
      if (key !== r.key) {
        r.key = key;
        showVariant(r.g, key, () => agvIso(ang, loaded));
      }
      r.g.setAttribute('transform', at(x, y));
      r.o.depth = x + y + 0.3;
    });
    gpu?.setAgvs(agvPoses);

    // Orden de dibujo: lo que está más al fondo, primero.
    const sorted = objs.filter((o) => o.depth > -99).sort((a, b) => a.depth - b.depth);
    const order = sorted.map((o) => objs.indexOf(o)).join(',');
    if (order !== lastDepthOrder) {
      lastDepthOrder = order;
      // Solo se mueven los nodos que no están ya en su sitio (menos cambios del DOM = menos parpadeo).
      sorted.forEach((o, i) => {
        const at = objectsG.children[i];
        if (at !== o.el) objectsG.insertBefore(o.el, at ?? null);
      });
    }
    if (pendingCss !== null) {
      for (const el of layers) el.style.transform = pendingCss;
      pendingCss = null;
    }
    gpu?.render(t);
  }

  function pop(text: string, where: 'pile' | 'dock'): void {
    if (where === 'pile') {
      if (gpu) gpu.jigglePile();
      else {
        pileBody.classList.remove('jiggle');
        void pileBody.getBoundingClientRect();
        pileBody.classList.add('jiggle');
      }
      const [cx, cy] = iso(PILE.x + 1.8, PILE.y + 1.4, 1.8);
      for (let k = 0; k < 4; k++) {
        const chip = document.createElementNS(NS, 'rect');
        const a = Math.random() * Math.PI - Math.PI;
        chip.setAttribute('x', String(cx - 2));
        chip.setAttribute('y', String(cy - 2));
        chip.setAttribute('width', '5');
        chip.setAttribute('height', '5');
        chip.setAttribute('fill', ['#b5523b', '#5f7d91', '#c9a24a', '#9aa5ab'][k]);
        chip.setAttribute('class', 'chip');
        chip.setAttribute('style', `--dx:${(Math.cos(a) * 34).toFixed(0)}px;--dy:${(Math.sin(a) * 26 - 8).toFixed(0)}px`);
        pops.appendChild(chip);
        setTimeout(() => chip.remove(), 600);
      }
    }
    const [x, y] = where === 'pile' ? iso(PILE.x + 1.5, PILE.y + 1.5, 2) : iso(TRUCK_PARK_X + 1.2, FRONT_Y, 1.8);
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', `translate(${(x + (Math.random() - 0.5) * 30).toFixed(1)} ${y})`);
    g.innerHTML = `<text class="pop ${where === 'dock' ? 'money' : ''}" text-anchor="middle">${text}</text>`;
    pops.appendChild(g);
    setTimeout(() => g.remove(), 1100);
  }

  // ---- Cámara: arrastrar para mover, pellizcar o rueda para acercar ----
  const cam = { x: iso(4.5, 6.5)[0], y: iso(4.5, 4.8)[1], scale: 1 };
  let fitted = false;
  // Mover el viewBox obliga al navegador a volver a pintar los dos SVG enteros (miles de piezas) en cada movimiento del
  // dedo: en móviles flojos el arrastre bajaba a ~10 fps. Ahora los SVG se pintan con un margen alrededor de la pantalla
  // y, mientras se arrastra o se pellizca, solo se desplazan y escalan con CSS (lo hace la tarjeta gráfica, sin repintar).
  // El viewBox de verdad se pone al soltar, o si el arrastre se sale del margen o el zoom cambia mucho.
  const OVERSCAN = 0.35; // margen a cada lado, en fracción de la pantalla
  const shown = { x0: 0, y0: 0, scale: 0, w: 0, h: 0, mx: 0, my: 0 };
  const layers = [svgBack, svg];
  let pendingCss: string | null = null;
  function commitView(w: number, h: number): void {
    const mx = Math.round(w * OVERSCAN);
    const my = Math.round(h * OVERSCAN);
    Object.assign(shown, { x0: view.x0, y0: view.y0, scale: cam.scale, w, h, mx, my });
    const vb = `${(view.x0 - mx / cam.scale).toFixed(1)} ${(view.y0 - my / cam.scale).toFixed(1)} ${((w + 2 * mx) / cam.scale).toFixed(1)} ${((h + 2 * my) / cam.scale).toFixed(1)}`;
    for (const el of layers) {
      el.setAttribute('viewBox', vb);
      el.style.left = `${-mx}px`;
      el.style.top = `${-my}px`;
      el.style.width = `${w + 2 * mx}px`;
      el.style.height = `${h + 2 * my}px`;
      el.style.transformOrigin = `${mx}px ${my}px`;
      el.style.transform = '';
    }
    pendingCss = null;
  }
  function apply(commit = false): void {
    const w = container.clientWidth || 380;
    const h = container.clientHeight || 640;
    if (!fitted && w > 0) {
      cam.scale = Math.min(1.8, Math.max(0.6, w / 430));
      fitted = true;
    }
    cam.scale = Math.min(2.2, Math.max(0.4, cam.scale));
    cam.x = Math.min(700, Math.max(-560, cam.x));
    cam.y = Math.min(560, Math.max(-230, cam.y));
    const vw = w / cam.scale;
    const vh = h / cam.scale;
    view.x0 = cam.x - vw / 2;
    view.x1 = cam.x + vw / 2;
    view.y0 = cam.y - vh / 2;
    view.y1 = cam.y + vh / 2;
    gpu?.setView(view.x0, view.y0, cam.scale, w, h);
    const k = cam.scale / (shown.scale || 1);
    const tx = (shown.x0 - view.x0) * cam.scale;
    const ty = (shown.y0 - view.y0) * cam.scale;
    // Lo que se ve tiene que caber dentro de lo pintado (con el margen), y el zoom no debe emborronar demasiado.
    const fits = tx <= shown.mx && ty <= shown.my && tx + k * (shown.w + shown.mx) >= w && ty + k * (shown.h + shown.my) >= h;
    if (commit || shown.scale === 0 || w !== shown.w || h !== shown.h || !fits || k < 0.8 || k > 1.25) commitView(w, h);
    else {
      const css = k === 1 ? `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)` : `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${k.toFixed(4)})`;
      // Con la capa de canvas, el desplazamiento se pone en el mismo fotograma en que se pinta el canvas (van a la par).
      if (gpu) pendingCss = css;
      else for (const el of layers) el.style.transform = css;
    }
  }
  apply(true);
  new ResizeObserver(() => apply(true)).observe(container);
  // Por si el navegador desplaza el contenedor (p. ej. para enseñar algo que se toca o se enfoca): siempre en su sitio.
  container.addEventListener('scroll', () => {
    if (container.scrollLeft || container.scrollTop) container.scrollLeft = container.scrollTop = 0;
  });
  // Arranca la capa de canvas; cuando está lista, las líneas se vuelven a montar con sus máquinas allí.
  void createMachineLayer(ZONES.length).then((layer) => {
    if (!layer) return;
    layer.canvas.style.pointerEvents = 'none';
    container.insertBefore(layer.canvas, svg);
    layer.setLowQuality(lowQ);
    gpu = layer;
    pileScaleShown = '';
    // La pila del SVG se esconde cuando la del canvas ya se ve (el toque lo sigue recibiendo su zona transparente).
    void layer.setPile(isoXY(PILE.x, PILE.y), pileIso).then(() => {
      pileBody.style.display = 'none';
    });
    for (const l of lines) l.key = '';
    apply();
  });

  const pointers = new Map<number, { x: number; y: number }>();
  let moved = 0;
  let pinch = 0;
  let wheelTimer = 0;
  svg.addEventListener('pointerdown', (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) moved = 0;
  });
  svg.addEventListener('pointermove', (e) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    if (pointers.size === 1) {
      cam.x -= (cur.x - prev.x) / cam.scale;
      cam.y -= (cur.y - prev.y) / cam.scale;
      moved += Math.abs(cur.x - prev.x) + Math.abs(cur.y - prev.y);
      if (moved > 8) svg.setPointerCapture?.(e.pointerId);
    }
    pointers.set(e.pointerId, cur);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch > 0) cam.scale *= dist / pinch;
      pinch = dist;
      moved = 99;
    }
    apply();
  });
  const end = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = 0;
    if (pointers.size === 0) apply(true); // al soltar, se pinta nítido en su sitio
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);
  svg.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      cam.scale *= e.deltaY < 0 ? 1.1 : 0.9;
      apply();
      clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => apply(true), 200);
    },
    { passive: false },
  );
  // Un arrastre no cuenta como toque.
  svg.addEventListener(
    'click',
    (e) => {
      if (moved > 8) {
        e.stopPropagation();
        e.preventDefault();
      }
    },
    true,
  );

  function celebrate(zoneId: string, text: string, big: boolean): void {
    const i = ZONES.findIndex((z) => z.id === zoneId);
    if (i < 0) return;
    const st = station(i);
    const [cx, cy] = iso(st.x + 1.7, st.y + 1.2, 1.2);
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', `translate(${cx.toFixed(1)} ${cy.toFixed(1)})`);
    const n = big ? 14 : 7;
    let html = `<ellipse class="ring" rx="${big ? 70 : 44}" ry="${big ? 35 : 22}" fill="none" stroke="#ffd76a" stroke-width="${big ? 6 : 4}"/>`;
    if (big) html += `<ellipse class="ring late" rx="50" ry="25" fill="#fff6c8" fill-opacity="0.35" stroke="#fff" stroke-width="3"/>`;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const r = big ? 70 : 44;
      html += `<path class="chip star" d="M0 -6 l1.8 4.2 l4.2 1.8 l-4.2 1.8 l-1.8 4.2 l-1.8 -4.2 l-4.2 -1.8 l4.2 -1.8Z" fill="${['#ffd76a', '#fff6c8', '#8be28b', '#6be3ff'][k % 4]}" style="--dx:${(Math.cos(a) * r).toFixed(0)}px;--dy:${(Math.sin(a) * r * 0.55 - 14).toFixed(0)}px"/>`;
    }
    html += `<text class="pop" y="-30" text-anchor="middle" style="font-size:${big ? 22 : 16}px">${text}</text>`;
    g.innerHTML = html;
    pops.appendChild(g);
    setTimeout(() => g.remove(), 1500);
    if (big) {
      gpu?.levelUp(i, iso(st.x + SIZE / 2, st.y + SIZE / 2)[0], iso(st.x + SIZE, st.y + SIZE)[1]);
      const m = lines[i].machines;
      m.classList.remove('levelup');
      void m.getBoundingClientRect();
      m.classList.add('levelup');
      setTimeout(() => m.classList.remove('levelup'), 1000);
    }
  }

  function focus(sel: string): void {
    const i = ZONES.findIndex((z) => z.id === sel);
    const [px, py] = i >= 0 ? iso(station(i).x + SIZE / 2, station(i).y + SIZE / 2, 0.8) : sel === 'dock' ? iso(10, DOCK_Y, 0.3) : iso(6, BACK_Y, 0);
    cam.x = px;
    cam.y = py + ((container.clientHeight || 640) * 0.22) / cam.scale;
    apply(true);
  }

  return {
    el: svg,
    update,
    focus,
    pop,
    celebrate,
    onSelect: (cb) => (onSelect = cb),
    setLowQuality: (low) => {
      lowQ = low;
      gpu?.setLowQuality(low);
      for (const g of [clouds, birds, hway, q('train')]) g.setAttribute('display', low ? 'none' : '');
    },
    setSelected: (sel) => selOutlines.forEach((el, id) => el.setAttribute('display', id === sel ? '' : 'none')),
  };
}
