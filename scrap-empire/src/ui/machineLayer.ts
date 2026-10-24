// Capa de canvas (PixiJS, licencia MIT) con las máquinas de las líneas: primera parte de pasar el mapa de SVG a canvas (S1).
// El cuerpo de cada máquina se dibuja una vez desde el mismo SVG de siempre y se guarda como textura (mismo aspecto);
// lo que se mueve (prensa, engranaje, chispa, humo y luz) se dibuja aquí por código. Si WebGL no arranca, el mapa sigue en SVG.
// Segunda parte: el suelo de cada puesto (con su borde de rayas) y sus cintas, con la chatarra que avanza, también van aquí,
// debajo de todas las máquinas. Tercera parte: el ayudante de cada puesto (piernas fijas y torso que se mueve al trabajar),
// encima de todas las máquinas. Cuarta parte: el palé de cada línea y las carretillas, encima de los ayudantes
// (la carretilla, por bloques girados como en el SVG; lo que lleva, con la textura horneada del producto).
// Quinta parte: el camión de expedición del muelle (chasis y caja horneados en dos piezas, con los productos en medio)
// y los coches de la carretera de delante, encima de todo lo de la nave (están fuera, delante de ella).
// Sexta parte (#16): los tres AGV de las rutas azules, por bloques girados como la carretilla, debajo de las carretillas.
// Séptima parte (#16): la pila de chatarra, horneada en una textura que crece con la chatarra y salta al tocarla;
// va encima de lo de la nave (como en el SVG, donde estaba en la capa de delante) y el toque lo sigue recibiendo el SVG.
// Octava parte (#16): los coches de la autopista elevada del fondo y los pájaros, debajo de todo (están en el cielo,
// por encima del horizonte, donde la nave no llega); las nubes siguen en el SVG porque pasan por detrás de la ciudad.
// Novena parte (#16): el tren de mercancías y el barco del puerto, horneados cada uno en una textura, encima de todo
// (están delante de la carretera); la grúa pórtico y la noche siguen en el SVG de delante y los tapan como antes.
import { Application, CanvasSource, Container, Graphics, GraphicsContext, Sprite, Texture } from 'pixi.js';
import { iso, rblockFaces } from './iso';
import { AGV_SHADOW, FORKLIFT_SHADOW, TRUCK_SLOTS, agvPieces, forkliftPieces, truckSlotAt } from './vehicles';
import type { MachineGeom } from './yard';

/** Recuadro (en píxeles locales de la máquina) que se hornea en la textura, y su resolución. */
const BOX = { x: -50, y: -52, w: 100, h: 100 };
/** 512 × 512 píxeles (potencia de dos: admite mipmaps en todos los móviles). */
const RES = 5.12;
/** Recuadro del ayudante (píxeles locales antes de su escala ×1,45): 32 × 64 → 128 × 256 píxeles. */
const PERSON_BOX = { x: -16, y: -44, w: 32, h: 64 };
const PERSON_RES = 4;
/** Recuadro del palé de una línea (ya con su escala ×1,25): 80 × 128 → 256 × 410 píxeles. */
const PALLET_BOX = { x: -40, y: -96, w: 80, h: 128 };
const PALLET_RES = 3.2;
/** Recuadro de un producto (esquina en el origen): 64 × 64 → 256 × 256 píxeles. */
const PROP_BOX = { x: -32, y: -44, w: 64, h: 64 };
const PROP_RES = 4;
/** Recuadro del camión de expedición (píxeles desde su esquina): 128 × 96 → 512 × 384 píxeles. */
const TRUCK_BOX = { x: -40, y: -32, w: 128, h: 96 };
const TRUCK_RES = 4;
/** Recuadro de un coche de la carretera: 72 × 48 → 288 × 192 píxeles. */
const CAR_BOX = { x: -32, y: -24, w: 72, h: 48 };
const CAR_RES = 4;
/** Recuadro de la pila (píxeles desde la esquina de atrás de su sitio, sin escalar): 192 × 112 → 768 × 448 píxeles. */
const PILE_BOX = { x: -100, y: -60, w: 192, h: 112 };
const PILE_RES = 4;
/** Recuadro de un coche de la autopista del fondo (con su altura de 2,7): 48 × 32 → 192 × 128 píxeles. */
const HWAY_BOX = { x: -24, y: -22, w: 48, h: 32 };
const HWAY_RES = 4;
/** Recuadros del tren (en la vía, x = 0) y del barco (atracado), en píxeles absolutos como su SVG. */
const TRAIN_BOX = { x: -660, y: 283, w: 582, h: 316 };
const SHIP_BOX = { x: -790, y: 362, w: 752, h: 428 };
const PORT_RES = 2;
/** Pájaro: «M-7 0 Q-3.5 -5 0 0 Q3.5 -5 7 0», trazo de 1,6; aletea con el centro de su caja a 1,25 px por encima. */
const BIRD_PIVOT_Y = -1.25;
/** La carretilla gira en pasos de 10° (como las variantes del SVG). */
const CART_STEPS = 36;
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

/** Carretilla en este fotograma: posición en el mapa (píxeles), hacia dónde mira, de qué línea es y cuántos productos lleva. */
export interface CartPose {
  x: number;
  y: number;
  ang: number;
  zone: string;
  loads: number;
}

/** AGV en este fotograma: posición en el mapa (píxeles), hacia dónde mira y si lleva el contenedor de chatarra. */
export interface AgvPose {
  x: number;
  y: number;
  ang: number;
  loaded: boolean;
}

/** Coche de la carretera en este fotograma: posición (píxeles) y su aspecto (`key`, que dibuja `svg` de `setCars`). */
export interface CarPose {
  x: number;
  y: number;
  key: string;
}

export interface MachineLayer {
  canvas: HTMLCanvasElement;
  /** Pone las máquinas de la línea `i` (o ninguna). `body` da el SVG fijo y la geometría de una máquina de ese nivel. */
  setLine(i: number, spots: MachineSpot[], variant: string, body: () => { svg: string; geom: MachineGeom }): void;
  /** Estado de la animación de una línea en este fotograma. */
  /** Pone el suelo y las cintas del puesto `i` (debajo de todas las máquinas). */
  setFloor(i: number, tiles: FloorTile[], flows: FloorFlow[]): void;
  /** Pone el ayudante del puesto `i` (o ninguno). `key` identifica su aspecto; `parts` da su SVG en dos piezas. */
  setWorker(i: number, spot: MachineSpot | null, key: string, parts: () => { base: string; torso: string }): void;
  /** Pone el palé de la línea `i` (o ninguno). `key` identifica lo que lleva; `svg` lo dibuja. */
  setPallet(i: number, spot: { x: number; y: number } | null, key: string, svg: () => string): void;
  /** Las carretillas visibles en este fotograma; `prop` da el SVG del producto de una línea. */
  setCarts(carts: CartPose[], prop: (zone: string) => string): void;
  /** Los AGV en este fotograma. */
  setAgvs(agvs: AgvPose[]): void;
  /** Camión de expedición en (x, y) píxeles con `ids` en la caja (o ninguno); `parts` da su SVG de detrás y de delante de la carga. */
  setShipTruck(pos: { x: number; y: number } | null, ids: string[], parts: () => { back: string; front: string }, prop: (zone: string) => string): void;
  /** Coches de la carretera de delante en este fotograma; `svg` dibuja el aspecto `key`. */
  setCars(cars: CarPose[], svg: (key: string) => string): void;
  /** Coches de la autopista del fondo en este fotograma (posición ya con la altura); `svg` dibuja el aspecto `key`. */
  setHwayCars(cars: CarPose[], svg: (key: string) => string): void;
  /** Pájaros del cielo en este fotograma (píxeles) y su opacidad (de noche no se ven). */
  setBirds(birds: [number, number][], alpha: number): void;
  /** Hornea el tren y el barco; se cumple cuando ya se ven (para esconder los del SVG sin parpadeo). */
  setPort(trainSvg: string, shipSvg: string): Promise<void>;
  /** Desplazamiento en píxeles del tren y del barco en este fotograma (como su `transform` en el SVG). */
  setPortPos(train: { x: number; y: number }, ship: { x: number; y: number }): void;
  /** Pone la pila con su esquina de atrás en (x, y) píxeles; se cumple cuando ya se ve (para esconder la del SVG sin parpadeo). */
  setPile(pos: { x: number; y: number }, svg: () => string): Promise<void>;
  /** Tamaño de la pila en este fotograma (como el `scale` de `.pile-body`). */
  setPileScale(scale: number): void;
  /** Salto de la pila al tocarla (como `.pile-body.jiggle`). */
  jigglePile(): void;
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
  worker: { root: Container; torso: Sprite } | null;
  pallet: Sprite | null;
}

interface CartView {
  root: Container;
  back: Graphics;
  loads: Sprite[];
  front: Graphics;
  key: string;
}

/** Hornea el SVG fijo de una máquina en una textura (asíncrono: el navegador decodifica la imagen). */
function bake(svg: string, box = BOX, res = RES): Promise<Texture> {
  const pw = Math.round(box.w * res);
  const ph = Math.round(box.h * res);
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.x} ${box.y} ${box.w} ${box.h}" width="${pw}" height="${ph}"><defs><radialGradient id="glow"><stop offset="0" stop-color="#ffe9a0" stop-opacity="0.9"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient></defs>${svg}</svg>`;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = pw;
      cv.height = ph;
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
  // Resolución del lienzo: hasta 2 (más no se nota en el móvil); en «Calidad baja», 1 (la mitad o menos de píxeles que pintar).
  const baseRes = Math.min(2, window.devicePixelRatio || 1);
  try {
    await app.init({
      width: 380,
      height: 640,
      backgroundAlpha: 0,
      antialias: true,
      resolution: baseRes,
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
  // Lo del cielo, debajo de todo: los coches de la autopista del fondo y, delante, los pájaros (como en el SVG).
  const skyG = new Container();
  const hwayG = new Container();
  const birdsG = new Container();
  skyG.addChild(hwayG, birdsG);
  world.addChild(skyG);
  const ground = new Container();
  world.addChild(ground);
  // Los ayudantes van encima de todas las máquinas (se añade al mundo después de las líneas); encima, los palés y las carretillas.
  const people = new Container();
  const palletsG = new Container();
  const cartsG = new Container();
  const agvG = new Container();
  // Fuera de la nave, delante: el camión de expedición y, más cerca, los coches de la carretera.
  const truckG = new Container();
  truckG.visible = false;
  const carsG = new Container();
  const pileG = new Container();
  pileG.visible = false;
  let pileJig = -1;
  let pileY = 0;
  const textures = new Map<string, Promise<Texture>>();
  /** Las texturas ya horneadas, para ponerlas en el mismo fotograma (sin parpadeo al girar la carretilla). */
  const ready = new Map<string, Texture>();
  let low = false;

  const lines: LineView[] = Array.from({ length: lineCount }, () => {
    const root = new Container();
    world.addChild(root);
    const floor = new Graphics();
    const flowG = new Graphics();
    ground.addChild(floor, flowG);
    return { root, machines: [], level: 0, phase: 0, gearAngle: 0, inView: true, bounce: -1, pivot: [0, 0], enter: -1, floor, flowG, flows: [], worker: null, pallet: null };
  });
  // El puerto, delante de la carretera: el tren en la vía y, más cerca, el barco (como en el SVG).
  const trainG = new Container();
  const shipG = new Container();
  trainG.visible = shipG.visible = false;
  let portReady = false;
  world.addChild(people, palletsG, agvG, cartsG, pileG, truckG, carsG, trainG, shipG);
  const cartViews: CartView[] = [];
  /** Dibujo de la carretilla por ángulo y carga: lo de detrás de la carga y lo de delante (se comparte entre carretillas). */
  const cartBodies = new Map<string, { back: GraphicsContext; front: GraphicsContext }>();
  const shadow = new GraphicsContext().ellipse(iso(0, 0)[0], iso(0, 0)[1] + FORKLIFT_SHADOW.dy, FORKLIFT_SHADOW.rx, FORKLIFT_SHADOW.ry).fill({ color: 0x000000, alpha: FORKLIFT_SHADOW.alpha });

  const agvViews: { root: Container; body: Graphics; key: string }[] = [];
  /** Dibujo del AGV por ángulo (pasos de 10°) y carga, compartido entre los AGV. */
  const agvBodies = new Map<string, GraphicsContext>();
  const agvShadow = new GraphicsContext().ellipse(iso(0, 0)[0], iso(0, 0)[1] + AGV_SHADOW.dy, AGV_SHADOW.rx, AGV_SHADOW.ry).fill({ color: 0x000000, alpha: AGV_SHADOW.alpha });
  function agvBody(step: number, loaded: boolean): GraphicsContext {
    const key = `${step}|${loaded ? 1 : 0}`;
    let body = agvBodies.get(key);
    if (body) return body;
    const ang = (step * Math.PI * 2) / CART_STEPS;
    body = new GraphicsContext();
    for (const p of agvPieces(ang, loaded))
      for (const f of rblockFaces(p.cx, p.cy, p.z, p.l, p.w, p.h, ang, p.color))
        body.poly(f.pts.flat(), true).fill({ color: num(f.fill) }).stroke({ width: 0.9, color: EDGE, join: 'round' });
    agvBodies.set(key, body);
    return body;
  }

  /** Partes del camión: lo de detrás de la carga, un sprite por hueco y lo de delante. */
  const truckBack = new Sprite(Texture.EMPTY);
  const truckFront = new Sprite(Texture.EMPTY);
  const truckLoads = Array.from({ length: TRUCK_SLOTS }, () => {
    const sp = new Sprite(Texture.EMPTY);
    sp.scale.set(1 / PROP_RES);
    sp.visible = false;
    return sp;
  });
  for (const sp of [truckBack, truckFront]) {
    sp.position.set(TRUCK_BOX.x, TRUCK_BOX.y);
    sp.scale.set(1 / TRUCK_RES);
    sp.visible = false;
  }
  truckG.addChild(truckBack, ...truckLoads, truckFront);
  let truckKey = '';
  let truckBaked = false;
  const carViews: { sprite: Sprite; key: string }[] = [];
  const hwayViews: { sprite: Sprite; key: string }[] = [];
  const birdShape = new GraphicsContext()
    .moveTo(-7, 0)
    .quadraticCurveTo(-3.5, -5, 0, 0)
    .quadraticCurveTo(3.5, -5, 7, 0)
    .stroke({ width: 1.6, color: EDGE, cap: 'round', join: 'round' });
  const birdViews: Graphics[] = [];

  /** Pone en `sp` la textura `key` (al momento si ya está horneada; si no, cuando llegue y siga queriéndose `want()`). */
  function setTex(sp: Sprite, key: string, make: () => Promise<Texture>, want: () => boolean): void {
    const done = ready.get(key);
    if (done) {
      sp.texture = done;
      sp.visible = true;
      return;
    }
    texture(key, make).then(
      (t) => {
        if (!want() || sp.destroyed) return;
        sp.texture = t;
        sp.visible = true;
      },
      () => {},
    );
  }

  function cartBody(step: number, loaded: boolean): { back: GraphicsContext; front: GraphicsContext } {
    const key = `${step}|${loaded ? 1 : 0}`;
    let body = cartBodies.get(key);
    if (body) return body;
    const ang = (step * Math.PI * 2) / CART_STEPS;
    const back = new GraphicsContext();
    const front = new GraphicsContext();
    let into = back;
    for (const piece of forkliftPieces(ang, loaded ? 1 : 0)) {
      if (piece.kind === 'load') {
        into = front;
        continue;
      }
      for (const f of rblockFaces(piece.cx, piece.cy, piece.z, piece.l, piece.w, piece.h, ang, piece.color))
        into.poly(f.pts.flat(), true).fill({ color: num(f.fill) }).stroke({ width: 0.9, color: EDGE, join: 'round' });
    }
    body = { back, front };
    cartBodies.set(key, body);
    return body;
  }

  /** Sprite con una textura que llega cuando el navegador termina de hornearla. */
  function lateSprite(tex: Promise<Texture>, box: typeof BOX, res: number): Sprite {
    const sprite = new Sprite(Texture.EMPTY);
    sprite.position.set(box.x, box.y);
    sprite.scale.set(1 / res);
    sprite.visible = false;
    tex.then(
      (t) => {
        if (sprite.destroyed) return;
        sprite.texture = t;
        sprite.visible = true;
      },
      () => {},
    );
    return sprite;
  }

  function texture(key: string, make: () => Promise<Texture>): Promise<Texture> {
    let tex = textures.get(key);
    if (!tex) {
      tex = make();
      textures.set(key, tex);
      tex.then(
        (t) => ready.set(key, t),
        () => textures.delete(key),
      );
    }
    return tex;
  }

  function makeMachine(spot: MachineSpot, tex: Promise<Texture>, geom: MachineGeom): Machine {
    const root = new Container();
    root.position.set(spot.x, spot.y);
    root.scale.set(spot.scale);
    const sprite = lateSprite(tex, BOX, RES);
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
    setPile(pos, svg) {
      pileG.removeChildren().forEach((c) => c.destroy());
      pileG.position.set(pos.x, pos.y);
      pileY = pos.y;
      const tex = texture('pile', () => bake(svg(), PILE_BOX, PILE_RES));
      const sprite = lateSprite(tex, PILE_BOX, PILE_RES);
      pileG.addChild(sprite);
      return tex.then(() => {
        pileG.visible = true;
      });
    },
    setPort(trainSvg, shipSvg) {
      const tt = texture('train', () => bake(trainSvg, TRAIN_BOX, PORT_RES));
      const st = texture('ship', () => bake(shipSvg, SHIP_BOX, PORT_RES));
      trainG.addChild(lateSprite(tt, TRAIN_BOX, PORT_RES));
      shipG.addChild(lateSprite(st, SHIP_BOX, PORT_RES));
      return Promise.all([tt, st]).then(() => {
        portReady = true;
        trainG.visible = !low;
        shipG.visible = true;
      });
    },
    setPortPos(train, ship) {
      trainG.position.set(train.x, train.y);
      shipG.position.set(ship.x, ship.y);
    },
    setPileScale(scale) {
      pileG.scale.set(scale);
    },
    jigglePile() {
      pileJig = performance.now() / 1000;
    },
    setPallet(i, spot, key, svg) {
      const l = lines[i];
      l.pallet?.destroy();
      l.pallet = null;
      if (!spot) return;
      const sprite = lateSprite(texture(`pallet-${key}`, () => bake(svg(), PALLET_BOX, PALLET_RES)), PALLET_BOX, PALLET_RES);
      sprite.position.set(spot.x + PALLET_BOX.x, spot.y + PALLET_BOX.y);
      palletsG.addChild(sprite);
      l.pallet = sprite;
    },
    setAgvs(list) {
      while (agvViews.length < list.length) {
        const root = new Container();
        const body = new Graphics();
        root.addChild(new Graphics(agvShadow), body);
        agvG.addChild(root);
        agvViews.push({ root, body, key: '' });
      }
      const order = [...list].sort((a, b) => a.y - b.y);
      agvViews.forEach((v, k) => {
        const a = order[k];
        v.root.visible = !!a;
        if (!a) return;
        v.root.position.set(a.x, a.y);
        const step = ((Math.round((a.ang * CART_STEPS) / (Math.PI * 2)) % CART_STEPS) + CART_STEPS) % CART_STEPS;
        const key = `${step}|${a.loaded ? 1 : 0}`;
        if (key === v.key) return;
        v.key = key;
        v.body.context = agvBody(step, a.loaded);
      });
    },
    setCarts(list, prop) {
      while (cartViews.length < list.length) {
        const root = new Container();
        const back = new Graphics();
        const front = new Graphics();
        root.addChild(new Graphics(shadow), back);
        const loads = [0, 1, 2].map(() => {
          const sp = new Sprite(Texture.EMPTY);
          sp.scale.set(1 / PROP_RES);
          sp.visible = false;
          root.addChild(sp);
          return sp;
        });
        root.addChild(front);
        cartsG.addChild(root);
        cartViews.push({ root, back, loads, front, key: '' });
      }
      // Las de delante se dibujan después (como el orden por profundidad del SVG).
      const order = list.map((c, k) => ({ c, k })).sort((a, b) => a.c.y - b.c.y);
      cartViews.forEach((v, k) => {
        const item = order[k];
        v.root.visible = !!item;
        if (!item) return;
        const c = item.c;
        v.root.position.set(c.x, c.y);
        const step = ((Math.round((c.ang * CART_STEPS) / (Math.PI * 2)) % CART_STEPS) + CART_STEPS) % CART_STEPS;
        const key = `${c.zone}|${step}|${c.loads}`;
        if (key === v.key) return;
        v.key = key;
        const body = cartBody(step, c.loads > 0);
        v.back.context = body.back;
        v.front.context = body.front;
        const pieces = c.loads > 0 ? forkliftPieces((step * Math.PI * 2) / CART_STEPS, c.loads) : [];
        v.loads.forEach((sp, n) => {
          const piece = pieces.find((p) => p.kind === 'load' && p.k === n);
          sp.visible = false;
          if (!piece || piece.kind !== 'load') return;
          sp.position.set(piece.at[0] + PROP_BOX.x, piece.at[1] + PROP_BOX.y);
          const done = ready.get(`prop-${c.zone}`);
          if (done) {
            sp.texture = done;
            sp.visible = true;
            return;
          }
          const want = key;
          texture(`prop-${c.zone}`, () => bake(prop(c.zone), PROP_BOX, PROP_RES)).then(
            (t) => {
              if (v.key !== want || sp.destroyed) return;
              sp.texture = t;
              sp.visible = true;
            },
            () => {},
          );
        });
      });
    },
    setShipTruck(pos, ids, parts, prop) {
      truckG.visible = !!pos;
      if (!pos) return;
      truckG.position.set(pos.x, pos.y);
      if (!truckBaked) {
        truckBaked = true;
        let made: { back: string; front: string } | null = null;
        const get = () => (made ??= parts());
        setTex(truckBack, 'truck-back', () => bake(get().back, TRUCK_BOX, TRUCK_RES), () => true);
        setTex(truckFront, 'truck-front', () => bake(get().front, TRUCK_BOX, TRUCK_RES), () => true);
      }
      const key = ids.join(',');
      if (key === truckKey) return;
      truckKey = key;
      truckLoads.forEach((sp, k) => {
        const id = ids[k];
        if (!id) {
          sp.visible = false;
          return;
        }
        const [sx, sy] = truckSlotAt(k);
        sp.position.set(sx + PROP_BOX.x, sy + PROP_BOX.y);
        // Mientras se hornea un producto nuevo se queda el que había (sin parpadeo).
        setTex(sp, `prop-${id}`, () => bake(prop(id), PROP_BOX, PROP_RES), () => truckKey === key);
      });
    },
    setCars(list, svg) {
      while (carViews.length < list.length) {
        const sprite = new Sprite(Texture.EMPTY);
        sprite.scale.set(1 / CAR_RES);
        sprite.visible = false;
        carsG.addChild(sprite);
        carViews.push({ sprite, key: '' });
      }
      carViews.forEach((v, k) => {
        const c = list[k];
        if (!c) {
          v.sprite.visible = false;
          v.key = '';
          return;
        }
        v.sprite.position.set(c.x + CAR_BOX.x, c.y + CAR_BOX.y);
        if (c.key === v.key) {
          v.sprite.visible = v.sprite.texture !== Texture.EMPTY;
          return;
        }
        v.key = c.key;
        const want = c.key;
        setTex(v.sprite, `car-${c.key}`, () => bake(svg(want), CAR_BOX, CAR_RES), () => v.key === want);
      });
    },
    setHwayCars(list, svg) {
      while (hwayViews.length < list.length) {
        const sprite = new Sprite(Texture.EMPTY);
        sprite.scale.set(1 / HWAY_RES);
        sprite.visible = false;
        hwayG.addChild(sprite);
        hwayViews.push({ sprite, key: '' });
      }
      hwayViews.forEach((v, k) => {
        const c = list[k];
        if (!c) {
          v.sprite.visible = false;
          v.key = '';
          return;
        }
        v.sprite.position.set(c.x + HWAY_BOX.x, c.y + HWAY_BOX.y);
        if (c.key === v.key) {
          v.sprite.visible = v.sprite.texture !== Texture.EMPTY;
          return;
        }
        v.key = c.key;
        const want = c.key;
        setTex(v.sprite, `hway-${c.key}`, () => bake(svg(want), HWAY_BOX, HWAY_RES), () => v.key === want);
      });
    },
    setBirds(list, alpha) {
      while (birdViews.length < list.length) {
        const g = new Graphics(birdShape);
        g.pivot.set(0, BIRD_PIVOT_Y);
        birdsG.addChild(g);
        birdViews.push(g);
      }
      birdsG.alpha = alpha;
      birdsG.visible = alpha > 0.01;
      birdViews.forEach((g, k) => {
        const b = list[k];
        g.visible = !!b;
        if (b) g.position.set(b[0], b[1] + BIRD_PIVOT_Y);
      });
    },
    setLine(i, spots, variant, body) {
      const l = lines[i];
      for (const m of l.machines) m.root.destroy({ children: true });
      l.machines = [];
      if (!spots.length) return;
      const { svg, geom } = body();
      const tex = texture(variant, () => bake(svg));
      for (const spot of spots) {
        const m = makeMachine(spot, tex, geom);
        l.root.addChild(m.root);
        l.machines.push(m);
      }
    },
    setWorker(i, spot, key, parts) {
      const l = lines[i];
      l.worker?.root.destroy({ children: true });
      l.worker = null;
      if (!spot) return;
      let made: { base: string; torso: string } | null = null;
      const get = () => (made ??= parts());
      const root = new Container();
      root.position.set(spot.x, spot.y);
      root.scale.set(spot.scale);
      const base = lateSprite(texture(`person-${key}-base`, () => bake(get().base, PERSON_BOX, PERSON_RES)), PERSON_BOX, PERSON_RES);
      const torso = lateSprite(texture(`person-${key}-torso`, () => bake(get().torso, PERSON_BOX, PERSON_RES)), PERSON_BOX, PERSON_RES);
      root.addChild(base, torso);
      people.addChild(root);
      l.worker = { root, torso };
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
      if (v !== low) app.renderer.resize(size[0], size[1], v ? Math.min(1, baseRes) : baseRes);
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
      // Salto de la pila: sube 5 px al 30 % y baja a +1 px al 60 % de 0,22 s (como la animación «jig»).
      const j = pileJig < 0 ? 1 : (now - pileJig) / 0.22;
      let dy = 0;
      if (j < 1) dy = j < 0.3 ? (-5 * j) / 0.3 : j < 0.6 ? -5 + (6 * (j - 0.3)) / 0.3 : 1 - (j - 0.6) / 0.4;
      else pileJig = -1;
      pileG.y = pileY + dy;
      // En «Calidad baja» no hay autopista ni pájaros (como en el SVG). Aleteo: alto de 1 a −0,6 en 0,45 s, ida y vuelta.
      skyG.visible = !low;
      // En «Calidad baja» tampoco hay tren (como en el SVG); el barco sí se ve.
      if (portReady) trainG.visible = !low;
      if (!low) {
        const f = (now / 0.45) % 2;
        const u = f < 1 ? f : 2 - f;
        const flap = 1 - 1.6 * (u * u * (3 - 2 * u));
        for (const g of birdViews) g.scale.set(1, flap);
      }
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
        if (l.worker) {
          l.worker.root.visible = l.inView;
          // El torso sube y baja 2 px al trabajar (como `.torso` en el SVG).
          if (l.inView) l.worker.torso.y = PERSON_BOX.y - 2 * l.level * (0.5 + 0.5 * Math.sin(l.phase * 1.3));
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
