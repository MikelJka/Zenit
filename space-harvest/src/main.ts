import { Application, Graphics } from 'pixi.js';

async function start(): Promise<void> {
  const app = new Application();
  await app.init({ resizeTo: window, background: 0x05070f, antialias: true });
  document.body.appendChild(app.canvas);
  const core = new Graphics().circle(0, 0, 40).fill(0x7fd1ff);
  app.stage.addChild(core);
  const place = (): void => {
    core.position.set(app.screen.width / 2, app.screen.height / 2);
  };
  place();
  app.renderer.on('resize', place);
}

void start();
