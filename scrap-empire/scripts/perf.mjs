// Mide fotogramas y funciones más pesadas en una partida avanzada, con la CPU frenada como un móvil flojo.
// Uso (tras `npm run build` y con `scripts/makesave.ts` hecho): node scripts/perf.mjs [ralentización=4]
import { spawn, execSync } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4174;
const URL = `http://localhost:${PORT}/IdleScrapyard/?fps=1&notitle`;
const slow = Number(process.argv[2] ?? 4);
const save = execSync('npx vite-node scripts/makesave.ts 2', { maxBuffer: 1e8 }).toString();
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort', '--outDir', process.env.OUTDIR ?? 'dist'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(URL)).ok) break;
    } catch {}
    await sleep(500);
  }
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const context = await browser.newContext({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.addInitScript((s) => localStorage.setItem('chatarrero.save', s), save);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: slow });
  await page.goto(URL);
  if (process.env.EXTRA_CSS) await page.addStyleTag({ content: process.env.EXTRA_CSS });
  await sleep(6000);
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.start');
  const fps = [];
  for (let i = 0; i < 10; i++) {
    await sleep(1000);
    fps.push(await page.locator('#fps').textContent());
  }
  const { profile } = await cdp.send('Profiler.stop');
  const self = new Map();
  const dt = profile.timeDeltas;
  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  profile.samples.forEach((id, i) => {
    const n = byId.get(id);
    const k = `${n.callFrame.functionName || '(anon)'} ${n.callFrame.url.split('/').pop()}:${n.callFrame.lineNumber + 1}`;
    self.set(k, (self.get(k) ?? 0) + (dt[i] ?? 0));
  });
  const total = [...self.values()].reduce((a, b) => a + b, 0);
  console.log(`CPU ×${slow}:`, fps.join(' | '));
  console.log('media', (fps.reduce((a, f) => a + parseInt(f), 0) / fps.length).toFixed(1), 'fps');
  for (const [k, v] of [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14)) console.log(`${((100 * v) / total).toFixed(1).padStart(5)} %  ${k}`);
  await browser.close();
} finally {
  server.kill();
}
