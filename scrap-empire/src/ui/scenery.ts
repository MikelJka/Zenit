// Decorado de la escena: cielo con ciclo día/noche, ciudad con autopista, terreno, puerto con tren, nave en «rayos X»
// y el interior de la nave. Solo apariencia. Lo estático se dibuja una vez y se muestra como imagen para aligerar el móvil.
import { block, cyl, iso, pts, rblock, tile } from './iso';

/** Altura de pantalla del horizonte: lo de detrás es cielo. */
export const HORIZON = -232;

/** Límites del suelo de la nave (en baldosas). */
export const HALL = { x0: -0.6, x1: 19.4, y0: -0.6, y1: 15.0, wall: 4.6, ridge: 6.6 };

/** Carriles y vías (en baldosas, eje y), compartidos con el dibujado. */
export const PORT = { trackY: 22.1, quayY: 25, trainSpeed: 1.6, trainPeriod: 75 };

function lcg(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function mix(hex: string, into: string, f: number): string {
  const a = parseInt(hex.slice(1), 16);
  const b = parseInt(into.slice(1), 16);
  const c = (sh: number) => Math.round(((a >> sh) & 255) * (1 - f) + ((b >> sh) & 255) * f);
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

/** Dibujo estático convertido en imagen (se rasteriza una vez). */
export function staticImage(markup: string, x: number, y: number, w: number, h: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${markup}</svg>`;
  return `<image decoding="sync" x="${x}" y="${y}" width="${w}" height="${h}" pointer-events="none" href="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}"/>`;
}

// ---- Hora del día ----

const smooth = (v: number) => {
  const t = Math.min(1, Math.max(0, v));
  return t * t * (3 - 2 * t);
};

/** 0 de día, 1 de noche, según la hora local (0-24). */
export function nightAmount(h: number): number {
  return h >= 12 ? smooth((h - 18.5) / 2.5) : 1 - smooth((h - 5.5) / 2.5);
}

/** Cuánto tiñe el atardecer o el amanecer (0-1). */
export function duskAmount(h: number): number {
  return Math.max(0, 1 - Math.abs(h - 19.6) / 1.7, 1 - Math.abs(h - 6.6) / 1.5);
}

/** Cielo (día, atardecer y noche que se funden) y suelo lejano. */
export function skySvg(): string {
  const grad = (id: string, a: string, b: string, c: string) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="0.6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
  const h = 1700 + HORIZON;
  return `<defs>${grad('skyDay', '#6aa8e0', '#a9d3f0', '#f3ead2')}${grad('skyDusk', '#5d6fa8', '#e9a070', '#f6cf90')}${grad('skyNight', '#0a1230', '#18284f', '#2c3f6b')}
      <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b48e" stop-opacity="0"/><stop offset="1" stop-color="#d9b48e" stop-opacity="0.55"/></linearGradient>
      <radialGradient id="pool"><stop offset="0" stop-color="#fff0b0" stop-opacity="0.55"/><stop offset="0.6" stop-color="#ffe08a" stop-opacity="0.22"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></radialGradient>
      <radialGradient id="glow"><stop offset="0" stop-color="#ffe9a0" stop-opacity="0.9"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient></defs>
    <rect id="skyDayR" x="-4000" y="-1700" width="8000" height="${h}" fill="url(#skyDay)"/>
    <rect id="skyDuskR" x="-4000" y="-1700" width="8000" height="${h}" fill="url(#skyDusk)" opacity="0"/>
    <rect id="skyNightR" x="-4000" y="-1700" width="8000" height="${h}" fill="url(#skyNight)" opacity="0"/>
    <rect x="-4000" y="${HORIZON}" width="8000" height="6000" fill="#a8906a"/>`;
}

// ---- Ciudad (D1) ----

interface Building {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  kind: 'tower' | 'factory' | 'silo' | 'tank' | 'chimney' | 'crane' | 'block';
}

/** Ventanas en la cara +y: devuelve las apagadas y las encendidas por separado (las encendidas brillan de noche). */
function windows(rand: () => number, x: number, y: number, w: number, d: number, h: number): { dark: string; lit: string } {
  let dark = '';
  let lit = '';
  const cols = Math.max(2, Math.round(w * 1.8));
  const rows = Math.max(2, Math.round(h * 1.3));
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (rand() < 0.2) continue;
      const on = rand() < 0.4;
      const u0 = x + ((i + 0.25) * w) / cols;
      const u1 = x + ((i + 0.75) * w) / cols;
      const z0 = 0.3 + (j * (h - 0.6)) / rows;
      const z1 = z0 + ((h - 0.6) / rows) * 0.55;
      const p = pts([iso(u0, y + d, z0), iso(u1, y + d, z0), iso(u1, y + d, z1), iso(u0, y + d, z1)]);
      if (on) lit += `<polygon points="${p}" fill="#ffd76a"/>`;
      else dark += `<polygon points="${p}" fill="#33425a" opacity="0.75"/>`;
    }
  }
  return { dark, lit };
}

/** Ciudad industrial del horizonte con una autopista elevada por delante. `base` es el edificio; `lit` las luces nocturnas. */
export function cityMarkup(): { base: string; lit: string } {
  const rand = lcg(20261019);
  const rows = [
    { c: -17.2, haze: 0.66, scale: 1.3 },
    { c: -15.8, haze: 0.5, scale: 1.2 },
    { c: -14.4, haze: 0.34, scale: 1.1 },
    { c: -13.0, haze: 0.18, scale: 1.0 },
  ];
  const palette = ['#55627a', '#6a6f86', '#5a7280', '#7a6f7a', '#64708a', '#7d7466'];
  let base = '';
  let lit = '';
  for (const row of rows) {
    for (let D = -52; D < 58; D += 2.4 + rand() * 2.2) {
      const x = (row.c + D) / 2;
      const y = (row.c - D) / 2;
      const r = rand();
      const kind: Building['kind'] = r < 0.3 ? 'tower' : r < 0.46 ? 'block' : r < 0.62 ? 'factory' : r < 0.72 ? 'silo' : r < 0.8 ? 'tank' : r < 0.92 ? 'chimney' : 'crane';
      const h = (kind === 'tower' ? 3.8 + rand() * 4.4 : kind === 'block' ? 2.4 + rand() * 2.2 : kind === 'factory' ? 1.6 + rand() * 1.2 : 3 + rand() * 1.5) * row.scale;
      const w = 1.4 + rand() * 1.3;
      const d = 1.4 + rand() * 1.3;
      const col = palette[Math.floor(rand() * palette.length)];
      const hz = (c: string) => mix(c, '#d9b48e', row.haze);
      const win = (ww: number) => {
        const wnd = windows(rand, x, y, ww, d, h);
        base += wnd.dark;
        lit += wnd.lit;
      };
      switch (kind) {
        case 'tower':
        case 'block':
          base += block(x, y, 0, w, d, h, hz(col));
          win(w);
          base += block(x + w * 0.3, y + d * 0.3, h, w * 0.4, d * 0.4, 0.4, hz('#8a8a96'));
          break;
        case 'factory':
          base += block(x, y, 0, w * 1.8, d, h, hz(col));
          win(w * 1.8);
          for (let k = 0; k < 3; k++) base += block(x + k * w * 0.6, y, h, w * 0.5, d, 0.35, hz('#7d6a5a'));
          break;
        case 'silo':
          base += cyl(x + 0.5, y + 0.5, 0, 0.45, h, hz('#9aa0a8')) + cyl(x + 1.5, y + 0.5, 0, 0.45, h * 0.85, hz('#9aa0a8'));
          break;
        case 'tank':
          base += cyl(x + 0.8, y + 0.8, 0, 1.0, h * 0.45, hz('#8f6f5a'));
          break;
        case 'chimney':
          base += block(x - 0.2, y - 0.2, 0, 1.6, 1.6, 1.0, hz(col)) + cyl(x + 0.6, y + 0.6, 1.0, 0.3, h * 1.2, hz('#a85a48')) + cyl(x + 0.6, y + 0.6, 1.0 + h * 1.1, 0.31, 0.25, hz('#e8e0d0'));
          break;
        case 'crane': {
          base += block(x, y, 0, 0.3, 0.3, h * 1.1, hz('#d9a43a'));
          const [x0, y0] = iso(x + 0.15, y + 0.15, h * 1.1);
          const [x1, y1] = iso(x + 2.4, y - 0.9, h * 1.1);
          base += `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${hz('#d9a43a')}" stroke-width="3.5"/><line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${(y1 + 26).toFixed(1)}" stroke="#2a1d14" stroke-width="1.2"/>`;
          break;
        }
      }
    }
  }
  // Autopista elevada por delante de la ciudad (a lo largo del horizonte).
  const c0 = -11.4;
  const at = (D: number, v = 0): [number, number] => [(c0 + D) / 2 + v * 0.7071, (c0 - D) / 2 + v * 0.7071];
  for (let D = -50; D <= 56; D += 5) {
    const [px, py] = at(D);
    base += rblock(px, py, 0, 0.5, 0.8, 2.3, -Math.PI / 4, '#8d8a86');
  }
  const [mx, my] = at(3);
  base += rblock(mx, my, 2.3, 120, 2.4, 0.4, -Math.PI / 4, '#8a8782');
  const [bx, by] = at(3, -1.1);
  base += rblock(bx, by, 2.7, 120, 0.12, 0.35, -Math.PI / 4, '#b9b5ad', { edge: false });
  const [fx, fy] = at(3, 1.1);
  base += rblock(fx, fy, 2.7, 120, 0.12, 0.35, -Math.PI / 4, '#b9b5ad', { edge: false });
  return { base, lit };
}

/** Coche visto desde el frente de la autopista (posición D a lo largo, v en el carril). Mira hacia la derecha de la pantalla, o hacia la izquierda con `rev`. */
export function hwayCarIso(body: string, rev: boolean): string {
  const ang = rev ? (3 * Math.PI) / 4 : -Math.PI / 4;
  return (
    rblock(0, 0, 0, 1.0, 0.55, 0.22, ang, body) +
    rblock(-0.05 * Math.cos(ang), -0.05 * Math.sin(ang), 0.22, 0.45, 0.46, 0.2, ang, body) +
    rblock(0.5 * Math.cos(ang), 0.5 * Math.sin(ang), 0.1, 0.05, 0.35, 0.07, ang, '#fff3a8', { edge: false })
  );
}

/** Posición en el mundo de un punto de la autopista (D a lo largo, v en el carril), para colocar los coches. */
export function hwayPoint(D: number, v: number): [number, number, number] {
  const c0 = -11.4;
  return [(c0 + D) / 2 + v * 0.7071, (c0 - D) / 2 + v * 0.7071, 2.7];
}

// ---- Terreno (D4), farolas, árboles y vallas (D1) ----

export interface Lamp {
  x: number;
  y: number;
}
export const LAMPS: Lamp[] = [];
for (let x = -4; x <= 32; x += 6) LAMPS.push({ x, y: -5.0 }, { x, y: 20.6 });
for (let y = 3; y <= 13; y += 5) LAMPS.push({ x: 21.2, y }, { x: -2.6, y });

function tree(x: number, y: number, s = 1): string {
  return (
    block(x, y, 0, 0.18 * s, 0.18 * s, 0.9 * s, '#6b4a2b') +
    block(x - 0.35 * s, y - 0.35 * s, 0.9 * s, 0.9 * s, 0.9 * s, 0.55 * s, '#8d8a4a') +
    block(x - 0.2 * s, y - 0.2 * s, 1.45 * s, 0.6 * s, 0.6 * s, 0.4 * s, '#a39a52')
  );
}

function lampBody(l: Lamp): string {
  return block(l.x, l.y, 0, 0.1, 0.1, 1.9, '#3b3b3b') + block(l.x - 0.25, l.y - 0.05, 1.9, 0.5, 0.2, 0.1, '#3b3b3b') + block(l.x - 0.2, l.y, 1.8, 0.3, 0.12, 0.08, '#ffe9a0', { edge: false });
}

/** Luces de noche de las farolas: se enciende al atardecer. */
/** Focos del techo de la nave: de noche iluminan el suelo y lo que hay dentro (se enseñan con la noche). */
export function spotlightsSvg(): string {
  let s = '';
  for (const x of [3.5, 9.5, 15.5]) {
    for (const y of [2.2, 7.6, 12.8]) {
      const [fx, fy] = iso(x, y, 0);
      const [lx, ly] = iso(x, y, HALL.wall - 0.5);
      s += `<ellipse cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" rx="130" ry="64" fill="url(#pool)"/>`;
      s += `<polygon points="${(lx - 5).toFixed(1)},${ly.toFixed(1)} ${(lx + 5).toFixed(1)},${ly.toFixed(1)} ${(fx + 85).toFixed(1)},${fy.toFixed(1)} ${(fx - 85).toFixed(1)},${fy.toFixed(1)}" fill="#fff2b8" opacity="0.09"/>`;
      s += `<circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="26" fill="url(#glow)"/><ellipse cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" rx="8" ry="3.5" fill="#fff6c8" stroke="#2a1d14" stroke-width="0.8"/>`;
    }
  }
  return s;
}

export function lampGlowSvg(): string {
  return LAMPS.map((l) => {
    const [x, y] = iso(l.x, l.y + 0.1, 1.75);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="34" fill="url(#glow)"/>`;
  }).join('');
}

function billboard(x: number, y: number): string {
  const py = y + 0.2;
  return (
    block(x + 0.3, y, 0, 0.14, 0.14, 2.3, '#4a4a4a') +
    block(x + 4.2, y, 0, 0.14, 0.14, 2.3, '#4a4a4a') +
    block(x, y, 2.0, 4.6, 0.2, 1.5, '#2f6fb3') +
    `<g transform="matrix(28 14 0 -20 ${(-py * 28).toFixed(1)} ${(py * 14).toFixed(1)})"><text transform="translate(${x + 0.3} 2.5) scale(1 -1)" font-size="0.62" font-weight="900" fill="#fff6e0" font-family="sans-serif">SCRAP EMPIRE</text></g>`
  );
}

/** Terreno exterior: gravilla, hierba seca, charcos, aceras, árboles, farolas, vía del tren, muelle y agua. */
export function terrainSvg(): string {
  const r = lcg(4242);
  let s = '';
  const inHall = (x: number, y: number) => x > HALL.x0 - 1 && x < HALL.x1 + 1 && y > HALL.y0 - 1 && y < 17;
  const onRoad = (y: number) => (y > -4.6 && y < -0.5) || (y > 16.3 && y < 20.3);
  // Manchas de suelo: gravilla clara, barro oscuro y hierba seca.
  for (let i = 0; i < 160; i++) {
    const x = -34 + r() * 84;
    const y = -9 + r() * 32;
    if (inHall(x, y) || onRoad(y) || y > 21) continue;
    const kind = r();
    const col = kind < 0.4 ? '#c0aa84' : kind < 0.7 ? '#8a7452' : '#8d8a4a';
    s += tile(x, y, 0.8 + r() * 2.4, 0.7 + r() * 1.8, `fill="${col}" opacity="${(0.28 + r() * 0.25).toFixed(2)}"`);
  }
  // Hierba seca en matas.
  for (let i = 0; i < 120; i++) {
    const x = -34 + r() * 84;
    const y = -9 + r() * 30;
    if (inHall(x, y) || onRoad(y) || y > 21.5) continue;
    const [px, py] = iso(x, y);
    s += `<path d="M${px - 3} ${py} l1.5 -6 l1.5 6 m1 0 l1.5 -8 l1.5 8" stroke="#7b7a3a" stroke-width="1.3" fill="none" opacity="0.8"/>`;
  }
  // Aceras junto a las carreteras.
  s += tile(-10, -5.4, 44, 1.2, 'fill="#cbbfa8" stroke="#2a1d14" stroke-width="0.6"');
  s += tile(-10, 20.1, 44, 1.2, 'fill="#cbbfa8" stroke="#2a1d14" stroke-width="0.6"');
  // Charcos con reflejo.
  for (const [x, y] of [[-3.2, 6], [21.8, 9], [24, 2], [-4.5, 12], [9, 21.5], [26, 14]] as const) {
    const [px, py] = iso(x, y);
    s += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="26" ry="9" fill="#8fb4c8" opacity="0.7" stroke="#2a1d14" stroke-width="0.6"/><ellipse cx="${(px - 6).toFixed(1)}" cy="${(py - 2).toFixed(1)}" rx="9" ry="2.4" fill="#fff" opacity="0.5"/>`;
  }
  // Huellas de neumáticos hacia la puerta.
  for (const dx of [0, 0.7]) s += `<polyline points="${iso(8.5 + dx, 15)[0]},${iso(8.5 + dx, 15)[1]} ${iso(8.5 + dx, 20)[0]},${iso(8.5 + dx, 20)[1]}" stroke="#6b5636" stroke-width="2" opacity="0.4" fill="none"/>`;
  // Vía del tren, balasto y muelle (D3).
  s += tile(-40, 21.7, 100, 2.0, 'fill="#9b8f7a"');
  for (let x = -40; x < 60; x += 0.9) s += tile(x, PORT.trackY + 0.1, 0.35, 1.5, 'fill="#5a4630"');
  for (const dy of [0.35, 1.25]) s += `<polyline points="${iso(-40, PORT.trackY + dy)[0]},${iso(-40, PORT.trackY + dy)[1]} ${iso(60, PORT.trackY + dy)[0]},${iso(60, PORT.trackY + dy)[1]}" stroke="#c9ccd0" stroke-width="2.2" fill="none"/>`;
  s += tile(-40, 23.7, 100, 1.3, 'fill="#bdb6a6" stroke="#2a1d14" stroke-width="0.6"');
  s += block(-40, PORT.quayY, -0.2, 100, 0.4, 0.5, '#6f6a62');
  s += tile(-60, PORT.quayY + 0.4, 140, 70, 'fill="#3f7fa0"');
  for (let i = 0; i < 40; i++) {
    const x = -30 + r() * 80;
    const y = PORT.quayY + 0.8 + r() * 8;
    s += `<polyline points="${iso(x, y)[0]},${iso(x, y)[1]} ${iso(x + 1.6, y)[0]},${iso(x + 1.6, y)[1]}" stroke="#bfe3f2" stroke-width="1.4" opacity="0.5" fill="none"/>`;
  }
  // Árboles secos, farolas y cartel.
  const trees: [number, number, number][] = [];
  for (let x = -24; x < 46; x += 3.4 + r() * 2) trees.push([x, -6.6 - r() * 1.2, 0.9 + r() * 0.5], [x + 1, 21.2 + r() * 0.3, 0.8 + r() * 0.3]);
  for (let y = -3; y < 15; y += 4 + r() * 2) trees.push([22.5 + r(), y, 0.9 + r() * 0.4], [-4.2 - r(), y + 1.5, 0.9 + r() * 0.4]);
  const items = [...trees.map(([x, y, sc]) => ({ d: x + y, svg: tree(x, y, sc) })), ...LAMPS.map((l) => ({ d: l.x + l.y, svg: lampBody(l) })), { d: 12, svg: billboard(6.5, -7.4) }];
  items.sort((a, b) => a.d - b.d);
  s += items.map((i) => i.svg).join('');
  return s;
}

/** Barco con contenedores (se anima aparte: zarpa al enviar el cargamento). */
export function shipSvg(): string {
  let s = '';
  const sy = PORT.quayY + 1.8;
  s += block(2, sy, -0.5, 22, 3.2, 1.5, '#394b61');
  s += block(24, sy + 0.4, -0.5, 1.6, 2.4, 1.0, '#394b61');
  s += block(2, sy, 1.0, 22, 3.2, 0.15, '#c2683a');
  const cols = ['#c0392b', '#2f6fb3', '#d4a72c', '#3fa7a0', '#6b5a8a', '#e8e0d0'];
  const r = lcg(9);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 1 + Math.floor(r() * 3); k++) s += block(2.6 + i * 2.2, sy + 0.3 + j * 1.45, 1.15 + k * 0.62, 2.0, 1.3, 0.6, cols[Math.floor(r() * cols.length)]);
  s += block(20.5, sy + 0.5, 1.15, 2.6, 2.2, 2.6, '#e8e0d0') + block(20.7, sy + 0.7, 3.75, 2.2, 1.8, 0.5, '#cfd8dc') + cyl(21.3, sy + 1.6, 4.2, 0.28, 0.9, '#c0392b');
  return s;
}

/** Puerto por delante: grúa pórtico sobre la vía. */
export function portFrontSvg(): string {
  let s = '';
  // Grúa pórtico que cruza la vía.
  const cx = 11;
  const legs: [number, number][] = [[cx, 21.5], [cx + 3.2, 21.5], [cx, 24.2], [cx + 3.2, 24.2]];
  for (const [lx, ly] of legs) s += block(lx, ly, 0, 0.22, 0.22, 4.2, '#d9443a');
  s += block(cx - 0.1, 21.4, 4.2, 3.6, 3.0, 0.3, '#d9443a');
  s += block(cx + 1.4, 20.4, 4.5, 0.4, 9.2, 0.3, '#e8e0d0');
  s += block(cx + 1.0, 22.2, 4.8, 1.2, 1.0, 0.8, '#3b4a5a');
  return s;
}

// ---- Interior de la nave (D5) ----

function rack(x: number, y: number, len: number): string {
  let s = '';
  const cols = ['#c58a4a', '#b5523b', '#5f7d91', '#c9a24a'];
  for (let p = 0; p <= len; p += len / 3) s += block(x + p - 0.04, y, 0, 0.08, 0.7, 1.9, '#4a6a8a');
  for (let level = 0; level < 3; level++) {
    s += block(x, y, 0.3 + level * 0.6, len, 0.7, 0.06, '#d9a43a');
    for (let k = 0; k < 4; k++) if ((k + level) % 3 !== 2) s += block(x + 0.15 + k * (len / 4), y + 0.12, 0.36 + level * 0.6, len / 4 - 0.25, 0.45, 0.35, cols[(k + level) % cols.length]);
  }
  return s;
}

function office(x: number, y: number): string {
  return (
    block(x, y, 0, 2.8, 2.2, 0.15, '#9aa5ab') +
    block(x, y, 0.15, 2.8, 2.2, 1.4, '#d7dde0') +
    block(x + 0.15, y + 2.2, 0.55, 2.5, 0.02, 0.7, '#8fc4dc', { edge: false }) +
    block(x + 2.8, y + 0.25, 0.55, 0.02, 1.7, 0.7, '#8fc4dc', { edge: false }) +
    block(x - 0.1, y - 0.1, 1.55, 3.0, 2.4, 0.15, '#6f6a62') +
    block(x + 1.1, y + 2.18, 0.15, 0.6, 0.04, 1.0, '#3b3b3b', { edge: false })
  );
}

/** Interior vacío de la nave rellenado: estanterías, oficina, depósitos, bidones, taquillas y palés. Va detrás de las máquinas. */
export function hallInteriorSvg(): string {
  const items: { d: number; svg: string }[] = [];
  const add = (d: number, svg: string) => items.push({ d, svg });
  add(0, rack(5.2, -0.3, 2.8) + rack(8.6, -0.3, 2.8));
  add(1, office(15.6, -0.3));
  // Depósitos con tubería.
  add(2, cyl(12.4, 1.0, 0, 0.55, 1.5, '#8f6f5a') + cyl(13.8, 1.0, 0, 0.55, 1.5, '#8f6f5a') + block(12.0, 2.0, 0.3, 2.3, 0.1, 0.1, '#9a9a9a'));
  // Bidones junto a la pila.
  for (let k = 0; k < 5; k++) add(4 + k * 0.1, cyl(4.5 + (k % 3) * 0.45, 0.5 + Math.floor(k / 3) * 0.5, 0, 0.18, 0.5, k % 2 ? '#c0392b' : '#2f6fb3'));
  // Taquillas en la pared derecha.
  for (let k = 0; k < 6; k++) add(19 + k * 0.2, block(18.6, 4.6 + k * 0.5, 0, 0.5, 0.45, 1.3, k % 2 ? '#4a7a6a' : '#5a7a9a'));
  // Palés apilados de la esquina.
  for (let k = 0; k < 3; k++) add(30 + k, block(18.4, 10.3 + k * 1.2, 0, 0.9, 0.9, 0.12, '#b07a45') + block(18.45, 10.35 + k * 1.2, 0.12, 0.8, 0.8, 0.45 + (k % 2) * 0.3, '#c58a4a'));
  items.sort((a, b) => a.d - b.d);
  return items.map((i) => i.svg).join('');
}

const XRAY = 'stroke="#d8f3ff" stroke-width="1.3" stroke-dasharray="7 5" fill="none"';

/** Paredes del fondo de la nave como cristal tenue. */
export function hallBackSvg(): string {
  const { x0, x1, y0, y1, wall, ridge } = HALL;
  const back = pts([iso(x0, y0, 0), iso(x1, y0, 0), iso(x1, y0, wall), iso((x0 + x1) / 2, y0, ridge + 0.4), iso(x0, y0, wall)]);
  const left = pts([iso(x0, y0, 0), iso(x0, y1, 0), iso(x0, y1, wall), iso(x0, (y0 + y1) / 2, ridge), iso(x0, y0, wall)]);
  return `<polygon points="${back}" fill="#cfeaff" opacity="0.07"/><polygon points="${left}" fill="#cfeaff" opacity="0.12"/>
    <polygon points="${back}" ${XRAY} opacity="0.45"/><polygon points="${left}" ${XRAY} opacity="0.45"/>`;
}

/** Estructura de la nave por delante (columnas, vigas, cerchas y tuberías del techo) en líneas de rayos X. */
export function hallFrameSvg(): string {
  const { x0, x1, y0, y1, wall, ridge } = HALL;
  const line = (a: [number, number], b: [number, number]) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"/>`;
  const ym = (y0 + y1) / 2;
  let s = '';
  for (let x = x0; x <= x1 + 0.01; x += 5) {
    s += line(iso(x, y1, 0), iso(x, y1, wall));
    s += line(iso(x, y1, wall), iso(x, ym, ridge));
    s += line(iso(x, ym, ridge), iso(x, y0, wall));
  }
  for (let y = y0; y <= y1 + 0.01; y += 5) s += line(iso(x1, y, 0), iso(x1, y, wall));
  s += line(iso(x0, y1, wall), iso(x1, y1, wall));
  s += line(iso(x1, y1, wall), iso(x1, y0, wall));
  s += line(iso(x0, ym, ridge), iso(x1, ym, ridge));
  s += line(iso(x1, y1, 0), iso(x1, y0, 0));
  s += line(iso(x1, y1, wall), iso(x1, ym, ridge));
  s += line(iso(x1, ym, ridge), iso(x1, y0, wall));
  // Tuberías y cables bajo la cubierta.
  for (const dy of [3, 7, 11]) s += line(iso(x0, dy, wall - 0.5), iso(x1, dy, wall - 0.5));
  return `<g stroke="#d8f3ff" stroke-width="1.3" stroke-dasharray="7 5" opacity="0.3" fill="none">${s}</g>`;
}

/** Sombras y manchas de aceite en el suelo de la nave. */
export function floorDetailsSvg(): string {
  const rand = lcg(77);
  let s = '';
  for (let i = 0; i < 14; i++) s += tile(rand() * 18.5, rand() * 14, 0.5 + rand() * 0.8, 0.4 + rand() * 0.5, 'fill="#2a1d14" opacity="0.07"');
  return s;
}

/** Andamio y lona de una zona cerrada (esquina `x`,`y`, lado `size`). */
export function scaffoldSvg(x: number, y: number, size: number): string {
  let s = '';
  const poles: [number, number][] = [[x + 0.1, y + 0.1], [x + size - 0.3, y + 0.1], [x + 0.1, y + size - 0.3], [x + size - 0.3, y + size - 0.3]];
  // Lona tenue en las dos caras del fondo.
  const tarp = (a: [number, number], b: [number, number], c: string) => `<polygon points="${pts([iso(a[0], a[1], 0.2), iso(b[0], b[1], 0.2), iso(b[0], b[1], 2.2), iso(a[0], a[1], 2.2)])}" fill="${c}" opacity="0.5"/>`;
  s += tarp([x + 0.1, y + 0.1], [x + size - 0.2, y + 0.1], '#3f8fa0');
  s += tarp([x + 0.1, y + 0.1], [x + 0.1, y + size - 0.2], '#4a9a7a');
  for (const [px, py] of poles) s += block(px, py, 0, 0.12, 0.12, 2.4, '#8a8a8a');
  for (const z of [0.8, 1.6, 2.4]) {
    s += block(x + 0.1, y + 0.1, z, size - 0.3, 0.06, 0.05, '#c9a24a', { edge: false });
    s += block(x + 0.1, y + size - 0.3, z, size - 0.3, 0.06, 0.05, '#c9a24a', { edge: false });
    s += block(x + 0.1, y + 0.1, z, 0.06, size - 0.3, 0.05, '#c9a24a', { edge: false });
    s += block(x + size - 0.3, y + 0.1, z, 0.06, size - 0.3, 0.05, '#c9a24a', { edge: false });
  }
  s += block(x + size - 0.9, y + size - 0.9, 0, 0.5, 0.5, 0.35, '#c58a4a');
  s += block(x + 0.5, y + size - 0.7, 0, 0.22, 0.22, 0.45, '#e8731f');
  return s;
}
