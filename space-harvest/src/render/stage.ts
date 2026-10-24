import { Application, Graphics } from 'pixi.js';

/** Escena mínima de comprobación: fondo oscuro y un planeta. El mapa con paralaje llega en otra parte del Hito 0. */
export async function startStage(host: HTMLElement): Promise<Application> {
  const app = new Application();
  await app.init({ resizeTo: host, background: '#05070f', antialias: true });
  host.appendChild(app.canvas);
  const planet = new Graphics().circle(0, 0, 60).fill(0x3a6ea5);
  const place = () => planet.position.set(app.screen.width / 2, app.screen.height / 2);
  place();
  app.renderer.on('resize', place);
  app.stage.addChild(planet);
  return app;
}
