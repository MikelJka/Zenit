import { Application, Graphics } from 'pixi.js';

// Esqueleto del Hito 0: ventana de PixiJS con un fondo; el menú y el mapa llegan en las siguientes partes.
const app = new Application();
await app.init({ resizeTo: window, background: '#05070d', antialias: true });
document.body.appendChild(app.canvas);

const core = new Graphics().circle(0, 0, 40).fill(0x4fc3f7);
core.position.set(app.screen.width / 2, app.screen.height / 2);
app.stage.addChild(core);
