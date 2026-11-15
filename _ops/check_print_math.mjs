// Compares assets/print-math.js with the iOS app's own Domain code.
// Build the harness first (from this repo's root):
//   D=../PhotoPrint/PhotoPrint; swiftc -O -o /tmp/pp-engine _ops/engine-harness/main.swift $D/Domain/*.swift $D/Rendering/BackgroundReplacer.swift
// then: node _ops/check_print_math.mjs /tmp/pp-engine
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const M = require('../assets/print-math.js');
const engine = process.argv[2];
if (!engine) { console.error('usage: node _ops/check_print_math.mjs <engine binary>'); process.exit(2); }

let seed = 20261115;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const pick = a => a[Math.floor(rnd() * a.length)];
const mm = v => v * M.PT_PER_MM, inch = v => v * M.PT_PER_IN;
const presets = [[inch(2), inch(3)], [inch(4), inch(6)], [inch(5), inch(7)], [inch(2), inch(2)], [mm(35), mm(45)], [inch(1), inch(1)],
  [mm(33), mm(48)], [mm(50), mm(70)], [mm(35), mm(50)], [mm(40), mm(60)], [mm(50), mm(60)], [mm(30), mm(40)], [inch(2.5), inch(3.5)], [inch(3.5), inch(5)], [inch(8), inch(10)]];
const papers = Object.keys(M.PAPERS);
const cases = [];
for (const [w, h] of presets) for (const paper of papers) for (const orientation of ['portrait', 'landscape'])
  for (const spacing of [0, M.DEFAULT_SPACING]) for (const rotates of [true, false]) for (const margin of [0, M.DEFAULT_MARGIN])
    cases.push({kind: 'sheet', w, h, paper, orientation, margin, spacing, rotates, centers: !rotates, px: 0, py: 0, fill: true});
for (let i = 0; i < 3000; i++) {
  const w = mm(5 + rnd() * 200), h = rnd() < 0.15 ? w : mm(5 + rnd() * 200);
  cases.push({kind: 'sheet', w, h, paper: pick(papers), orientation: pick(['portrait', 'landscape']), margin: mm(rnd() * 25),
    spacing: mm(pick([0, 0, 3, rnd() * 10])), rotates: rnd() < 0.6, centers: rnd() < 0.5, px: 0, py: 0, fill: true});
}
const pixels = [[4032, 3024], [3024, 4032], [5712, 4284], [8064, 6048], [1170, 2532], [800, 600], [600, 600], [1200, 1800], [6000, 4000], [1080, 1920]];
for (const [px, py] of pixels) for (const [w, h] of presets) for (const fill of [true, false]) {
  cases.push({kind: 'quality', w, h, paper: null, orientation: null, margin: 0, spacing: 0, rotates: true, centers: false, px, py, fill});
  cases.push({kind: 'quality', w: h, h: w, paper: null, orientation: null, margin: 0, spacing: 0, rotates: true, centers: false, px, py, fill});
}
for (let i = 0; i < 2000; i++) cases.push({kind: 'quality', w: mm(5 + rnd() * 300), h: mm(5 + rnd() * 300), paper: null, orientation: null,
  margin: 0, spacing: 0, rotates: true, centers: false, px: Math.round(50 + rnd() * 9000), py: Math.round(50 + rnd() * 9000), fill: rnd() < 0.5});

const run = spawnSync(engine, {input: cases.map(c => JSON.stringify(c)).join('\n') + '\n', maxBuffer: 1 << 30});
if (run.status !== 0) { console.error(run.stderr.toString()); process.exit(1); }
const outs = run.stdout.toString().trim().split('\n').map(l => JSON.parse(l));
const close = (a, b, eps = 1e-6) => (a == null && b == null) || Math.abs(a - b) <= eps;
let failures = 0, sheets = 0, qualities = 0;
const fail = (c, msg) => { if (failures++ < 15) console.error('MISMATCH', msg, JSON.stringify(c)); };
cases.forEach((c, i) => {
  const o = outs[i];
  if (c.kind === 'sheet') {
    sheets++;
    const base = M.PAPERS[c.paper];
    const page = c.orientation === 'portrait' ? {w: base.w, h: base.h} : {w: base.h, h: base.w};
    const r = M.fillSheet({w: c.w, h: c.h, page, margin: c.margin, spacing: c.spacing, rotates: c.rotates, centers: c.centers});
    if (r.fits !== o.fits) return fail(c, `fits ${r.fits} vs app ${o.fits}`);
    if (r.cells.length !== o.count) return fail(c, `count ${r.cells.length} vs app ${o.count}`);
    if (o.fits && Math.min(o.count, 50) !== o.filler) return fail(c, `app SheetFiller ${o.filler} vs engine ${o.count}`);
    r.cells.forEach((cell, k) => {
      const a = o.cells[k];
      if (!close(cell.x, a.x) || !close(cell.y, a.y) || !close(cell.w, a.w) || !close(cell.h, a.h) || cell.r !== a.r) fail(c, `cell ${k}`);
    });
  } else {
    qualities++;
    const q = M.quality(c.px, c.py, c.w, c.h, c.fill);
    if (!close(q.ppi, o.ppi, 1e-6) || q.rating !== o.rating) return fail(c, `ppi ${q.ppi} ${q.rating} vs app ${o.ppi} ${o.rating}`);
    if (!close(q.source.x, o.sx) || !close(q.source.y, o.sy) || !close(q.source.w, o.sw) || !close(q.source.h, o.sh)) return fail(c, 'source rect');
    const l3 = M.largestSize(c.w, c.h, q.ppi, 300), l2 = M.largestSize(c.w, c.h, q.ppi, 200);
    if (!close(l3?.w, o.l300w) || !close(l3?.h, o.l300h) || !close(l2?.w, o.l200w) || !close(l2?.h, o.l200h)) return fail(c, 'largest size');
  }
});
if (failures) { console.error(`FAIL: ${failures} mismatches`); process.exit(1); }
console.log(`PASS: print-math.js matches the app on ${sheets} sheet layouts and ${qualities} quality checks`);
