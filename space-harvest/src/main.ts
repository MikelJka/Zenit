import { Application, Graphics } from 'pixi.js';

async function start(): Promise<void> {
  const app = new Application();
  await app.init({ resizeTo: window, background: 0x05070f, antialias: true });
  document.body.appendChild(app.canvas);
  const mark = new Graphics().circle(0, 0, 40).fill(0xffd166);
  mark.position.set(app.screen.width / 2, app.screen.height / 2);
  app.stage.addChild(mark);
}

void start();
