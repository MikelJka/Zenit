// Dibujo isométrico en SVG: proyección y bloques con tres caras (estilo low-poly, sin pixel art).

/** Medio ancho y medio alto de una baldosa, y píxeles por unidad de altura. */
export const TW = 28;
export const TH = 14;
export const TZ = 20;

export function iso(x: number, y: number, z = 0): [number, number] {
  return [(x - y) * TW, (x + y) * TH - z * TZ];
}

export function pts(list: [number, number][]): string {
  return list.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ');
}

export function shade(hex: string, f: number): string {
  if (!hex.startsWith('#')) return hex;
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

const EDGE = 'stroke="#2a1d14" stroke-width="0.9" stroke-linejoin="round"';

export type Proj = (x: number, y: number, z: number) => [number, number];

/** Bloque con una proyección propia (para piezas inclinadas, como la caja de un volquete). */
export function blockP(proj: Proj, x: number, y: number, z: number, w: number, d: number, h: number, color: string, opts: { top?: string; edge?: boolean } = {}): string {
  const e = opts.edge === false ? '' : EDGE;
  const top = pts([proj(x, y, z + h), proj(x + w, y, z + h), proj(x + w, y + d, z + h), proj(x, y + d, z + h)]);
  const right = pts([proj(x + w, y, z), proj(x + w, y + d, z), proj(x + w, y + d, z + h), proj(x + w, y, z + h)]);
  const left = pts([proj(x, y + d, z), proj(x + w, y + d, z), proj(x + w, y + d, z + h), proj(x, y + d, z + h)]);
  return `<polygon points="${right}" fill="${shade(color, 0.82)}" ${e}/><polygon points="${left}" fill="${shade(color, 0.66)}" ${e}/><polygon points="${top}" fill="${opts.top ?? shade(color, 1.12)}" ${e}/>`;
}

/** Bloque desde (x, y, z) con tamaño w (eje x), d (eje y) y h (alto). Se ven la tapa y las caras +x y +y. */
export function block(x: number, y: number, z: number, w: number, d: number, h: number, color: string, opts: { top?: string; edge?: boolean } = {}): string {
  return blockP(iso, x, y, z, w, d, h, color, opts);
}

/** Caras visibles de un bloque girado (puntos en píxeles y color ya sombreado), de atrás adelante: lo usan el SVG y el canvas. */
export function rblockFaces(cx: number, cy: number, z: number, len: number, wid: number, h: number, ang: number, color: string): { pts: [number, number][]; fill: string }[] {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const pt = (u: number, v: number): [number, number] => [cx + u * c - v * s, cy + u * s + v * c];
  const hl = len / 2;
  const hw = wid / 2;
  const ring = [pt(-hl, -hw), pt(hl, -hw), pt(hl, hw), pt(-hl, hw)];
  const out: { pts: [number, number][]; fill: string }[] = [];
  for (let i = 0; i < 4; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % 4];
    const nx = b[1] - a[1];
    const ny = -(b[0] - a[0]);
    const n = Math.hypot(nx, ny);
    if ((nx + ny) / n <= 0.02) continue;
    const f = 0.74 + (0.08 * (nx - ny)) / n;
    out.push({ pts: [iso(a[0], a[1], z), iso(b[0], b[1], z), iso(b[0], b[1], z + h), iso(a[0], a[1], z + h)], fill: shade(color, f) });
  }
  out.push({ pts: ring.map(([x, y]) => iso(x, y, z + h)), fill: shade(color, 1.12) });
  return out;
}

/** Bloque girado un ángulo cualquiera sobre el suelo, centrado en (cx, cy); `len` va en la dirección `ang`. */
export function rblock(cx: number, cy: number, z: number, len: number, wid: number, h: number, ang: number, color: string, opts: { edge?: boolean } = {}): string {
  const e = opts.edge === false ? '' : EDGE;
  return rblockFaces(cx, cy, z, len, wid, h, ang, color)
    .map((f) => `<polygon points="${pts(f.pts)}" fill="${f.fill}" ${e}/>`)
    .join('');
}

/** Cilindro de pie (silos, chimeneas, depósitos). */
export function cyl(x: number, y: number, z: number, r: number, h: number, color: string): string {
  const [cx, base] = iso(x, y, z);
  const top = base - h * TZ;
  const rx = r * TW * 1.414;
  const ry = r * TH * 1.414;
  return `<path d="M${(cx - rx).toFixed(1)} ${top.toFixed(1)} L${(cx - rx).toFixed(1)} ${base.toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${(cx + rx).toFixed(1)} ${base.toFixed(1)} L${(cx + rx).toFixed(1)} ${top.toFixed(1)}Z" fill="${shade(color, 0.8)}" ${EDGE}/><ellipse cx="${cx.toFixed(1)}" cy="${top.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${shade(color, 1.1)}" ${EDGE}/>`;
}

/** Cilindro tumbado a lo largo del eje x (tubos). */
export function cylX(x0: number, x1: number, y: number, z: number, r: number, color: string): string {
  let out = '';
  const steps = 4;
  for (let k = 0; k <= steps; k++) {
    const x = x0 + ((x1 - x0) * k) / steps;
    const ring: [number, number][] = [];
    for (let a = 0; a < 12; a++) ring.push(iso(x, y + r * Math.cos((a / 12) * Math.PI * 2), z + r * Math.sin((a / 12) * Math.PI * 2)));
    out += `<polygon points="${pts(ring)}" fill="${shade(color, k === steps ? 1.15 : 0.8 + k * 0.05)}" ${EDGE}/>`;
  }
  const [hx, hy] = iso(x1, y, z);
  return out + `<ellipse cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" rx="${(r * TW * 0.6).toFixed(1)}" ry="${(r * TZ * 0.7).toFixed(1)}" fill="#2a1d14" opacity="0.7"/>`;
}

/** Rectángulo en el suelo (o a altura z). */
export function tile(x: number, y: number, w: number, d: number, attrs: string, z = 0): string {
  return `<polygon points="${pts([iso(x, y, z), iso(x + w, y, z), iso(x + w, y + d, z), iso(x, y + d, z)])}" ${attrs}/>`;
}

/** Rueda vista en la cara +y (lado izquierdo de la pantalla). */
export function wheel(x: number, y: number, r = 0.22): string {
  const [cx, cy] = iso(x, y, r);
  return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(r * TW * 0.9).toFixed(1)}" ry="${(r * TZ).toFixed(1)}" fill="#2a1d14"/><ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(r * TW * 0.4).toFixed(1)}" ry="${(r * TZ * 0.45).toFixed(1)}" fill="#8a8a8a"/>`;
}
