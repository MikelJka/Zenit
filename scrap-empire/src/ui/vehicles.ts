// Vehículos isométricos: carretilla que gira, coches de la carretera y camiones (con volquete y con carga por productos).
import { block, blockP, iso, rblock, wheel, type Proj } from './iso';
import { propIso } from './props';

interface Part {
  depth: number;
  svg: string;
}

/**
 * Carretilla mirando en la dirección `ang` (radianes sobre el suelo: 0 = +x, π/2 = +y), centrada en el origen.
 * `loads` son productos (ya dibujados con `propIso`) que lleva en las horquillas, de abajo arriba.
 */
export function forkliftIso(ang: number, loads: string[]): string {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const parts: Part[] = [];
  const part = (u: number, v: number, z: number, l: number, w: number, h: number, color: string) => {
    const cx = u * c - v * s;
    const cy = u * s + v * c;
    parts.push({ depth: cx + cy + z * 0.05, svg: rblock(cx, cy, z, l, w, h, ang, color) });
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
  loads.forEach((svg, k) => {
    const cx = 0.5 * c;
    const cy = 0.5 * s;
    const [sx, sy] = iso(cx - 0.18, cy - 0.18, 0.14 + k * 0.32);
    parts.push({ depth: cx + cy + 0.4 + k * 0.01, svg: `<g transform="translate(${sx.toFixed(1)} ${sy.toFixed(1)})">${svg}</g>` });
  });
  parts.sort((a, b) => a.depth - b.depth);
  const [sx, sy] = iso(0, 0);
  return `<ellipse cx="${sx}" cy="${sy + 3}" rx="19" ry="9" fill="#000" opacity="0.18"/>${parts.map((p) => p.svg).join('')}`;
}

/** Vehículo guiado automático (AGV): plataforma baja con luz y, si lleva carga, un contenedor de chatarra. Mira en la dirección `ang`. */
export function agvIso(ang: number, loaded: boolean): string {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const parts: Part[] = [];
  const part = (u: number, v: number, z: number, l: number, w: number, h: number, color: string) => {
    const cx = u * c - v * s;
    const cy = u * s + v * c;
    parts.push({ depth: cx + cy + z * 0.05, svg: rblock(cx, cy, z, l, w, h, ang, color) });
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
  const [sx, sy] = iso(0, 0);
  return `<ellipse cx="${sx}" cy="${sy + 3}" rx="19" ry="8" fill="#000" opacity="0.18"/>${parts.map((p) => p.svg).join('')}`;
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

/** Camión de expedición con `ids.length` productos en la caja (ids de zona, uno por hueco). */
export function shipTruckIso(ids: string[], body = '#c2683a', cab = '#e08a4f'): string {
  let bed = block(0, 0, 0.37, 1.75, 0.08, 0.5, body) + block(0, 0, 0.37, 1.75, 1, 0.1, body);
  ids.forEach((id, k) => {
    const [x, y] = SLOTS[k];
    const [sx, sy] = iso(x, y, 0.47);
    bed += `<g transform="translate(${sx.toFixed(1)} ${sy.toFixed(1)})">${propIso(id)}</g>`;
  });
  bed += block(0, 0, 0.37, 0.1, 1, 0.5, body) + block(1.65, 0, 0.37, 0.1, 1, 0.5, body) + block(0, 0.92, 0.37, 1.75, 0.08, 0.22, body);
  return truckBase() + bed + cabIso(cab) + wheels();
}

/** Camión dorado (se toca). */
export function goldenTruckIso(): string {
  return truckBase() + block(0, 0, 0.37, 1.75, 1, 0.75, 'url(#gold)') + block(0.5, 0.3, 1.12, 0.7, 0.4, 0.2, '#fff1a8') + cabIso('#ffd34d') + wheels();
}
