import { Application } from 'pixi.js';

async function start(): Promise<void> {
  const app = new Application();
  await app.init({ background: '#05070f', resizeTo: window, antialias: true });
  document.getElementById('app')?.appendChild(app.canvas);
}

void start();
