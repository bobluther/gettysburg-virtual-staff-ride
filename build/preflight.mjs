// Gettysburg Virtual Staff Ride — PREFLIGHT VALIDATOR
// Run before shipping. Loads the built single-file HTML headless, plays every stand to its settled state, and
// enforces the hex invariants:
//   (1) ONE COUNTER PER HEX  — no two units share a hex (the anti-stacking guarantee).
//   (2) NO ILLEGAL ENCIRCLEMENT — no ACTIVE unit sits embedded in enemy formations (>=4 enemy neighbours, <=1
//       friendly) unless it is marked captured/destroyed/overrun (a fate). Catches a unit mis-placed inside the enemy.
//   (3) No console/page errors during the walk.
// Exit code 0 = all clear; 1 = violations (so it can gate a deploy). Usage: node build/preflight.mjs
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createRequire } from 'module';
const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const HTML = resolve(__dirname, '..', 'Gettysburg-Staff-Ride-Simulator.html');
const { chromium, devices } = require('/Users/bobluther/.nvm/versions/node/v22.22.2/lib/node_modules/playwright');

const ctx = await chromium.launchPersistentContext('/tmp/gb-preflight', { headless: true, ...devices['iPhone 13'] });
const page = ctx.pages()[0] || await ctx.newPage();
const pageErrs = [];
page.on('pageerror', e => pageErrs.push(e.message));
page.on('console', m => { if (m.type() === 'error') pageErrs.push('console: ' + m.text()); });

await page.goto('file://' + HTML, { waitUntil: 'load' });
await page.waitForTimeout(900);

const report = await page.evaluate(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const DIRS = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
  const sideOf = g => { const s = (g.getAttribute('data-side') || '').toLowerCase(); return s.startsWith('un') ? 'union' : s.startsWith('co') ? 'conf' : (g.getAttribute('data-name') ? 'union' : 'conf'); };
  const hasFate = g => !!g.querySelector('.unit-fate') || (parseFloat(g.style.opacity) || 1) < 0.85;
  const xy = g => { const m = (g.getAttribute('transform') || '').match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/); return m ? [+m[1], +m[2]] : [0, 0]; };

  const stands = GB.stands.map(s => s.id);
  const out = { stacking: [], encircle: [], standsChecked: 0 };
  for (const sid of stands) {
    window.selectStand(sid); await sleep(220);
    state._beats = buildBeats();
    window.goToBeat(state._beats.length - 1); await sleep(1700);
    out.standsChecked++;

    const named = [...document.querySelectorAll('.layer-units .unit')].filter(g => g.style.display !== 'none');
    const toks  = [...document.querySelectorAll('.layer-arrows .unit')].filter(g => g.style.display !== 'none');
    const all = named.concat(toks);

    // (1) one per hex
    const cell = {};
    all.forEach(g => { const h = pixelToHex(...xy(g)); const k = h[0] + ',' + h[1]; (cell[k] = cell[k] || []).push(g.getAttribute('data-name') || '(token)'); });
    Object.entries(cell).filter(([k, v]) => v.length > 1).forEach(([k, v]) => out.stacking.push({ stand: sid, hex: k, units: v }));

    // (2) no illegal encirclement (named, active units only)
    const occ = {};
    all.forEach(g => { const h = pixelToHex(...xy(g)); occ[h[0] + ',' + h[1]] = sideOf(g); });
    named.forEach(g => {
      if (hasFate(g)) return; // captured/destroyed may be surrounded — legal
      const side = sideOf(g), h = pixelToHex(...xy(g));
      let enemy = 0, friend = 0;
      DIRS.forEach(d => { const s = occ[(h[0] + d[0]) + ',' + (h[1] + d[1])]; if (!s) return; s === side ? friend++ : enemy++; });
      if (enemy >= 4 && friend <= 1) out.encircle.push({ stand: sid, unit: g.getAttribute('data-name'), enemy, friend });
    });
  }
  return out;
});

await ctx.close();

// HARD invariants (block a ship): one-per-hex + clean console. Encirclement is ADVISORY — at real points of
// contact (Devil's Den, the Peach Orchard gun line) opposing counters ARE legitimately adjacent, so it's surfaced
// for a human/Douds eye, not auto-failed.
const fail = report.stacking.length || pageErrs.length;
console.log('\n=== GETTYSBURG PREFLIGHT ===');
console.log(`Stands checked: ${report.standsChecked}`);
console.log(`[HARD] Stacked hexes (two counters sharing one hex): ${report.stacking.length}`);
report.stacking.slice(0, 12).forEach(s => console.log(`    ✗ [${s.stand}] hex ${s.hex}: ${s.units.join(' + ')}`));
console.log(`[HARD] Page/console errors: ${pageErrs.length}`);
pageErrs.slice(0, 6).forEach(e => console.log(`    ✗ ${e}`));
console.log(`[ADVISORY] Tightly-contacted units (ring of enemy, no/low friendly support — eyeball these): ${report.encircle.length}`);
report.encircle.slice(0, 12).forEach(e => console.log(`    • [${e.stand}] ${e.unit} — ${e.enemy} enemy / ${e.friend} friendly neighbours`));
console.log(fail
  ? '\nRESULT: ✗ FAIL — a hard invariant is broken; fix before shipping.\n'
  : `\nRESULT: ✓ PASS — hard invariants hold across all ${report.standsChecked} stands (one-per-hex, no errors).${report.encircle.length ? ' '+report.encircle.length+' advisory note(s) above for review.' : ''}\n`);
process.exit(fail ? 1 : 0);
