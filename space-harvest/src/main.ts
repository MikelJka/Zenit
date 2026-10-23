import { Application } from 'pixi.js';

async function start(): Promise<void> {
  const host = document.getElementById('app');
  if (!host) return;
  const app = new Application();
  await app.init({ background: '#05070d', resizeTo: host, antialias: true });
  host.appendChild(app.canvas);
}

void start();
