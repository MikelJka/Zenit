// Genera el material de anuncio a partir del propio juego (coste cero): capturas con rótulos en es/en, gráfico de función,
// iconos, vídeo vertical y la página de prensa. Uso (tras `npm run build`):
//   CHROMIUM_PATH=/ruta/a/chrome node scripts/marketing/index.mjs
// Escribe en public/press/ (se publica con la web, en /press/).
import { spawn, execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { chromium } from 'playwright';
import { CAPTIONS, SHOTS, STORE } from './content.mjs';

const OUT = 'public/press';
const PORT = 4180;
const BASE = `http://localhost:${PORT}/Zenit/scrap-empire/`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const d of ['shots', 'icons', 'video', 'raw']) mkdirSync(`${OUT}/${d}`, { recursive: true });

const saves = JSON.parse(execSync('npx vite-node scripts/marketing/saves.ts', { maxBuffer: 1e8 }).toString());
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const iconSvg = readFileSync('public/icon.svg', 'utf8');

async function ready() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return;
    } catch {}
    await sleep(500);
  }
  throw new Error('El servidor no arrancó');
}

async function open(browser, { save, lang, query = '', title = false, size = { width: 360, height: 640 }, scale = 3, }) {
  const context = await browser.newContext({ viewport: size, deviceScaleFactor: scale, isMobile: true, hasTouch: true, });
  const page = await context.newPage();
  await page.addInitScript(([s, l]) => {
    localStorage.setItem('chatarrero.save', s);
    localStorage.setItem('chatarrero.tut', '4');
    localStorage.setItem('chatarrero.lang', l);
  }, [save, lang]);
  await page.goto(BASE + query + (title ? '' : (query.includes('?') ? '&' : '?') + 'notitle'));
  return { context, page };
}

async function selectLine(page, id) {
  await page.evaluate((i) => document.querySelector(`[data-sel="${i}"] polygon:last-child`).dispatchEvent(new MouseEvent('click', { bubbles: true })), id);
}

/** Cartel de tienda: la captura a pantalla completa con el rótulo arriba. */
async function poster(browser, rawPath, caption, outPath) {
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 } });
  const page = await ctx.newPage();
  const img = readFileSync(rawPath).toString('base64');
  await page.setContent(`<style>html,body{margin:0;width:1080px;height:1920px;overflow:hidden;font-family:'Segoe UI',Roboto,Arial,sans-serif}
    .bg{position:absolute;inset:0;background:url(data:image/png;base64,${img}) center/cover}
    .shade{position:absolute;left:0;right:0;top:150px;height:560px;background:linear-gradient(#1b1712e6,#1b171299 55%,#1b171200)}
    .cap{position:absolute;left:60px;right:60px;top:215px;text-align:center;color:#fff6e0;font-weight:900;font-size:92px;line-height:1.05;letter-spacing:-1px;text-shadow:0 6px 0 #2a1d14,0 0 30px #000a}
    .cap b{color:#ffd76a}</style><div class="bg"></div><div class="shade"></div><div class="cap">${caption}</div>`);
  await page.screenshot({ path: outPath, type: 'jpeg', quality: 82 });
  await ctx.close();
}

async function html(browser, size, body, outPath, opts = {}) {
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: opts.scale ?? 1 });
  const page = await ctx.newPage();
  await page.setContent(body);
  await page.screenshot({ path: outPath, omitBackground: !!opts.transparent, ...(outPath.endsWith('.jpg') ? { type: 'jpeg', quality: 90 } : {}) });
  await ctx.close();
}

try {
  await ready();
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

  // M1: capturas con rótulos.
  for (const lang of ['es', 'en']) {
    for (const [n, shot] of SHOTS.entries()) {
      const { context, page } = await open(browser, { save: saves[shot.save], lang, query: shot.query ?? '', title: shot.title });
      await sleep(shot.wait ?? 2500);
      if (shot.line) {
        await selectLine(page, shot.line);
        await sleep(900);
      }
      if (shot.goals) {
        await page.click('button[data-action=goals]');
        await sleep(900);
      }
      await page.addStyleTag({ content: '#stats,#tip,#toast,#extras{display:none !important}' });
      const raw = `${OUT}/raw/${lang}-${shot.id}.png`;
      await page.screenshot({ path: raw });
      await context.close();
      await poster(browser, raw, CAPTIONS[lang][shot.id], `${OUT}/shots/${lang}-${String(n + 1).padStart(2, '0')}-${shot.id}.jpg`);
    }
  }

  // M2: logo e iconos.
  const mono = iconSvg.replace(/<rect width="512" height="512"[^>]*\/>/, '').replace(/fill="[^"]*"/g, 'fill="#fff"').replace(/stroke="[^"]*"/g, 'stroke="#fff"');
  const svgPage = (svg, bg = 'transparent', pad = 0) => `<body style="margin:0;background:${bg}"><div style="width:512px;height:512px;display:grid;place-items:center"><div style="width:${512 - 2 * pad}px;height:${512 - 2 * pad}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></div>`;
  await html(browser, { width: 512, height: 512 }, svgPage(iconSvg), `${OUT}/icons/icon-512.png`, { transparent: true });
  await html(browser, { width: 512, height: 512 }, svgPage(iconSvg, '#2a1d14', 80), `${OUT}/icons/icon-maskable-512.png`);
  await html(browser, { width: 512, height: 512 }, svgPage(mono, 'transparent', 80), `${OUT}/icons/icon-mono-512.png`, { transparent: true });
  writeFileSync(`${OUT}/icons/icon.svg`, iconSvg);
  const wordmark = `<body style="margin:0;background:transparent"><div style="width:1200px;height:360px;display:flex;align-items:center;gap:36px;padding:0 40px;font-family:'Segoe UI',Roboto,Arial,sans-serif"><div style="width:260px;height:260px">${iconSvg.replace('<svg ', '<svg width="100%" height="100%" ')}</div><div><div style="font-size:150px;font-weight:900;line-height:.95;color:#fff6e0;text-shadow:0 6px 0 #2a1d14,0 0 0 #2a1d14;-webkit-text-stroke:3px #2a1d14">SCRAP<br><span style="color:#ffd76a">EMPIRE</span></div><div style="font-size:48px;font-weight:800;color:#e6c98a;margin-top:10px;letter-spacing:6px">IDLE FACTORY</div></div></div>`;
  await html(browser, { width: 1200, height: 360 }, wordmark, `${OUT}/icons/logo-wordmark.png`, { transparent: true });

  // Gráfico de función de Google Play (1024×500).
  const mid = readFileSync(`${OUT}/raw/en-factory.png`).toString('base64');
  await html(
    browser,
    { width: 1024, height: 500 },
    `<body style="margin:0;width:1024px;height:500px;overflow:hidden;background:linear-gradient(120deg,#1b1712,#3b2a1c);font-family:'Segoe UI',Roboto,Arial,sans-serif;position:relative">
      <div style="position:absolute;left:44px;top:70px;width:520px"><div style="width:130px;height:130px">${iconSvg.replace('<svg ', '<svg width="100%" height="100%" ')}</div>
      <div style="font-size:78px;font-weight:900;line-height:.95;color:#fff6e0;margin-top:14px;-webkit-text-stroke:2px #2a1d14">SCRAP <span style="color:#ffd76a">EMPIRE</span></div>
      <div style="font-size:30px;font-weight:800;color:#e6c98a;letter-spacing:5px;margin-top:6px">IDLE FACTORY</div></div>
      <div style="position:absolute;right:50px;top:-60px;width:330px;height:640px;border-radius:34px;border:6px solid #2a1d14;background:url(data:image/png;base64,${mid}) center/cover;transform:rotate(6deg);box-shadow:0 10px 40px #000a"></div>`,
    `${OUT}/shots/feature-graphic-1024x500.jpg`,
  );

  // M3: vídeo vertical con una partida guionizada.
  for (const lang of ['es', 'en']) {
    const { context, page } = await open(browser, { save: saves.mid, lang, query: '?hora=14', size: { width: 360, height: 640 }, scale: 2 });
    // Grabación: fotogramas del propio navegador (screencast) con su marca de tiempo; después ffmpeg los une.
    const cdp = await context.newCDPSession(page);
    const frames = [];
    const dir = `${OUT}/raw/frames-${lang}`;
    mkdirSync(dir, { recursive: true });
    cdp.on('Page.screencastFrame', async (f) => {
      const file = `${dir}/${String(frames.length).padStart(5, '0')}.jpg`;
      writeFileSync(file, Buffer.from(f.data, 'base64'));
      frames.push({ file, ts: f.metadata.timestamp });
      await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    });
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 85, maxWidth: 720, maxHeight: 1280, everyNthFrame: 1 });
    const caption = async (text) =>
      page.evaluate((t) => {
        let el = document.getElementById('ad-cap');
        if (!el) {
          el = document.createElement('div');
          el.id = 'ad-cap';
          el.style.cssText = "position:fixed;left:0;right:0;top:150px;z-index:99;text-align:center;font:900 30px 'Segoe UI',Roboto,Arial,sans-serif;color:#fff6e0;text-shadow:0 3px 0 #2a1d14,0 0 14px #000;padding:0 18px;pointer-events:none;transition:opacity .35s";
          document.body.appendChild(el);
        }
        el.style.opacity = t ? '1' : '0';
        if (t) el.textContent = t;
      }, text);
    const v = CAPTIONS[lang].video;
    await page.addStyleTag({ content: '#tip,#stats,#toast,#extras{display:none !important}' });
    await sleep(1500);
    await caption(v[0]);
    await sleep(3500);
    for (let i = 0; i < 12; i++) {
      await page.click('#pile').catch(() => {});
      await sleep(180);
    }
    await caption(v[1]);
    await selectLine(page, 'smelter');
    await sleep(3200);
    const buy = page.locator('#shop button:not([disabled])').first();
    if (await buy.count()) await buy.click();
    await sleep(1500);
    await caption(v[2]);
    await page.evaluate(() => document.getElementById('close-shop')?.click());
    await sleep(3200);
    await caption(v[3]);
    await page.evaluate(() => history.replaceState(null, '', '?hora=21.5'));
    await sleep(6500);
    await caption(`${STORE[lang].name}`);
    await sleep(2800);
    await cdp.send('Page.stopScreencast');
    await context.close();
    const list = frames.map((f, i) => `file '${process.cwd()}/${f.file}'\nduration ${Math.max(0.01, (frames[i + 1]?.ts ?? f.ts + 0.05) - f.ts).toFixed(3)}`).join('\n');
    writeFileSync(`${dir}/list.txt`, list);
    execSync(`ffmpeg -y -loglevel error -f concat -safe 0 -i ${dir}/list.txt -vf "fps=30,scale=720:1280:flags=lanczos,format=yuv420p" -c:v libx264 -crf 28 -preset slow -an -movflags +faststart ${OUT}/video/trailer-${lang}.mp4`);
  }
  await browser.close();

  // M4: página de prensa.
  const shotsList = readdirSync(`${OUT}/shots`).filter((f) => f.endsWith('.jpg') && /^(es|en)-/.test(f)).sort();
  const gallery = (lang) => shotsList.filter((f) => f.startsWith(lang + '-')).map((f) => `<a href="shots/${f}"><img loading="lazy" src="shots/${f}" alt=""></a>`).join('');
  const sec = (lang) => `<section lang="${lang}"><h2>${STORE[lang].heading}</h2><p class="short">${STORE[lang].short}</p>${STORE[lang].long.map((p) => `<p>${p}</p>`).join('')}
    <video controls playsinline preload="none" src="video/trailer-${lang}.mp4"></video><div class="gal">${gallery(lang)}</div></section>`;
  writeFileSync(
    `${OUT}/index.html`,
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Scrap Empire: Idle Factory — Press kit</title>
<style>:root{color-scheme:dark}body{margin:0;background:#1b1712;color:#f3e3c3;font:16px/1.5 'Segoe UI',Roboto,Arial,sans-serif}main{max-width:980px;margin:0 auto;padding:24px 16px 60px}
h1{font-size:40px;color:#ffd76a;margin:.3em 0 0}h2{color:#ffd76a;margin-top:2em}.short{font-size:20px;font-weight:700;color:#fff6e0}img{max-width:100%}
.gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:16px}.gal img{border-radius:12px;display:block;width:100%}
video{width:100%;max-width:360px;display:block;border-radius:14px;margin:16px 0;background:#000}.icons{display:flex;gap:16px;flex-wrap:wrap;align-items:center}.icons img{height:96px;border-radius:16px;background:#3b2a1c}a{color:#ffd76a}
.hero{display:flex;gap:20px;align-items:center;flex-wrap:wrap}</style></head><body><main>
<div class="hero"><img src="icons/icon-512.png" width="120" height="120" alt=""><div><h1>Scrap Empire: Idle Factory</h1><div>Zenit Studio · Android · <a href="../">Play in your browser / Juega en el navegador</a></div></div></div>
${sec('en')}${sec('es')}
<h2>Logo &amp; icons / Logo e iconos</h2><div class="icons"><a href="icons/icon-512.png"><img src="icons/icon-512.png" alt="icon"></a><a href="icons/icon-maskable-512.png"><img src="icons/icon-maskable-512.png" alt="maskable"></a><a href="icons/icon-mono-512.png"><img src="icons/icon-mono-512.png" alt="mono"></a><a href="icons/logo-wordmark.png"><img src="icons/logo-wordmark.png" alt="wordmark" style="background:#3b2a1c"></a><a href="icons/icon.svg">icon.svg</a></div>
<h2>Google Play</h2><p><a href="shots/feature-graphic-1024x500.jpg">Feature graphic 1024×500</a></p><img src="shots/feature-graphic-1024x500.jpg" alt="">
</main></body></html>`,
  );
  rmSync(`${OUT}/raw`, { recursive: true, force: true });
  console.log('Material generado en', OUT);
} finally {
  server.kill();
}
