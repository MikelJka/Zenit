// Prueba de humo en Chromium sin pantalla: abre la versión web en PC y en móvil,
// comprueba que no hay errores y guarda capturas en smoke/ (el módulo de STONKS las enseña).
// Uso (tras `npm run build`): node scripts/smoke.mjs
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = 4173;
const URL = `http://localhost:${PORT}/Zenit/scrap-empire/`;
mkdirSync('smoke', { recursive: true });

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'inherit' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(URL)).ok) return;
    } catch {
      // aún no
    }
    await sleep(500);
  }
  throw new Error('El servidor de vista previa no arrancó');
}

const problems = [];
try {
  await waitForServer();
  const browser = await chromium.launch();
  const devices = [
    { name: 'pc', viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false },
    { name: 'movil', viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true },
  ];
  for (const d of devices) {
    const context = await browser.newContext({ viewport: d.viewport, isMobile: d.isMobile, hasTouch: d.hasTouch });
    const page = await context.newPage();
    page.on('pageerror', (e) => problems.push(`${d.name} pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error') problems.push(`${d.name} console: ${m.text()}`);
    });
    await page.goto(URL);
    await sleep(1500);
    // El menú de inicio se ve y se cierra con «Jugar».
    if (!(await page.locator('#title #play').count())) problems.push(`${d.name}: no sale el menú de inicio`);
    await page.screenshot({ path: `smoke/${d.name}-menu.png` });
    await page.click('#title #play');
    await sleep(600);
    if (await page.locator('#title').count()) problems.push(`${d.name}: el menú de inicio no se cierra`);
    await page.screenshot({ path: `smoke/${d.name}-inicio.png` });
    for (let i = 0; i < 30; i++) await page.click('#pile');
    await sleep(3000);
    await page.screenshot({ path: `smoke/${d.name}-jugando.png` });
    // Tocar un puesto abre sus mejoras.
    await page.evaluate(() => document.querySelector('[data-sel="crusher"] polygon:last-child').dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await sleep(600);
    await page.screenshot({ path: `smoke/${d.name}-puesto.png` });
    // El panel de la línea se abre y enseña sus datos.
    if (await page.locator('#sheet[hidden]').count()) problems.push(`${d.name}: el panel de la línea no se abre`);
    else if (!(await page.locator('#panel-info').innerText()).trim()) problems.push(`${d.name}: el panel de la línea está vacío`);
    await page.click('#close-shop');
    // Con el ranking apagado (sin Firebase) el botón abre un aviso, no un error.
    await page.click('#ranking-btn');
    await sleep(400);
    if (!(await page.locator('#ranking').innerText()).trim()) problems.push(`${d.name}: el ranking no muestra nada`);
    await page.screenshot({ path: `smoke/${d.name}-ranking.png` });
    await context.close();
  }
  // De noche (?hora=22) la capa nocturna se oscurece y no hay errores.
  const nightCtx = await browser.newContext({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true });
  const night = await nightCtx.newPage();
  night.on('pageerror', (e) => problems.push(`noche pageerror: ${e.message}`));
  night.on('console', (m) => {
    if (m.type() === 'error') problems.push(`noche console: ${m.text()}`);
  });
  await night.goto(`${URL}?hora=22&notitle`);
  await sleep(2500);
  const nightOpacity = await night.evaluate(() => Number(document.querySelector('#nightR')?.getAttribute('opacity') ?? 0));
  if (!(nightOpacity > 0.3)) problems.push(`noche: la capa nocturna no se aplica (opacidad ${nightOpacity})`);
  await night.screenshot({ path: 'smoke/movil-noche.png' });
  await nightCtx.close();
  await browser.close();
} finally {
  server.kill();
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('Prueba de humo correcta.');
