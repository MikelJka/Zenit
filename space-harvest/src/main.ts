import { Application } from 'pixi.js';

async function start(): Promise<void> {
  const host = document.getElementById('app')!;
  const app = new Application();
  await app.init({ resizeTo: host, background: '#050912', antialias: true });
  host.appendChild(app.canvas);
}

void start();
