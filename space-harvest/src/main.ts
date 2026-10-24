import { Application, Graphics } from 'pixi.js';

async function start(): Promise<void> {
  const app = new Application();
  await app.init({ resizeTo: window, background: 0x05070f, antialias: true });
  document.getElementById('app')!.appendChild(app.canvas);
  const g = new Graphics().circle(0, 0, 40).fill(0x6fd3ff);
  g.position.set(app.screen.width / 2, app.screen.height / 2);
  app.stage.addChild(g);
}

void start();
