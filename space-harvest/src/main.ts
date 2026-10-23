import { Application, Graphics } from 'pixi.js';

async function main(): Promise<void> {
  const app = new Application();
  await app.init({ resizeTo: window, background: '#05070d', antialias: true });
  document.getElementById('app')!.appendChild(app.canvas);
  const dot = new Graphics().circle(0, 0, 24).fill(0x66ccff);
  dot.position.set(app.screen.width / 2, app.screen.height / 2);
  app.stage.addChild(dot);
}

void main();
