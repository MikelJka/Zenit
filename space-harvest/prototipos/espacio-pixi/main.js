// Prueba de concepto de gráficos de «Space Harvest» (Opción B del diseño): PixiJS (WebGL), todo dibujado por código.
// Escenas con ?escena=estacion | granja | solar | mineria. Parámetros: ?bloom=0, ?particles=0, ?stars=0.
import { Application, Container, Graphics, Sprite, Texture, TilingSprite, BlurFilter, FillGradient } from 'pixi.js';

const q = new URLSearchParams(location.search);
const BLOOM = q.get('bloom') !== '0';
const PARTICLES = q.get('particles') !== '0';
const STARS = q.get('stars') !== '0';
const SCENE = q.get('escena') ?? 'estacion';

const app = new Application();
await app.init({ resizeTo: window, background: '#05060f', antialias: true, resolution: Math.min(devicePixelRatio, 2), autoDensity: true });
document.body.appendChild(app.canvas);
const W = () => app.screen.width;
const H = () => app.screen.height;
const rnd = (a, b) => a + Math.random() * (b - a);

function glowTexture(size, stops) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return Texture.from(c);
}
const dot = glowTexture(64, [[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,0.8)'], [1, 'rgba(255,255,255,0)']]);
const lin = (c1, c2) => new FillGradient({ type: 'linear', start: { x: 0, y: 0 }, end: { x: 0, y: 1 }, colorStops: [{ offset: 0, color: c1 }, { offset: 1, color: c2 }] });
const glow = (col, size, alpha = 1) => {
  const s = new Sprite(dot);
  s.anchor.set(0.5);
  s.tint = col;
  s.width = s.height = size;
  s.alpha = alpha;
  s.blendMode = 'add';
  return s;
};

// --- Fondo común: degradado, estrellas con paralaje y nebulosas ---
const bgTop = { estacion: '#05060f', granja: '#06120d', solar: '#0a0612', mineria: '#0e0806' }[SCENE];
const bgBot = { estacion: '#10173a', granja: '#12301f', solar: '#2a1240', mineria: '#3a1a0c' }[SCENE];
const bg = new Graphics().rect(0, 0, 3000, 3000).fill(lin(bgTop, bgBot));
app.stage.addChild(bg);
function starLayer(count, size, alpha) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  for (let i = 0; i < count; i++) {
    g.fillStyle = `rgba(${200 + Math.random() * 55},${210 + Math.random() * 45},255,${alpha * (0.4 + Math.random() * 0.6)})`;
    g.beginPath();
    g.arc(Math.random() * 512, Math.random() * 512, size * (0.5 + Math.random()), 0, 7);
    g.fill();
  }
  return new TilingSprite({ texture: Texture.from(c), width: 4000, height: 4000 });
}
const layers = STARS ? [starLayer(90, 0.8, 0.6), starLayer(60, 1.3, 0.8), starLayer(30, 2, 1)] : [];
layers.forEach((l) => app.stage.addChild(l));
const nebCols = { estacion: ['rgba(120,60,200,0.55)', 'rgba(40,140,220,0.5)'], granja: ['rgba(60,200,120,0.5)', 'rgba(160,60,220,0.45)'], solar: ['rgba(255,140,60,0.5)', 'rgba(200,60,160,0.5)'], mineria: ['rgba(255,110,50,0.45)', 'rgba(120,60,40,0.5)'] }[SCENE];
const nebulae = nebCols.map((col, i) => {
  const s = new Sprite(glowTexture(256, [[0, col], [1, 'rgba(0,0,0,0)']]));
  s.anchor.set(0.5);
  s.width = s.height = i ? 640 : 520;
  s.blendMode = 'add';
  s.alpha = 0.55;
  s.fx = i ? 0.85 : 0.2;
  s.fy = i ? 0.55 : 0.25;
  app.stage.addChild(s);
  return s;
});

const world = new Container();
app.stage.addChild(world);
const emissive = new Container(); // lo que brilla: se copia desenfocado para el bloom
const ticks = []; // funciones que se ejecutan en cada fotograma: (t, dt)
const mod = (x, y, w, h, c1, c2, r = 14) => {
  const g = new Graphics();
  g.roundRect(x, y, w, h, r).fill(lin(c1, c2)).stroke({ color: '#0a0d1c', width: 3 });
  g.roundRect(x + 6, y + 5, w - 12, 8, 4).fill({ color: '#fff', alpha: 0.22 });
  return g;
};
const lights = [];
const light = (x, y, col, size = 18) => {
  const s = glow(col, size);
  s.x = x;
  s.y = y;
  s.phase = Math.random() * 6;
  emissive.addChild(s);
  lights.push(s);
  return s;
};

// --- Escenas ---
if (SCENE === 'estacion') {
  const planet = new Container();
  const body = new Graphics().circle(0, 0, 260).fill(new FillGradient({ type: 'radial', center: { x: 0.35, y: 0.3 }, innerRadius: 0, outerCenter: { x: 0.5, y: 0.5 }, outerRadius: 0.75, colorStops: [{ offset: 0, color: '#5fb3ff' }, { offset: 0.5, color: '#2a5fa8' }, { offset: 1, color: '#0b1a3a' }], textureSpace: 'local' }));
  const atmo = new Sprite(glowTexture(256, [[0.68, 'rgba(120,200,255,0)'], [0.86, 'rgba(120,200,255,0.55)'], [1, 'rgba(120,200,255,0)']]));
  atmo.anchor.set(0.5);
  atmo.width = atmo.height = 640;
  atmo.blendMode = 'add';
  const clouds = new Graphics();
  for (let i = 0; i < 14; i++) clouds.ellipse(rnd(-190, 190), rnd(-190, 190), rnd(40, 130), rnd(8, 22)).fill({ color: '#fff', alpha: 0.16 });
  const cm = new Graphics().circle(0, 0, 258).fill('#fff');
  clouds.mask = cm;
  planet.addChild(body, clouds, cm, atmo);
  app.stage.addChildAt(planet, app.stage.getChildIndex(world));
  ticks.push((t) => {
    planet.position.set(W() * 0.8, H() * 0.9);
    clouds.rotation = t * 0.01;
  });
  const truss = new Graphics().rect(-260, -10, 520, 20).fill(lin('#aab4c8', '#4b556e')).stroke({ color: '#0a0d1c', width: 3 });
  for (let i = -250; i < 260; i += 26) truss.moveTo(i, -10).lineTo(i + 13, 10).stroke({ color: '#0a0d1c', width: 2, alpha: 0.6 });
  world.addChild(truss);
  for (const [x, y, w, h, a, b, col, n] of [[-70, -120, 140, 90, '#7fb6ff', '#2b4f9c', 0x9fe8ff, 4], [-250, -75, 150, 60, '#9be39a', '#2d7a3c', 0xe18bff, 5], [100, -75, 150, 60, '#ffb36b', '#9c4a1c', 0xffd27a, 3], [-60, 30, 120, 70, '#c3c9d8', '#5b6482', 0xffffff, 3]]) {
    world.addChild(mod(x, y, w, h, a, b));
    for (let i = 0; i < n; i++) light(x + 20 + (i * (w - 40)) / (n - 1), y + h / 2, col);
  }
  for (const px of [-230, 230]) {
    const p = new Graphics().rect(px - 38, -190, 76, 150).fill(lin('#1d3a8a', '#0c1a4a')).stroke({ color: '#0a0d1c', width: 3 });
    for (let i = 1; i < 4; i++) p.moveTo(px - 38, -190 + i * 37.5).lineTo(px + 38, -190 + i * 37.5).stroke({ color: '#6aa8ff', width: 1.5, alpha: 0.5 });
    p.poly([px - 38, -190, px - 10, -190, px - 38, -120]).fill({ color: '#fff', alpha: 0.18 });
    world.addChild(p);
  }
} else if (SCENE === 'granja') {
  // Invernadero hidropónico: cúpula de cristal con bandejas, plantas que crecen y luz de cultivo violeta.
  const dome = new Graphics();
  dome.roundRect(-250, -150, 500, 300, 40).fill({ color: '#0d2a22', alpha: 0.9 }).stroke({ color: '#5fe0b0', width: 4, alpha: 0.9 });
  dome.roundRect(-250, -150, 500, 300, 40).fill({ color: '#9ff0d0', alpha: 0.06 });
  world.addChild(dome);
  const beams = new Container();
  beams.blendMode = 'add';
  world.addChild(beams);
  const plants = [];
  for (let row = 0; row < 3; row++) {
    const y = -70 + row * 85;
    world.addChild(mod(-215, y + 30, 430, 16, '#9aa6c0', '#4a5470', 6));
    const lamp = mod(-200, y - 62, 400, 10, '#d9c2ff', '#7a4fc0', 5);
    world.addChild(lamp);
    const b = new Graphics().poly([-190, y - 52, 190, y - 52, 230, y + 30, -230, y + 30]).fill({ color: '#c070ff', alpha: 0.22 });
    beams.addChild(b);
    for (let i = 0; i < 9; i++) {
      const g = new Graphics();
      g.x = -190 + i * 47.5;
      g.y = y + 30;
      g.ph = rnd(0, 6);
      g.row = row;
      world.addChild(g);
      plants.push(g);
    }
    for (let i = 0; i < 6; i++) light(-180 + i * 72, y - 56, 0xd890ff, 26);
  }
  ticks.push((t) => {
    for (const g of plants) {
      const k = 0.55 + 0.45 * Math.sin(t * 0.4 + g.ph); // crecimiento que sube y baja para el vídeo
      g.clear();
      const h = 18 + k * 42;
      g.moveTo(0, 0).quadraticCurveTo(Math.sin(t + g.ph) * 3, -h / 2, 0, -h).stroke({ color: '#3f9a3a', width: 4 });
      for (let j = 0; j < 4; j++) {
        const ly = -h * (0.3 + j * 0.2);
        const s = j % 2 ? 1 : -1;
        g.ellipse(s * 9, ly, 11 * k + 3, 5 * k + 2).fill({ color: j > 1 ? '#8fe070' : '#58b84a', alpha: 0.95 });
      }
      if (k > 0.85) g.circle(0, -h, 5).fill('#ff6b4a');
    }
  });
} else if (SCENE === 'solar') {
  // Campo de paneles solares frente a una estrella, con destello y rayos de energía hacia la estación.
  const sun = new Container();
  sun.addChild(glow(0xffb347, 900, 0.8), glow(0xffe29a, 420, 1), glow(0xffffff, 170, 1));
  app.stage.addChildAt(sun, app.stage.getChildIndex(world));
  ticks.push((t) => {
    sun.position.set(W() * 0.78, H() * 0.2);
    sun.scale.set(1 + Math.sin(t * 0.8) * 0.03);
  });
  const rays = [];
  const rc = new Container();
  rc.blendMode = 'add';
  world.addChild(rc);
  const arms = new Graphics().rect(-8, -10, 16, 260).fill(lin('#aab4c8', '#4b556e')).stroke({ color: '#0a0d1c', width: 3 });
  world.addChild(arms);
  const sheen = [];
  for (let side = -1; side <= 1; side += 2) {
    for (let k = 0; k < 3; k++) {
      const x = side * (60 + k * 120) - 52;
      const y = 20 + k * 40;
      const p = new Graphics().rect(x, y, 104, 170).fill(lin('#2450c4', '#0c1a4a')).stroke({ color: '#0a0d1c', width: 3 });
      for (let i = 1; i < 5; i++) p.moveTo(x, y + i * 34).lineTo(x + 104, y + i * 34).stroke({ color: '#8fc0ff', width: 1.5, alpha: 0.5 });
      for (let i = 1; i < 3; i++) p.moveTo(x + i * 34.7, y).lineTo(x + i * 34.7, y + 170).stroke({ color: '#8fc0ff', width: 1.5, alpha: 0.4 });
      world.addChild(p);
      const sh = new Graphics().poly([x, y, x + 36, y, x, y + 70]).fill({ color: '#fff', alpha: 0.3 });
      sh.blendMode = 'add';
      sh.baseX = x;
      world.addChild(sh);
      sheen.push(sh);
    }
  }
  world.addChild(mod(-70, -60, 140, 90, '#c3c9d8', '#5b6482'));
  for (let i = 0; i < 4; i++) light(-50 + i * 33, -15, 0xfff0b0);
  if (PARTICLES) for (let i = 0; i < 70; i++) {
    const s = glow(0xffe680, 16);
    s.life = Math.random();
    s.sx = rnd(-300, 300);
    rc.addChild(s);
    rays.push(s);
  }
  ticks.push((t, dt) => {
    sheen.forEach((s, i) => (s.alpha = 0.15 + 0.4 * Math.max(0, Math.sin(t * 1.1 + i))));
    for (const s of rays) {
      s.life += dt * 0.5;
      if (s.life > 1) {
        s.life = 0;
        s.sx = rnd(-300, 300);
      }
      s.x = s.sx * (1 - s.life);
      s.y = 100 - s.life * 140;
      s.alpha = Math.sin(s.life * 3.14) * 0.9;
    }
  });
} else if (SCENE === 'mineria') {
  // Minería de planetas: superficie rocosa, torre de perforación con láser, drones y escombros.
  const surf = new Graphics();
  surf.moveTo(-600, 330).quadraticCurveTo(0, 150, 600, 330).lineTo(600, 800).lineTo(-600, 800).closePath().fill(lin('#c0643a', '#4a1f10'));
  surf.moveTo(-600, 330).quadraticCurveTo(0, 150, 600, 330).stroke({ color: '#ffb080', width: 4, alpha: 0.8 });
  for (let i = 0; i < 26; i++) surf.ellipse(rnd(-420, 420), rnd(230, 520), rnd(10, 38), rnd(3, 9)).fill({ color: '#000', alpha: 0.22 });
  world.addChild(surf);
  const rig = new Container();
  rig.addChild(mod(-40, 70, 80, 70, '#c9ced9', '#5b6482'));
  const mast = new Graphics().rect(-8, -120, 16, 190).fill(lin('#d9a441', '#8a5a12')).stroke({ color: '#0a0d1c', width: 3 });
  for (let i = 0; i < 6; i++) mast.moveTo(-8, -120 + i * 32).lineTo(8, -88 + i * 32).stroke({ color: '#0a0d1c', width: 2, alpha: 0.6 });
  rig.addChild(mast);
  rig.addChild(mod(-30, -150, 60, 36, '#ffd27a', '#b0701c', 10));
  rig.position.set(0, 120);
  world.addChild(rig);
  const laser = new Graphics();
  laser.blendMode = 'add';
  world.addChild(laser);
  const spot = glow(0xff9a40, 120, 1);
  world.addChild(spot);
  const drones = [-150, 130].map((x, i) => {
    const d = new Container();
    d.addChild(mod(-18, -8, 36, 16, '#e6ebf5', '#7b86a3', 6));
    d.addChild(glow(0x7ee0ff, 22));
    d.x0 = x;
    d.ph = i * 2;
    world.addChild(d);
    return d;
  });
  const deb = [];
  const dc = new Container();
  dc.blendMode = 'add';
  world.addChild(dc);
  if (PARTICLES) for (let i = 0; i < 90; i++) {
    const s = glow(0xffa860, 8);
    s.life = Math.random();
    dc.addChild(s);
    deb.push(s);
  }
  for (let i = 0; i < 5; i++) {
    const c = mod(70 + i * 38, 350 + (i % 2) * 20, 34, 24, '#6fe08a', '#2a7a3c', 4);
    world.addChild(c);
    light(87 + i * 38, 362 + (i % 2) * 20, 0x8fffa0, 14);
  }
  light(0, 105, 0xffd27a, 26);
  ticks.push((t, dt) => {
    laser.clear();
    const flick = 0.7 + 0.3 * Math.sin(t * 30);
    laser.poly([-6, -112, 6, -112, 14, 330, -14, 330]).fill({ color: '#ff7a30', alpha: 0.5 * flick });
    laser.poly([-2, -112, 2, -112, 4, 330, -4, 330]).fill({ color: '#fff0c0', alpha: 0.9 * flick });
    spot.position.set(0, 330);
    spot.alpha = flick;
    drones.forEach((d) => {
      d.x = d.x0 + Math.sin(t * 0.7 + d.ph) * 30;
      d.y = 20 + Math.sin(t * 1.3 + d.ph) * 14;
    });
    for (const s of deb) {
      s.life += dt * 0.8;
      if (s.life > 1) {
        s.life = 0;
        s.vx = rnd(-90, 90);
        s.vy = rnd(-160, -60);
        s.x = rnd(-10, 10);
        s.y = 330;
      }
      s.vy = (s.vy ?? -80) + 220 * dt;
      s.x += (s.vx ?? 0) * dt;
      s.y += s.vy * dt;
      s.alpha = 1 - s.life;
    }
  });
}
world.addChild(emissive);
emissive.blendMode = 'add';

// Bloom barato: copia desenfocada de lo que brilla, en modo aditivo.
let bloom = null;
if (BLOOM) {
  bloom = new Container();
  bloom.blendMode = 'add';
  bloom.filters = [new BlurFilter({ strength: 10, quality: 2 })];
  world.addChild(bloom);
}

// Nave de carga con estela (solo en la estación).
const ship = new Container();
const parts = [];
if (SCENE === 'estacion') {
  const hull = new Graphics().roundRect(-40, -12, 80, 24, 10).fill(lin('#e6ebf5', '#7b86a3')).stroke({ color: '#0a0d1c', width: 3 });
  hull.poly([40, -12, 62, 0, 40, 12]).fill('#c0392b').stroke({ color: '#0a0d1c', width: 3 });
  ship.addChild(hull);
  world.addChild(ship);
  const pc = new Container();
  pc.blendMode = 'add';
  world.addChild(pc);
  if (PARTICLES) for (let i = 0; i < 160; i++) {
    const s = new Sprite(dot);
    s.anchor.set(0.5);
    s.life = Math.random();
    pc.addChild(s);
    parts.push(s);
  }
}

// Cámara: se arrastra con el dedo o el ratón.
const cam = { x: 0, y: 0 };
let drag = null;
app.stage.eventMode = 'static';
app.stage.hitArea = app.screen;
app.stage.on('pointerdown', (e) => (drag = { x: e.global.x, y: e.global.y, cx: cam.x, cy: cam.y }));
app.stage.on('pointermove', (e) => drag && ((cam.x = drag.cx + (e.global.x - drag.x)), (cam.y = drag.cy + (e.global.y - drag.y))));
app.stage.on('pointerup', () => (drag = null));
app.stage.on('pointerupoutside', () => (drag = null));

const fpsEl = document.getElementById('fps');
let frames = 0;
let acc = 0;
const zoom = { estacion: 1, granja: 1.05, solar: 1.15, mineria: 1.1 }[SCENE];
const yOff = { estacion: 0, granja: 0, solar: -40, mineria: -90 }[SCENE];
app.ticker.add((tk) => {
  const dt = tk.deltaMS / 1000;
  const t = performance.now() / 1000;
  acc += dt;
  frames++;
  if (acc >= 1) {
    fpsEl.textContent = `${SCENE} · ${frames} fps · peor ${Math.round(tk.deltaMS)} ms${BLOOM ? '' : ' · sin bloom'}${PARTICLES ? '' : ' · sin partículas'}`;
    frames = 0;
    acc = 0;
  }
  layers.forEach((l, i) => l.position.set(-1000 + cam.x * (0.1 + i * 0.12) + t * (3 + i * 4), -1000 + cam.y * (0.1 + i * 0.12)));
  nebulae.forEach((n, i) => n.position.set(W() * n.fx + cam.x * 0.06 + Math.sin(t * 0.05 + i) * 20, H() * n.fy + cam.y * 0.06));
  world.scale.set(Math.min(1.25, W() / 560) * zoom);
  world.position.set(W() / 2 + cam.x, H() * 0.5 + yOff + cam.y + Math.sin(t * 0.6) * 4);
  for (const l of lights) l.alpha = 0.65 + 0.35 * Math.sin(t * 2 + l.phase);
  ticks.forEach((f) => f(t, dt));
  if (bloom) {
    if (bloom.children.length !== emissive.children.length) {
      bloom.removeChildren();
      for (const e of emissive.children) {
        const c = glow(e.tint, e.width * 3, 1);
        c.x = e.x;
        c.y = e.y;
        bloom.addChild(c);
      }
    }
    bloom.children.forEach((c, i) => (c.alpha = emissive.children[i].alpha * 0.9));
  }
  if (SCENE === 'estacion') {
    const sx = -520 + ((t * 40) % 1100);
    ship.position.set(sx, 160);
    parts.forEach((p) => {
      p.life += dt * 0.9;
      if (p.life > 1) {
        p.life = 0;
        p.x = sx - 42;
        p.y = 160 + rnd(-4, 4);
        p.vx = -rnd(40, 100);
        p.vy = rnd(-10, 10);
      }
      p.x += (p.vx ?? 0) * dt;
      p.y += (p.vy ?? 0) * dt;
      const k = 1 - p.life;
      p.alpha = k * 0.8;
      p.width = p.height = 8 + k * 26;
      p.tint = k > 0.5 ? 0xffe6a0 : 0x6fb8ff;
    });
  }
});
