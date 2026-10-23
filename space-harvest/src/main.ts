import { Application } from 'pixi.js';

async function start(): Promise<void> {
  const app = new Application();
  await app.init({ resizeTo: window, background: '#05070f', antialias: true });
  document.getElementById('app')!.appendChild(app.canvas);
}

void start();
