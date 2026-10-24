// Vehículos isométricos: carretilla que gira, coches de la carretera y camiones (con volquete y con carga por productos).
import { block, blockP, iso, rblock, wheel, type Proj } from './iso';
import { propIso } from './props';

/** Pieza de la carretilla: un bloque girado, o el hueco de la carga `k` (producto con su esquina en `at`, en píxeles). */
export type ForkliftPiece =
  | { kind: 'block'; cx: number; cy: number; z: number; l: number; w: number; h: number; color: string }
  | { kind: 'load'; k: number; at: [number, number] };

/** Piezas de la carretilla mirando en `ang`, con `loads` productos, ya ordenadas de atrás adelante (SVG y canvas). */
export function forkliftPieces(ang: number, loads: number): ForkliftPiece[] {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const parts: { depth: number; piece: ForkliftPiece }[] = [];
  const part = (u: number, v: number, z: number, l: number, w: number, h: number, color: string) => {
    const cx = u * c - v * s;
    const cy = u * s + v * c;
    parts.push({ depth: cx + cy + z * 0.05, piece: { kind: 'block', cx, cy, z, l, w, h, color } });
  };
  part(-0.12, 0, 0.1, 0.62, 0.5, 0.3, '#f4c430');
  part(-0.18, 0, 0.4, 0.3, 0.34, 0.05, '#2a1d14');
  part(-0.2, 0, 0.45, 0.14, 0.14, 0.22, '#f2c28e');
  for (const [pu, pv] of [[-0.3, -0.2], [-0.3, 0.2], [0.02, -0.2], [0.02, 0.2]]) part(pu, pv, 0.4, 0.04, 0.04, 0.42, '#3b3b3b');
  part(-0.14, 0, 0.82, 0.4, 0.46, 0.04, '#3b3b3b');
  part(0.26, 0, 0.1, 0.05, 0.34, 0.7, '#7a7a7a');
  part(0.52, -0.12, 0.1, 0.5, 0.07, 0.04, '#6a6a6a');
  part(0.52, 0.12, 0.1, 0.5, 0.07, 0.04, '#6a6a6a');
  for (const [wu, wv] of [[-0.3, -0.27], [-0.3, 0.27], [0.1, -0.27], [0.1, 0.27]]) part(wu, wv, 0, 0.2, 0.08, 0.18, '#2a1d14');
  for (let k = 0; k < loads; k++) {
    const cx = 0.5 * c;
    const cy = 0.5 * s;
    parts.push({ depth: cx + cy + 0.4 + k * 0.01, piece: { kind: 'load', k, at: iso(cx - 0.18, cy - 0.18, 0.14 + k * 0.32) } });
  }
  parts.sort((a, b) => a.depth - b.depth);
  return parts.map((p) => p.piece);
}

/** Sombra de la carretilla (elipse bajo el origen). */
export const FORKLIFT_SHADOW = { dy: 3, rx: 19, ry: 9, alpha: 0.18 };

/**
 * Carretilla mirando en la dirección `ang` (radianes sobre el suelo: 0 = +x, π/2 = +y), centrada en el origen.
 * `loads` son productos (ya dibujados con `propIso`) que lleva en las horquillas, de abajo arriba.
 */
export function forkliftIso(ang: number, loads: string[]): string {
  const body = forkliftPieces(ang, loads.length)
    .map((p) => (p.kind === 'block' ? rblock(p.cx, p.cy, p.z, p.l, p.w, p.h, ang, p.color) : `<g transform="translate(${p.at[0].toFixed(1)} ${p.at[1].toFixed(1)})">${loads[p.k]}</g>`))
    .join('');
  const [sx, sy] = iso(0, 0);
  const sh = FORKLIFT_SHADOW;
  return `<ellipse cx="${sx}" cy="${sy + sh.dy}" rx="${sh.rx}" ry="${sh.ry}" fill="#000" opacity="${sh.alpha}"/>${body}`;
}

/** Bloque girado de un vehículo (centro ya girado en cx, cy). */
export interface VehicleBlock {
  cx: number;
  cy: number;
  z: number;
  l: number;
  w: number;
  h: number;
  color: string;
}

/** Piezas del AGV mirando en `ang`, con o sin carga, ya ordenadas de atrás adelante (SVG y canvas). */
export function agvPieces(ang: number, loaded: boolean): VehicleBlock[] {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const parts: { depth: number; piece: VehicleBlock }[] = [];
  const part = (u: number, v: number, z: number, l: number, w: number, h: number, color: string) => {
    const cx = u * c - v * s;
    const cy = u * s + v * c;
    parts.push({ depth: cx + cy + z * 0.05, piece: { cx, cy, z, l, w, h, color } });
  };
  part(0, 0, 0.05, 0.78, 0.5, 0.14, '#5a6b7a');
  part(0.33, 0, 0.19, 0.08, 0.5, 0.03, '#f4c430');
  part(-0.33, 0, 0.19, 0.08, 0.5, 0.03, '#f4c430');
  part(0.3, 0, 0.22, 0.1, 0.12, 0.1, '#e63946');
  if (loaded) {
    part(-0.02, 0, 0.19, 0.46, 0.42, 0.3, '#8c7b6b');
    part(0.0, -0.05, 0.49, 0.2, 0.2, 0.1, '#b5523b');
    part(-0.12, 0.08, 0.49, 0.16, 0.16, 0.07, '#5f7d91');
  }
  parts.sort((a, b) => a.depth - b.depth);
  return parts.map((p) => p.piece);
}

/** Sombra del AGV (elipse bajo el origen). */
export const AGV_SHADOW = { dy: 3, rx: 19, ry: 8, alpha: 0.18 };

/** Vehículo guiado automático (AGV): plataforma baja con luz y, si lleva carga, un contenedor de chatarra. Mira en la dirección `ang`. */
export function agvIso(ang: number, loaded: boolean): string {
  const [sx, sy] = iso(0, 0);
  const sh = AGV_SHADOW;
  const body = agvPieces(ang, loaded)
    .map((p) => rblock(p.cx, p.cy, p.z, p.l, p.w, p.h, ang, p.color))
    .join('');
  return `<ellipse cx="${sx}" cy="${sy + sh.dy}" rx="${sh.rx}" ry="${sh.ry}" fill="#000" opacity="${sh.alpha}"/>${body}`;
}

/** Coche de fondo; mira hacia +x, o hacia -x con `rev`. */
export function carIso(body: string, van = false, rev = false): string {
  const len = van ? 1.0 : 0.85;
  const m = (x: number, w: number) => (rev ? len - x - w : x);
  const nose = rev ? 0 : len - 0.04;
  return `<ellipse cx="${iso(len / 2, 0.3)[0]}" cy="${iso(len / 2, 0.3)[1] + 3}" rx="${len * 28}" ry="8" fill="#000" opacity="0.18"/>
    ${block(0, 0, 0.1, len, 0.55, 0.22, body)}
    ${van ? block(m(0.1, 0.7), 0.03, 0.32, 0.7, 0.49, 0.26, body) : block(m(0.22, 0.42), 0.05, 0.32, 0.42, 0.45, 0.2, body)}
    ${block(nose, 0.08, 0.2, 0.05, 0.12, 0.07, '#fff3a8', { edge: false })}
    ${wheel(0.2, 0.55, 0.11)}${wheel(len - 0.2, 0.55, 0.11)}`;
}

function cabIso(cab: string): string {
  return `${block(1.85, 0, 0.37, 0.85, 1, 0.8, cab)}
    <polygon points="${[iso(2.7, 0.12, 0.75), iso(2.7, 0.88, 0.75), iso(2.7, 0.88, 1.08), iso(2.7, 0.12, 1.08)].map((p) => p.join(',')).join(' ')}" fill="#bfe7ff" stroke="#2a1d14" stroke-width="0.8"/>`;
}

function truckBase(): string {
  return `<ellipse cx="${iso(1.3, 0.5)[0]}" cy="${iso(1.3, 0.5)[1] + 4}" rx="44" ry="14" fill="#000" opacity="0.18"/>${block(0, 0, 0.25, 2.7, 1, 0.12, '#3b3b3b')}`;
}

const wheels = () => `${wheel(0.45, 1)}${wheel(1.4, 1)}${wheel(2.3, 1)}`;

/**
 * Camión de chatarra con volquete lateral: `tilt` (radianes) levanta la caja hacia la pila (+y);
 * `slide` (0-1) desliza la carga fuera; `dust` (0-1) levanta polvo al caer.
 */
export function scrapTruckIso(tilt: number, loaded: boolean, slide: number, dust: number): string {
  const z0 = 0.37;
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  const proj: Proj = (x, y, z) => {
    const dy = y - 1;
    const dz = z - z0;
    return iso(x, 1 + dy * c + dz * s, z0 - dy * s + dz * c);
  };
  let bed = blockP(proj, 0, 0, z0, 1.75, 0.1, 0.55, '#6b7a5a');
  bed += blockP(proj, 0, 0, z0, 1.75, 1, 0.1, '#7d8b6a');
  if (loaded && slide < 0.98) {
    const dy = slide * 1.7;
    const dz = -slide * 0.15;
    const pieces: [number, number, number, number, number, number, string][] = [
      [0.15, 0.2, 0.47, 0.5, 0.4, 0.22, '#8c7b6b'],
      [0.7, 0.3, 0.47, 0.45, 0.5, 0.3, '#b5523b'],
      [1.15, 0.15, 0.47, 0.45, 0.45, 0.18, '#5f7d91'],
      [0.4, 0.45, 0.62, 0.4, 0.35, 0.2, '#c9a24a'],
    ];
    pieces.forEach(([x, y, z, w, d, h, col], k) => {
      const ky = dy * (0.7 + k * 0.12);
      bed += blockP(proj, x, y + ky, z + dz, w, d, h, col);
    });
  }
  bed += blockP(proj, 0, 0, z0, 0.1, 1, 0.5, '#6b7a5a');
  bed += blockP(proj, 1.65, 0, z0, 0.1, 1, 0.5, '#6b7a5a');
  bed += blockP(proj, 0, 0.92, z0, 1.75, 0.08, 0.2, '#7d8b6a');
  let fx = '';
  if (dust > 0) {
    for (let k = 0; k < 4; k++) {
      const [dx, dy] = iso(0.4 + k * 0.4, 1.9 + (k % 2) * 0.3, 0.3 + dust * 0.6);
      fx += `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="${(8 + dust * 12 + k * 2).toFixed(1)}" fill="#d8c8a8" opacity="${(0.55 * (1 - dust)).toFixed(2)}"/>`;
    }
  }
  return truckBase() + bed + cabIso('#9fb07f') + wheels() + fx;
}

/** Posiciones (en la caja) de los productos del camión de expedición: 3 a lo largo × 2 a lo ancho. */
const SLOTS: [number, number][] = [
  [0.1, 0.12],
  [0.6, 0.12],
  [1.1, 0.12],
  [0.1, 0.52],
  [0.6, 0.52],
  [1.1, 0.52],
];
export const TRUCK_SLOTS = SLOTS.length;

/** Parte del camión de expedición que queda detrás de la carga: sombra, chasis, frente de la caja y suelo de la caja. */
export function shipTruckBackIso(body = '#c2683a'): string {
  return truckBase() + block(0, 0, 0.37, 1.75, 0.08, 0.5, body) + block(0, 0, 0.37, 1.75, 1, 0.1, body);
}

/** Parte del camión de expedición que queda delante de la carga: laterales y trasera de la caja, cabina y ruedas. */
export function shipTruckFrontIso(body = '#c2683a', cab = '#e08a4f'): string {
  return block(0, 0, 0.37, 0.1, 1, 0.5, body) + block(1.65, 0, 0.37, 0.1, 1, 0.5, body) + block(0, 0.92, 0.37, 1.75, 0.08, 0.22, body) + cabIso(cab) + wheels();
}

/** Dónde va (en píxeles, respecto al camión) el producto del hueco `k` de la caja. */
export function truckSlotAt(k: number): [number, number] {
  const [x, y] = SLOTS[k];
  return iso(x, y, 0.47);
}

/** Camión de expedición con `ids.length` productos en la caja (ids de zona, uno por hueco). */
export function shipTruckIso(ids: string[], body = '#c2683a', cab = '#e08a4f'): string {
  const load = ids
    .map((id, k) => {
      const [sx, sy] = truckSlotAt(k);
      return `<g transform="translate(${sx.toFixed(1)} ${sy.toFixed(1)})">${propIso(id)}</g>`;
    })
    .join('');
  return shipTruckBackIso(body) + load + shipTruckFrontIso(body, cab);
}

/** Camión dorado (se toca). */
export function goldenTruckIso(): string {
  return truckBase() + block(0, 0, 0.37, 1.75, 1, 0.75, 'url(#gold)') + block(0.5, 0.3, 1.12, 0.7, 0.4, 0.2, '#fff1a8') + cabIso('#ffd34d') + wheels();
}
