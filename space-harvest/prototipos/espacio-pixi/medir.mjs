// Mide los fotogramas de la prueba con la CPU frenada (como un móvil flojo) y guarda una captura.
// Uso (tras `npm run build`): CHROMIUM_PATH=/ruta/chrome node medir.mjs [ralentización=4]
// Ojo: en el servidor no hay tarjeta gráfica (WebGL por software), así que las cifras son un suelo muy pesimista.
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const slow = Number(process.argv[2] ?? 4);
const PORT = 4190;
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`http://localhost:${PORT}/`)).ok) break;
    } catch {}
    await sleep(500);
  }
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const [name, query] of [['completo', ''], ['sin bloom', '?bloom=0'], ['sin partículas', '?particles=0'], ['sin bloom ni partículas', '?bloom=0&particles=0']]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: Number(process.env.DSF ?? 1) });
    const page = await context.newPage();
    page.on('pageerror', (e) => console.log('ERROR', e.message));
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: slow });
    await page.goto(`http://localhost:${PORT}/${query}`);
    await sleep(4000);
    const fps = [];
    for (let i = 0; i < 6; i++) {
      await sleep(1000);
      fps.push(parseInt(await page.locator('#fps').textContent()));
    }
    console.log(`${name.padEnd(26)} CPU ×${slow}: media ${(fps.reduce((a, b) => a + b, 0) / fps.length).toFixed(1)} fps (${fps.join(' ')})`);
    if (name === 'completo') await page.screenshot({ path: process.env.SHOT ?? 'captura.png' });
    await context.close();
  }
  await browser.close();
} finally {
  server.kill();
}
