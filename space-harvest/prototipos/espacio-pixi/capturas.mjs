// Captura cada escena de la prueba (móvil vertical, ×2) en la carpeta indicada. Uso: CHROMIUM_PATH=… node capturas.mjs <carpeta>
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
const out = process.argv[2] ?? '.';
const PORT = 4191;
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  for (let i = 0; i < 60; i++) { try { if ((await fetch(`http://localhost:${PORT}/`)).ok) break; } catch {} await sleep(500); }
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const escena of ['estacion', 'granja', 'solar', 'mineria']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    page.on('pageerror', (e) => console.log('ERROR', escena, e.message));
    await page.goto(`http://localhost:${PORT}/?escena=${escena}`);
    await sleep(5000);
    await page.addStyleTag({ content: '#fps{display:none}' });
    await page.screenshot({ path: `${out}/space-harvest-${escena}.png` });
    await context.close();
  }
  await browser.close();
} finally { server.kill(); }
