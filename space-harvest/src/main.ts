import { Application, Graphics } from 'pixi.js';

async function start(): Promise<void> {
  const host = document.getElementById('app');
  if (!host) return;
  const app = new Application();
  await app.init({ resizeTo: host, background: 0x050914, antialias: true, resolution: Math.min(window.devicePixelRatio, 2), autoDensity: true });
  host.appendChild(app.canvas);
  // Pantalla provisional del Hito 0: un planeta que confirma que PixiJS dibuja.
  const planet = new Graphics().circle(0, 0, 60).fill(0x3d7bd9);
  app.stage.addChild(planet);
  const place = (): void => { planet.position.set(app.screen.width / 2, app.screen.height / 2); };
  place();
  app.renderer.on('resize', place);
}

void start();
