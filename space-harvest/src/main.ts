import { Application, Graphics } from 'pixi.js';

async function start(): Promise<void> {
  const host = document.getElementById('app')!;
  const app = new Application();
  await app.init({ resizeTo: host, background: 0x05070f, antialias: true, resolution: window.devicePixelRatio || 1 });
  host.appendChild(app.canvas);

  const star = new Graphics().circle(0, 0, 40).fill(0xffd27a);
  app.stage.addChild(star);
  const place = (): void => {
    star.position.set(app.screen.width / 2, app.screen.height / 2);
  };
  place();
  app.renderer.on('resize', place);
}

void start();
