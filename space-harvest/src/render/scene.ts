import { Application, Graphics } from 'pixi.js';

/** Hito 0 (primera parte): campo de estrellas para comprobar que PixiJS arranca. El mapa con paralaje llega después. */
export async function startScene(host: HTMLElement): Promise<Application> {
  const app = new Application();
  await app.init({ resizeTo: host, background: 0x05070d, antialias: true, resolution: Math.min(window.devicePixelRatio, 2), autoDensity: true });
  host.appendChild(app.canvas);
  const stars = new Graphics();
  // Posiciones fijas (no hace falta la simulación para un fondo decorativo).
  for (let i = 0; i < 120; i++) {
    const x = ((i * 9301 + 49297) % 233280) / 233280;
    const y = ((i * 7919 + 12345) % 233280) / 233280;
    stars.circle(x * app.screen.width, y * app.screen.height, 0.6 + (i % 3) * 0.4).fill({ color: 0xffffff, alpha: 0.4 + (i % 5) * 0.12 });
  }
  app.stage.addChild(stars);
  return app;
}
