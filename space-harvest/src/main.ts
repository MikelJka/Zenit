import { Application, Graphics } from 'pixi.js';

async function start(): Promise<void> {
  const host = document.getElementById('app')!;
  const app = new Application();
  await app.init({ resizeTo: host, background: 0x05070f, antialias: true });
  host.appendChild(app.canvas);
  const dot = new Graphics().circle(0, 0, 24).fill(0xffd166);
  app.stage.addChild(dot);
  const place = (): void => {
    dot.position.set(app.screen.width / 2, app.screen.height / 2);
  };
  place();
  app.renderer.on('resize', place);
}

void start();
