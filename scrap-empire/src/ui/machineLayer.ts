// Capa de canvas (PixiJS, licencia MIT) con las máquinas de las líneas: primera parte de pasar el mapa de SVG a canvas (S1).
// El cuerpo de cada máquina se dibuja una vez desde el mismo SVG de siempre y se guarda como textura (mismo aspecto);
// lo que se mueve (prensa, engranaje, chispa, humo y luz) se dibuja aquí por código. Si WebGL no arranca, el mapa sigue en SVG.
// Segunda parte: el suelo de cada puesto (con su borde de rayas) y sus cintas, con la chatarra que avanza, también van aquí,
// debajo de todas las máquinas.
import { Application, CanvasSource, Container, Graphics, Sprite, Texture } from 'pixi.js';
import { iso } from './iso';
import type { MachineGeom } from './yard';

/** Recuadro (en píxeles locales de la máquina) que se hornea en la textura, y su resolución. */
const BOX = { x: -50, y: -52, w: 100, h: 100 };
/** 512 × 512 píxeles (potencia de dos: admite mipmaps en todos los móviles). */
const RES = 5.12;
const EDGE = 0x2a1d14;

export interface MachineSpot {
  /** Posición en el mapa (píxeles del mundo) y escala de la máquina. */
  x: number;
  y: number;
  scale: number;
}

/** Polígono del suelo (puntos ya en píxeles del mundo), como un `tile()` del SVG. */
export interface FloorTile {
  pts: [number, number][];
  fill?: string;
  stroke?: string;
  width?: number;
  /** Rayas del borde (como stroke-dasharray). */
  dash?: [number, number];
  /** Opacidad de todo el polígono (relleno y borde). */
  alpha?: number;
}

/** Chatarra que avanza por una cinta: trazo de rayas animado de `a` a `b`. */
export interface FloorFlow {
  a: [number, number];
  b: [number, number];
  color: string;
}

export interface MachineLayer {
  canvas: HTMLCanvasElement;
  /** Pone las máquinas de la línea `i` (o ninguna). `body` da el SVG fijo y la geometría de una máquina de ese nivel. */
  setLine(i: number, spots: MachineSpot[], variant: string, body: () => { svg: string; geom: MachineGeom }): void;
  /** Estado de la animación de una línea en este fotograma. */
  /** Pone el suelo y las cintas del puesto `i` (debajo de todas las máquinas). */
  setFloor(i: number, tiles: FloorTile[], flows: FloorFlow[]): void;
  animate(i: number, level: number, phase: number, gearAngle: number, inView: boolean): void;
  /** Rebote de subida de nivel (como `.levelup`) con el pie en (px, py). */
  levelUp(i: number, px: number, py: number): void;
  /** Entrada desde arriba al abrir la zona. */
  opening(i: number): void;
  setLowQuality(low: boolean): void;
  /** Mismo encuadre que el viewBox del SVG. */
  setView(x0: number, y0: number, scale: number, w: number, h: number): void;
  render(t: number): void;
}

/** Color de SVG (#rgb, #rrggbb o rgb(r,g,b)) a número, opcionalmente aclarado u oscurecido. */
const num = (color: string, f = 1): number => {
  let n = 0;
  const rgb = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(color);
  if (rgb) n = (+rgb[1] << 16) | (+rgb[2] << 8) | +rgb[3];
  else {
    const hex = color.slice(1);
    n = parseInt(hex.length === 3 ? [...hex].map((ch) => ch + ch).join('') : hex, 16) || 0;
  }
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return (c((n >> 16) & 255) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255);
};

/** Bloque isométrico (tapa y caras +x y +y) como en `block()` de iso.ts. */
function drawBlock(g: Graphics, x: number, y: number, z: number, w: number, d: number, h: number, color: string): void {
  const p = (a: number, b: number, c: number) => iso(a, b, c);
  const face = (list: [number, number][], fill: number) => g.poly(list.flat(), true).fill({ color: fill }).stroke({ width: 0.9, color: EDGE, join: 'round' });
  face([p(x + w, y, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x + w, y, z + h)], num(color, 0.82));
  face([p(x, y + d, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x, y + d, z + h)], num(color, 0.66));
  face([p(x, y, z + h), p(x + w, y, z + h), p(x + w, y + d, z + h), p(x, y + d, z + h)], num(color, 1.12));
}

// Engranaje: en el SVG va dentro de matrix(-28 14 0 -20 26.6 13.3) translate(0.55 gz) y gira sobre su centro.
const GEAR_RING = Array.from({ length: 14 }, (_, k) => [0.13 * Math.cos((k / 14) * Math.PI * 2), 0.13 * Math.sin((k / 14) * Math.PI * 2)] as [number, number]);
const GEAR_HUB = Array.from({ length: 10 }, (_, k) => [0.05 * Math.cos((k / 10) * Math.PI * 2), 0.05 * Math.sin((k / 10) * Math.PI * 2)] as [number, number]);
const GEAR_TEETH = [0, 45, 90, 135].map((a) => {
  const r = (a * Math.PI) / 180;
  return ([[-0.03, -0.19], [0.03, -0.19], [0.03, 0.19], [-0.03, 0.19]] as [number, number][]).map(([u, v]) => [u * Math.cos(r) - v * Math.sin(r), u * Math.sin(r) + v * Math.cos(r)] as [number, number]);
});

function drawGear(g: Graphics, gz: number, deg: number): void {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const map = (list: [number, number][]) =>
    list.flatMap(([u, v]) => {
      const a = u * c - v * s + 0.55;
      const b = u * s + v * c + gz;
      return [-28 * a + 26.6, 14 * a - 20 * b + 13.3];
    });
  g.clear();
  const line = { width: 0.7, color: EDGE };
  g.poly(map(GEAR_RING), true).fill({ color: 0x3b3b3b }).stroke(line);
  for (const tooth of GEAR_TEETH) g.poly(map(tooth), true).fill({ color: 0x3b3b3b }).stroke(line);
  g.poly(map(GEAR_HUB), true).fill({ color: 0x8a8a8a }).stroke(line);
}

/** Recorre una línea quebrada y llama a `seg` con cada raya [on, off] desplazada `shift` píxeles hacia delante. */
function dashes(pts: [number, number][], closed: boolean, on: number, off: number, shift: number, seg: (path: number[]) => void): void {
  const list = closed ? [...pts, pts[0]] : pts;
  const cum = [0];
  for (let k = 1; k < list.length; k++) cum.push(cum[k - 1] + Math.hypot(list[k][0] - list[k - 1][0], list[k][1] - list[k - 1][1]));
  const total = cum[cum.length - 1];
  if (total <= 0) return;
  const at = (d: number): [number, number] => {
    let k = 1;
    while (k < list.length - 1 && cum[k] < d) k++;
    const len = cum[k] - cum[k - 1] || 1;
    const u = (d - cum[k - 1]) / len;
    return [list[k - 1][0] + (list[k][0] - list[k - 1][0]) * u, list[k - 1][1] + (list[k][1] - list[k - 1][1]) * u];
  };
  const period = on + off;
  for (let p = (((shift % period) + period) % period) - period; p < total; p += period) {
    const d0 = Math.max(0, p);
    const d1 = Math.min(total, p + on);
    if (d1 <= d0) continue;
    const path = [...at(d0)];
    for (let k = 1; k < list.length; k++) if (cum[k] > d0 && cum[k] < d1) path.push(list[k][0], list[k][1]);
    path.push(...at(d1));
    seg(path);
  }
}

function drawTiles(g: Graphics, tiles: FloorTile[]): void {
  g.clear();
  for (const t of tiles) {
    const alpha = t.alpha ?? 1;
    if (t.fill) g.poly(t.pts.flat(), true).fill({ color: num(t.fill), alpha });
    if (!t.stroke) continue;
    const line = { width: t.width ?? 1, color: num(t.stroke), alpha, join: 'round' as const };
    if (!t.dash) {
      g.poly(t.pts.flat(), true).stroke(line);
      continue;
    }
    dashes(t.pts, true, t.dash[0], t.dash[1], 0, (path) => {
      g.moveTo(path[0], path[1]);
      for (let k = 2; k < path.length; k += 2) g.lineTo(path[k], path[k + 1]);
    });
    g.stroke(line);
  }
}

interface Machine {
  root: Container;
  sprite: Sprite;
  press: Graphics;
  fx: Container;
  gear: Graphics;
  spark: Graphics;
  puffs: Graphics[];
  lampOff: Graphics | null;
  geom: MachineGeom;
}

interface LineView {
  root: Container;
  machines: Machine[];
  level: number;
  phase: number;
  gearAngle: number;
  inView: boolean;
  /** Animaciones en curso (segundos de reloj en que empezaron). */
  bounce: number;
  pivot: [number, number];
  enter: number;
  floor: Graphics;
  flowG: Graphics;
  flows: FloorFlow[];
}

/** Hornea el SVG fijo de una máquina en una textura (asíncrono: el navegador decodifica la imagen). */
function bake(svg: string): Promise<Texture> {
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}" width="512" height="512"><defs><radialGradient id="glow"><stop offset="0" stop-color="#ffe9a0" stop-opacity="0.9"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient></defs>${svg}</svg>`;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = 512;
      cv.height = 512;
      const ctx = cv.getContext('2d');
      if (!ctx) return reject(new Error('sin 2d'));
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      resolve(new Texture({ source: new CanvasSource({ resource: cv, autoGenerateMipmaps: true }) }));
    };
    img.onerror = () => reject(new Error('no se pudo dibujar la máquina'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup);
  });
}

export async function createMachineLayer(lineCount: number): Promise<MachineLayer | null> {
  if (new URLSearchParams(location.search).has('svg')) return null; // ?svg=1: el mapa entero en SVG, para comparar.
  const app = new Application();
  try {
    await app.init({
      width: 380,
      height: 640,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(2, window.devicePixelRatio || 1),
      autoDensity: true,
      autoStart: false,
      preference: 'webgl',
    });
  } catch {
    return null;
  }
  app.ticker?.stop();
  const canvas = app.canvas as unknown as HTMLCanvasElement;
  let size = [380, 640];
  canvas.classList.add('machine-layer');
  const world = new Container();
  app.stage.addChild(world);
  const ground = new Container();
  world.addChild(ground);
  const textures = new Map<string, Promise<Texture>>();
  let low = false;

  const lines: LineView[] = Array.from({ length: lineCount }, () => {
    const root = new Container();
    world.addChild(root);
    const floor = new Graphics();
    const flowG = new Graphics();
    ground.addChild(floor, flowG);
    return { root, machines: [], level: 0, phase: 0, gearAngle: 0, inView: true, bounce: -1, pivot: [0, 0], enter: -1, floor, flowG, flows: [] };
  });

  function makeMachine(spot: MachineSpot, tex: Promise<Texture>, geom: MachineGeom): Machine {
    const root = new Container();
    root.position.set(spot.x, spot.y);
    root.scale.set(spot.scale);
    const sprite = new Sprite(Texture.EMPTY);
    sprite.position.set(BOX.x, BOX.y);
    sprite.scale.set(1 / RES);
    sprite.visible = false;
    tex.then(
      (t) => {
        sprite.texture = t;
        sprite.visible = true;
      },
      () => {},
    );
    root.addChild(sprite);
    const press = new Graphics();
    drawBlock(press, 0.12, 0.22, geom.h, 0.5, 0.45, 0.16, '#3b3b3b');
    root.addChild(press);
    let lampOff: Graphics | null = null;
    if (geom.lamp) {
      const off = new Graphics();
      off.circle(geom.lamp[0], geom.lamp[1], 3.2).fill({ color: 0x2f6f3a }).stroke({ width: 0.8, color: EDGE });
      off.visible = false;
      root.addChild(off);
      lampOff = off;
    }
    const fx = new Container();
    fx.visible = false;
    const spark = new Graphics().circle(geom.spark[0], geom.spark[1], 3.4).fill({ color: 0xffe37a });
    const gear = new Graphics();
    const puffs = [0, 1, 2].map(() => new Graphics().circle(0, 0, 5).fill({ color: 0xe6dccb }));
    fx.addChild(spark, gear, ...puffs);
    root.addChild(fx);
    return { root, sprite, press, fx, gear, spark, puffs, lampOff, geom };
  }

  return {
    canvas,
    setLine(i, spots, variant, body) {
      const l = lines[i];
      for (const m of l.machines) m.root.destroy({ children: true });
      l.machines = [];
      if (!spots.length) return;
      const { svg, geom } = body();
      let tex = textures.get(variant);
      if (!tex) {
        tex = bake(svg);
        textures.set(variant, tex);
        tex.catch(() => textures.delete(variant));
      }
      for (const spot of spots) {
        const m = makeMachine(spot, tex, geom);
        l.root.addChild(m.root);
        l.machines.push(m);
      }
    },
    setFloor(i, tiles, flows) {
      const l = lines[i];
      drawTiles(l.floor, tiles);
      l.flows = flows;
      l.flowG.clear();
    },
    animate(i, level, phase, gearAngle, inView) {
      const l = lines[i];
      l.level = level;
      l.phase = phase;
      l.gearAngle = gearAngle;
      l.inView = inView;
    },
    levelUp(i, px, py) {
      lines[i].bounce = performance.now() / 1000;
      lines[i].pivot = [px, py];
    },
    opening(i) {
      lines[i].enter = performance.now() / 1000;
    },
    setLowQuality(v) {
      low = v;
    },
    setView(x0, y0, scale, w, h) {
      if (size[0] !== w || size[1] !== h) {
        size = [w, h];
        app.renderer.resize(w, h);
      }
      world.scale.set(scale);
      world.position.set(-x0 * scale, -y0 * scale);
    },
    render(t) {
      const now = performance.now() / 1000;
      const sparkOn = !low && Math.floor(t / 0.14) % 2 === 1;
      const lampDark = !low && now % 1 >= 0.5;
      // Rayas de la chatarra en las cintas: 4 px de raya y 14 de hueco que avanzan 18 px cada 0,9 s (sin moverse en «Calidad baja»).
      const shift = low ? 0 : ((now / 0.9) % 1) * 18;
      for (const l of lines) {
        l.floor.visible = l.inView;
        l.flowG.visible = l.inView && l.level > 0 && l.flows.length > 0;
        if (l.flowG.visible) {
          l.flowG.clear();
          for (const f of l.flows) {
            dashes([f.a, f.b], false, 4, 14, shift, (path) => {
              l.flowG.moveTo(path[0], path[1]);
              for (let k = 2; k < path.length; k += 2) l.flowG.lineTo(path[k], path[k + 1]);
            });
            l.flowG.stroke({ width: 3.2, color: num(f.color), cap: 'round' });
          }
          l.flowG.alpha = 0.95 * l.level;
        }
        if (!l.machines.length) continue;
        l.root.visible = l.inView;
        if (!l.inView) continue;
        // Rebote de nivel: 30 % ancho 1,14 y alto 0,9; 60 % 0,96 y 1,06 (como la animación CSS).
        const b = l.bounce < 0 ? 1 : (now - l.bounce) / 0.9;
        let sx = 1;
        let sy = 1;
        if (b < 1) {
          const k = (a: number, c: number, u: number) => a + (c - a) * u;
          if (b < 0.3) [sx, sy] = [k(1, 1.14, b / 0.3), k(1, 0.9, b / 0.3)];
          else if (b < 0.6) [sx, sy] = [k(1.14, 0.96, (b - 0.3) / 0.3), k(0.9, 1.06, (b - 0.3) / 0.3)];
          else [sx, sy] = [k(0.96, 1, (b - 0.6) / 0.4), k(1.06, 1, (b - 0.6) / 0.4)];
        } else l.bounce = -1;
        l.root.pivot.set(l.pivot[0], l.pivot[1]);
        l.root.position.set(l.pivot[0], l.pivot[1]);
        l.root.scale.set(sx, sy);
        // Entrada al abrir la zona: baja desde 46 px más arriba y aparece (0,9 s).
        const e = l.enter < 0 ? 1 : (now - l.enter) / 0.9;
        if (e < 1) {
          const u = 1 - (1 - e) * (1 - e);
          l.root.y += u < 0.7 ? -46 + (50 * u) / 0.7 : 4 - (4 * (u - 0.7)) / 0.3;
          l.root.alpha = Math.min(1, u / 0.7);
        } else {
          l.enter = -1;
          l.root.alpha = 1;
        }
        const wave = 0.5 + 0.5 * Math.sin(l.phase);
        const shown = l.level > 0;
        for (const m of l.machines) {
          m.press.y = l.level * wave * 7;
          if (m.lampOff) m.lampOff.visible = lampDark;
          m.fx.visible = shown;
          if (!shown) continue;
          m.fx.alpha = l.level;
          m.spark.visible = sparkOn;
          drawGear(m.gear, m.geom.h * 0.5, l.gearAngle);
          m.puffs.forEach((p, k) => {
            p.visible = !low;
            if (low) return;
            const ph = (((now + k * 0.8) / 2.4) % 1 + 1) % 1;
            const u = 1 - (1 - ph) * (1 - ph);
            p.position.set(m.geom.chimney[0] + 7 * u, m.geom.chimney[1] - 36 * u);
            p.scale.set(0.5 + 1.2 * u);
            p.alpha = 0.8 * (1 - u);
          });
        }
      }
      app.render();
    },
  };
}
