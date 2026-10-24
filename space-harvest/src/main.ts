import { Application, Graphics } from 'pixi.js';

async function start(): Promise<void> {
  const app = new Application();
  await app.init({ resizeTo: window, background: '#05070f', antialias: true });
  document.getElementById('app')!.appendChild(app.canvas);
  // Marcador del Hito 0: el menú de inicio y el mapa de la estación llegan en las siguientes partes.
  const dot = new Graphics().circle(0, 0, 40).fill(0x4fc3f7);
  dot.position.set(app.screen.width / 2, app.screen.height / 2);
  app.stage.addChild(dot);
}

void start();
