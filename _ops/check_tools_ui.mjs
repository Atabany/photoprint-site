// Drives the three browser tools in headless Chrome and checks their state handling.
// Needs puppeteer-core outside this repo, e.g.:  (cd /tmp/pp-ui && npm i puppeteer-core@23.11.1)
//   NODE_PATH=/tmp/pp-ui/node_modules node _ops/check_tools_ui.mjs
// Uses the app repo's fictional test portrait next to this repo (../PhotoPrint).
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
const puppeteer = createRequire(path.join(process.env.NODE_PATH || '.', 'x'))('puppeteer-core');
const BROKEN = path.join(os.tmpdir(), 'pp-broken.jpg');
writeFileSync(BROKEN, randomBytes(2048));
const SITE = new URL('../', import.meta.url).href;
const browser = await puppeteer.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--allow-file-access-from-files']});
let fails = 0;
const expect = (ok, what, got) => { console.log(ok ? 'ok  ' : 'FAIL', what, ok ? '' : '→ ' + got); if (!ok) fails++; };
const text = (page, sel) => page.$eval(sel, e => e.innerText.replace(/\s+/g, ' ').trim());
const setVal = (page, sel, v) => page.$eval(sel, (e, v) => { e.value = v; e.dispatchEvent(new Event('input', {bubbles: true})); }, v);
async function open(file) {
  const page = await browser.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewport({width: 390, height: 844, isMobile: true});
  await page.goto(SITE + file, {waitUntil: 'load'});
  return {page, errors};
}
{ // Quality: the turn choice survives an ID size; failed file; typing after a photo.
  const {page, errors} = await open('photo-print-quality-checker.html');
  await setVal(page, '#q-px-width', '4032'); await setVal(page, '#q-px-height', '3024');
  let t = await text(page, '#q-result'); expect(t.includes('672 PPI') && t.includes('11.1%'), 'landscape 4x6 turned', t);
  await page.select('#q-size', '2 × 2 in'); await page.select('#q-size', '4 × 6 in');
  t = await text(page, '#q-result'); expect(t.includes('672 PPI') && await page.$eval('#q-turn', e => e.checked && !e.disabled), 'turn restored after ID size', t);
  await page.click('#q-turn'); await page.select('#q-size', '35 × 45 mm'); await page.select('#q-size', '5 × 7 in');
  expect(!(await page.$eval('#q-turn', e => e.checked)), 'unchecked choice also survives', '');
  await page.click('#q-turn');
  await (await page.$('#q-file')).uploadFile(new URL('../../PhotoPrint/marketing/releases/1.4/photos/id-portrait.jpg', import.meta.url).pathname);
  await new Promise(r => setTimeout(r, 600));
  expect((await text(page, '#q-file-name')).includes('1086 × 1448'), 'photo opened', await text(page, '#q-file-name'));
  await (await page.$('#q-file')).uploadFile(BROKEN);
  await new Promise(r => setTimeout(r, 600));
  t = await text(page, '#q-result');
  expect((await page.$eval('#q-px-width', e => e.value)) === '' && t.includes('above zero'), 'failed file clears old size', t);
  await setVal(page, '#q-px-width', '1170'); await setVal(page, '#q-px-height', '2532'); await page.select('#q-size', '4 × 6 in');
  t = await text(page, '#q-result'); expect(t.includes('293 PPI'), 'screenshot rounds like the app (293)', t);
  expect(errors.length === 0, 'no page errors', errors.join('; '));
  await page.close();
}
{ // Sheet: automatic gap follows the app.
  const {page, errors} = await open('photos-per-page-calculator.html');
  await page.select('#sheet-size', '2 × 3 in');
  let t = await text(page, '#sheet-result'); expect(/^2 2 photos/.test(t) && t.includes('3 mm gaps') && t.includes('With no space between photos, 4 fit'), 'wallet 4x6 automatic gap = 2, hint 4', t);
  await page.select('#sheet-gap', '0mm'); t = await text(page, '#sheet-result'); expect(/^4 4 photos/.test(t), 'wallet 4x6 no gap = 4', t);
  await page.select('#sheet-gap', 'auto'); await page.select('#sheet-size', '35 × 45 mm');
  t = await text(page, '#sheet-result'); expect(/^8 8 photos/.test(t) && t.includes('no gap'), 'ID automatic = no gap, 8', t);
  expect(errors.length === 0, 'no page errors', errors.join('; '));
  await page.close();
}
{ // Crop page edges prose
  const {page} = await open('photo-crop-calculator.html');
  const t = await text(page, '#which-edges + p'); expect(t.includes('shortens the photo\'s short side'), 'edges prose fixed', t);
  await page.close();
}
await browser.close();
console.log(fails ? `FAILED ${fails}` : 'ALL PASS');
