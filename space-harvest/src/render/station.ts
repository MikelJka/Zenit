import { Application, Container, Graphics } from 'pixi.js';

interface Layer {
  c: Container;
  depth: number;
}

export interface StationScene {
  setReduceMotion(v: boolean): void;
  setQuality(q: 'low' | 'high'): void;
  destroy(): void;
}

/** Fondo del menú: campo de estrellas en tres capas con paralaje y una estación con luces parpadeantes. */
export async function createStationScene(host: HTMLElement): Promise<StationScene> {
  const app = new Application();
  await app.init({ resizeTo: host, background: 0x05070f, antialias: true, resolution: Math.min(devicePixelRatio, 2), autoDensity: true });
  host.appendChild(app.canvas);

  let reduce = false;
  let quality: 'low' | 'high' = 'high';
  let t = 0;
  const world = new Container();
  app.stage.addChild(world);

  const layers: Layer[] = [0.15, 0.4, 0.8].map((depth, i) => {
    const c = new Container();
    const g = new Graphics();
    let seed = 1234 + i * 77;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let n = 0; n < 70; n++) {
      g.circle(rnd() * 1200 - 300, rnd() * 1600 - 300, 0.8 + i * 0.6).fill({ color: 0xffffff, alpha: 0.4 + i * 0.25 });
    }
    c.addChild(g);
    world.addChild(c);
    return { c, depth };
  });

  const station = new Container();
  const body = new Graphics();
  body.roundRect(-70, -18, 140, 36, 10).fill(0x2c3e5c).stroke({ color: 0x8fd0ff, width: 2 });
  body.rect(-12, -70, 24, 140).fill(0x36507a);
  for (const side of [-1, 1]) {
    body.rect(side * 90 - 40, -50, 80, 100).fill(0x123a7a).stroke({ color: 0x4aa3ff, width: 1.5 });
  }
  station.addChild(body);
  const lights = new Graphics();
  station.addChild(lights);
  world.addChild(station);

  function layout() {
    station.position.set(app.screen.width / 2, app.screen.height * 0.34);
    station.scale.set(Math.min(app.screen.width / 360, 1.4));
  }
  layout();
  app.renderer.on('resize', layout);

  app.ticker.add((tk) => {
    if (!reduce) t += tk.deltaMS / 1000;
    const sway = Math.sin(t * 0.25) * 30;
    for (const l of layers) l.c.x = sway * l.depth - 20;
    station.x = app.screen.width / 2 + sway * 1.2;
    station.y = app.screen.height * 0.34 + Math.sin(t * 0.5) * 6;
    station.rotation = Math.sin(t * 0.2) * 0.03;
    lights.clear();
    const on = quality === 'high' || Math.floor(t * 2) % 2 === 0;
    const pulse = 0.5 + 0.5 * Math.sin(t * 3);
    for (const [x, y, col] of [[-70, 0, 0xff5a5a], [70, 0, 0x5aff8a], [0, -70, 0xffe066]] as const) {
      lights.circle(x, y, 4).fill({ color: col, alpha: on ? 0.5 + 0.5 * pulse : 0.3 });
      if (quality === 'high') lights.circle(x, y, 10).fill({ color: col, alpha: 0.15 * pulse });
    }
  });

  return {
    setReduceMotion: (v) => { reduce = v; },
    setQuality: (q) => { quality = q; },
    destroy: () => app.destroy(true, { children: true }),
  };
}
