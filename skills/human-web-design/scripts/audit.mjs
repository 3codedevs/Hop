#!/usr/bin/env node
/**
 * Render pages in headless Chromium, screenshot them screen by screen, and
 * record their design system. Use it to study reference sites and to check
 * your own build.
 *
 *   npm i -D playwright && npx playwright install chromium
 *   node audit.mjs <out-dir> <url> [url ...] [--max-screens=14] [--no-mobile] [--reduced-motion]
 *
 * For each URL, writes <out-dir>/<host>/:
 *   d-00.png, d-01.png ...  desktop (1440x900), one per screen while scrolling
 *   m-00.png                mobile hero (390x844 @2x)
 *   probe.json              fonts, colours, CSS variables, keyframes, libraries,
 *                           heading outline, images without alt, console errors,
 *                           horizontal overflow on mobile
 *
 * Playwright is resolved from the current working directory, so run it from a
 * project that has playwright installed.
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(path.join(process.cwd(), 'noop.js'));
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright not found here. Run: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
const [outDir, ...urls] = args.filter((a) => !a.startsWith('--'));
if (!outDir || urls.length === 0) {
  console.error('Usage: node audit.mjs <out-dir> <url> [url ...] [--max-screens=14] [--no-mobile] [--reduced-motion]');
  process.exit(1);
}
const MAX_SCREENS = Number(flags['max-screens'] ?? 14);
const reducedMotion = flags['reduced-motion'] ? 'reduce' : 'no-preference';

// Runs inside the page
function probe() {
  const style = (el) => (el ? getComputedStyle(el) : null);
  const pick = (sel) => {
    const el = document.querySelector(sel);
    const s = style(el);
    return s ? { text: (el.innerText || '').replace(/\s+/g, ' ').slice(0, 100), font: s.fontFamily, size: s.fontSize, weight: s.fontWeight, tracking: s.letterSpacing, leading: s.lineHeight, color: s.color, transform: s.textTransform } : null;
  };
  const keyframes = new Set();
  const vars = {};
  // Walk nested rules too: Tailwind v4 and others put tokens inside @layer blocks
  const walk = (rules) => {
    for (const rule of rules) {
      if (rule.type === 7) keyframes.add(rule.name);
      if (rule.selectorText && /(^|,\s*):root\b/.test(rule.selectorText)) {
        for (const p of rule.style) if (p.startsWith('--') && !p.startsWith('--tw-')) vars[p] = rule.style.getPropertyValue(p).trim();
      }
      if (rule.cssRules) walk(rule.cssRules);
    }
  };
  for (const sheet of document.styleSheets) {
    try { walk(sheet.cssRules); } catch { /* cross-origin stylesheet */ }
  }
  const tally = (o, k) => { o[k] = (o[k] || 0) + 1; };
  const bg = {}, ink = {}, fonts = {};
  for (const el of [...document.querySelectorAll('body *')].slice(0, 5000)) {
    const s = getComputedStyle(el);
    if (s.backgroundColor !== 'rgba(0, 0, 0, 0)') tally(bg, s.backgroundColor);
    if (el.childNodes[0]?.nodeType === 3 && el.textContent.trim()) {
      tally(ink, s.color);
      tally(fonts, s.fontFamily.split(',')[0].replace(/"/g, ''));
    }
  }
  const top = (o, n = 10) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
  const html = document.documentElement;
  return {
    title: document.title,
    height: document.body.scrollHeight,
    type: { body: pick('body'), h1: pick('h1'), h2: pick('h2'), h3: pick('h3'), p: pick('p'), button: pick('button') },
    cssVariables: vars,
    keyframes: [...keyframes],
    runningAnimations: [...new Set(document.getAnimations().map((a) => a.animationName || a.constructor.name))].slice(0, 40),
    libraries: {
      lenis: html.classList.contains('lenis') || !!document.querySelector('.lenis'),
      gsap: !!window.gsap,
      three: !!window.THREE,
      canvas: document.querySelectorAll('canvas').length,
      video: document.querySelectorAll('video').length,
      maplibre: !!document.querySelector('.maplibregl-map'),
    },
    topBackgrounds: top(bg),
    topTextColours: top(ink),
    topFonts: top(fonts),
    headings: [...document.querySelectorAll('h1,h2,h3')].map((h) => `${h.tagName}: ${h.innerText.replace(/\s+/g, ' ').slice(0, 90)}`).slice(0, 40),
    imagesWithoutAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).map((i) => i.currentSrc || i.src).slice(0, 20),
    links: [...new Set([...document.querySelectorAll('a[href^="http"]')].map((a) => a.href))].slice(0, 40),
  };
}

const browser = await chromium.launch(); // default launch: WebGL works; SwiftShader flags can hang screenshots
for (const url of urls) {
  const host = new URL(url).host.replace(/[:]/g, '_');
  const dir = path.join(outDir, host);
  fs.mkdirSync(dir, { recursive: true });
  const report = { url, reducedMotion };
  const errors = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion });
    const page = await ctx.newPage();
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const shot = (name) => page.screenshot({ path: path.join(dir, name), timeout: 90000 }).catch((e) => errors.push(`screenshot ${name}: ${e.message.split('\n')[0]}`));
    await shot('d-00.png');
    report.atLoad = await page.evaluate(probe);
    const screens = Math.min(MAX_SCREENS, Math.ceil(report.atLoad.height / 900));
    for (let i = 1; i < screens; i++) {
      await page.mouse.wheel(0, 900);
      await page.waitForTimeout(1300);
      await shot(`d-${String(i).padStart(2, '0')}.png`);
    }
    report.afterScroll = await page.evaluate(probe);
    await ctx.close();

    if (!flags['no-mobile']) {
      const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion });
      const mp = await m.newPage();
      await mp.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
      await mp.waitForTimeout(2000);
      await mp.screenshot({ path: path.join(dir, 'm-00.png'), timeout: 90000 }).catch(() => {});
      report.mobileHorizontalOverflow = await mp.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      await m.close();
    }
  } catch (e) {
    errors.push(String(e).slice(0, 300));
  }
  report.consoleErrors = [...new Set(errors)];
  fs.writeFileSync(path.join(dir, 'probe.json'), JSON.stringify(report, null, 2));
  console.log(`done ${url} → ${dir}${report.consoleErrors.length ? ` (${report.consoleErrors.length} errors)` : ''}`);
}
await browser.close();
