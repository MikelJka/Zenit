import { Application, Graphics } from 'pixi.js';

async function main() {
  const app = new Application();
  await app.init({ resizeTo: window, background: 0x05070f, antialias: true });
  document.body.appendChild(app.canvas);
  const core = new Graphics().circle(0, 0, 40).fill(0x4fd1c5);
  core.position.set(app.screen.width / 2, app.screen.height / 2);
  app.stage.addChild(core);
}

void main();
