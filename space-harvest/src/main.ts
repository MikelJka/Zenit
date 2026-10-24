import { Application, Graphics } from 'pixi.js';
import './style.css';

// Esqueleto del Hito 0: comprueba que PixiJS arranca. El menú y el mapa llegan en las tareas siguientes.
async function start(): Promise<void> {
  const host = document.getElementById('app')!;
  const app = new Application();
  await app.init({ resizeTo: window, background: '#05070f', antialias: true });
  host.appendChild(app.canvas);
  const star = new Graphics().circle(0, 0, 24).fill(0xffd76a);
  star.position.set(app.screen.width / 2, app.screen.height / 2);
  app.stage.addChild(star);
}

void start();
