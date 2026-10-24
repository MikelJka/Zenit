import { Application, Graphics } from 'pixi.js';

// Cimientos del Hito 0: abre PixiJS en vertical. El menú y el mapa llegan en las siguientes partes.
const app = new Application();
await app.init({ resizeTo: window, background: '#05070d', antialias: true });
document.getElementById('app')!.appendChild(app.canvas);
app.stage.addChild(new Graphics().circle(window.innerWidth / 2, window.innerHeight / 2, 40).fill(0x4fd1ff));
