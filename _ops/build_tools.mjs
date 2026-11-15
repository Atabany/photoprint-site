// Builds the tool pages (tools.html and the three browser tools) from this file.
// Tables are computed from assets/print-math.js, which _ops/check_print_math.mjs keeps equal
// to the iOS app's engine. Run: node _ops/build_tools.mjs && python3 _ops/appstore_campaign.py && python3 _ops/validate.py
import {writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const require = createRequire(import.meta.url);
const M = require('../assets/print-math.js');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://usephotoprint.com/';
const CSS = 'assets/style.css?v=20261115';
const UPDATED = '15 November 2026', UPDATED_ISO = '2026-11-15';
const AUTHOR = {'@type': 'Person', name: 'Mohamed Elatabany', url: BASE + 'about.html'};
const STORE = tag => `https://apps.apple.com/app/apple-store/id6808903369?pt=127826363&amp;ct=${tag}&amp;mt=8`;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = html => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const IN = M.PT_PER_IN, MM = M.PT_PER_MM;

function shell({file, title, description, crumb, jsonld, body, scripts = []}) {
  const url = BASE + file;
  const ld = [...jsonld, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      {'@type': 'ListItem', position: 1, name: 'Photo Print', item: BASE},
      ...(crumb ? [{'@type': 'ListItem', position: 2, name: 'Tools', item: BASE + 'tools.html'}] : []),
      {'@type': 'ListItem', position: crumb ? 3 : 2, name: title, item: url}]
  }];
  if (title.length > 60) throw new Error(`${file}: title ${title.length} chars`);
  if (description.length > 155) throw new Error(`${file}: description ${description.length} chars`);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${url}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta name="apple-itunes-app" content="app-id=6808903369"><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><link rel="apple-touch-icon" href="assets/app-icon.png"><link rel="stylesheet" href="${CSS}">${ld.map(d => `<script type="application/ld+json">${JSON.stringify(d)}</script>`).join('')}<meta property="og:image" content="https://usephotoprint.com/assets/print-studio-poster.webp"><meta property="og:image:alt" content="Photo Print artwork showing photo sizes, sheets and printing"><meta name="twitter:card" content="summary_large_image">
</head><body><a class="skip" href="#main">Skip to content</a><div class="wrap"><header class="site-header"><a class="brand" href="index.html"><img src="assets/app-icon.png" width="40" height="40" alt="">Photo Print<span>.</span></a><nav aria-label="Main"><a href="guides.html">Printing guides</a><a href="tools.html">Tools</a><a href="support.html">Support</a><a class="nav-store" href="${STORE('website-nav')}" aria-label="Download Photo Print on the App Store"><img src="assets/app-store-badge.svg" width="120" height="40" alt="Download on the App Store"></a></nav></header><main id="main">
<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Photo Print</a>${crumb ? '<span aria-hidden="true">/</span><a href="tools.html">Tools</a>' : ''}</nav>
${body}
</main><footer class="site-footer"><a class="brand" href="index.html">Photo Print<span>.</span></a><p>Made by Mohamed Elatabany for iPhone &amp; iPad.</p><nav aria-label="Footer"><a href="guides.html">Guides</a><a href="tools.html">Tools</a><a href="privacy.html">Privacy</a><a href="support.html">Support</a><a href="about.html">About</a></nav><small>No cookies or analytics. Your photos stay on your device.</small></footer></div>${scripts.map(s => `<script src="${s}" defer></script>`).join('')}</body></html>
`;
}

const webApp = (name, file, description) => ({
  '@context': 'https://schema.org', '@type': 'WebPage', name, headline: name, description, url: BASE + file,
  datePublished: UPDATED_ISO, dateModified: UPDATED_ISO, author: AUTHOR, mainEntityOfPage: BASE + file,
  mainEntity: {'@type': 'WebApplication', name, url: BASE + file, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript', isAccessibleForFree: true, offers: {'@type': 'Offer', price: '0', priceCurrency: 'USD'}, author: AUTHOR}
});
const faqLd = faqs => ({'@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faqs.map(([q, a]) => ({'@type': 'Question', name: q, acceptedAnswer: {'@type': 'Answer', text: strip(a)}}))});
const faqHtml = faqs => `<h2 id="faq">Frequently asked questions</h2>\n${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n')}`;
const byline = `<p class="updated">By <a href="about.html">Mohamed Elatabany</a> · Updated ${UPDATED}</p>`;
const ending = `<p class="article-end">Written by <a href="about.html">Mohamed Elatabany</a>, developer of Photo Print. <a href="support.html">Send a correction or ask for help</a>.</p>`;
const cta = (heading, text, tag) => `<aside class="guide-cta">
<h2 id="get-the-app">${heading}</h2>
<p>${text}</p>
<div class="cta-row"><img src="assets/app-icon.png" width="56" height="56" alt="Photo Print app icon"><a class="store" href="${STORE(tag)}" aria-label="Download Photo Print on the App Store"><img src="assets/app-store-badge.svg" width="168" height="56" alt="Download on the App Store"></a></div>
</aside>`;
const APP_PITCH = 'Photo Print has exact sizes in inches, cm or mm, sheet previews, a print-quality check, AirPrint, PDF and a 4 × 6 JPEG for photo labs. Your first completed output is included; Pro is available as a subscription or a one-time unlock.';

// Photo sizes offered by the tools: the app's presets plus common everyday prints.
const ID_SIZES = [
  ['2 × 2 in', 2, 2, 'in', 'US passport'], ['35 × 45 mm', 35, 45, 'mm', 'passport & visa'], ['1 × 1 in', 1, 1, 'in', 'ID photo'],
  ['33 × 48 mm', 33, 48, 'mm', 'China'], ['35 × 50 mm', 35, 50, 'mm', 'Malaysia'], ['40 × 60 mm', 40, 60, 'mm', 'Vietnam'],
  ['50 × 60 mm', 50, 60, 'mm', 'Türkiye'], ['50 × 70 mm', 50, 70, 'mm', 'Canada'], ['30 × 40 mm', 30, 40, 'mm', 'Japan résumé']];
const PRINT_SIZES = [
  ['2 × 3 in', 2, 3, 'in', 'wallet'], ['2.5 × 3.5 in', 2.5, 3.5, 'in', 'wallet'], ['3.5 × 5 in', 3.5, 5, 'in', ''],
  ['4 × 6 in', 4, 6, 'in', 'standard'], ['5 × 7 in', 5, 7, 'in', ''], ['8 × 10 in', 8, 10, 'in', '']];
const option = ([label, w, h, unit, caption], id, selected) =>
  `<option value="${label}" data-w="${w}" data-h="${h}" data-unit="${unit}" data-label="${label}" data-id="${id ? 1 : 0}"${selected === label ? ' selected' : ''}>${label}${caption ? ' · ' + caption : ''}</option>`;
const sizeOptions = selected => `<optgroup label="Passport and ID photos">${ID_SIZES.map(s => option(s, true, selected)).join('')}</optgroup><optgroup label="Everyday prints">${PRINT_SIZES.map(s => option(s, false, selected)).join('')}</optgroup><option value="custom">Custom size…</option>`;
const customFields = prefix => `<div class="tool-fields wide" id="${prefix}-custom" hidden>
<label>Width<input id="${prefix}-width" type="number" min="0.1" max="1000" step="any" value="3" inputmode="decimal"></label>
<label>Height<input id="${prefix}-height" type="number" min="0.1" max="1000" step="any" value="4" inputmode="decimal"></label>
<label>Units<select id="${prefix}-unit"><option value="in">Inches</option><option value="cm">Centimetres</option><option value="mm">Millimetres</option></select></label>
</div>`;

function sheetCount(w, h, paperKey, orientation, {spacing = 0, rotates, centers}) {
  const paper = M.PAPERS[paperKey];
  const page = orientation === 'portrait' ? {w: paper.w, h: paper.h} : {w: paper.h, h: paper.w};
  const margin = paper.borderless ? 0 : M.DEFAULT_MARGIN;
  return M.fillSheet({w, h, page, margin, spacing, rotates, centers});
}
function bestSheet(w, h, paperKey, opts) {
  const p = sheetCount(w, h, paperKey, 'portrait', opts), l = sheetCount(w, h, paperKey, 'landscape', opts);
  const turns = r => r.cells.filter(c => c.r).length;
  const pickL = l.cells.length > p.cells.length || (l.cells.length === p.cells.length && turns(l) < turns(p));
  return {n: pickL ? l.cells.length : p.cells.length, landscape: pickL && l.cells.length > p.cells.length, portrait: p.cells.length};
}
const pt = ([, w, h, unit]) => [w * M.UNITS[unit], h * M.UNITS[unit]];

/* ---------------- Photos per page calculator ---------------- */
function sheetPage() {
  const file = 'photos-per-page-calculator.html';
  const title = 'Photos Per Page Calculator: How Many Fit on a Sheet';
  const description = 'See how many 2×2, passport, wallet or 4×6 photos fit on 4×6, 5×7, A4 or Letter paper, with a to-scale sheet preview. Free, in your browser.';
  const papers = [['photo4x6', '4 × 6 in'], ['photo5x7', '5 × 7 in'], ['usLetter', 'US Letter'], ['a4', 'A4']];
  const cell = r => r.n === 0 ? '—' : r.landscape ? `${r.n} <abbr title="paper turned to landscape">L</abbr>` : `${r.n}`;
  const idRows = ID_SIZES.map(s => `<tr><th scope="row">${s[0]}</th>${papers.map(([k]) => `<td>${cell(bestSheet(...pt(s), k, {rotates: false, centers: true}))}</td>`).join('')}</tr>`).join('\n');
  const printRows = PRINT_SIZES.map(s => `<tr><th scope="row">${s[0]}${s[4] === 'wallet' ? ' wallet' : ''}</th>${papers.map(([k]) => `<td>${cell(bestSheet(...pt(s), k, {rotates: true, centers: false}))}</td>`).join('')}</tr>`).join('\n');
  // Facts quoted in the prose, computed so they cannot drift from the tables.
  const c = (label, paper, opts) => bestSheet(...pt([...ID_SIZES, ...PRINT_SIZES].find(s => s[0] === label)), paper, opts);
  const ID = {rotates: false, centers: true}, PR = {rotates: true, centers: false}, GAP = {rotates: true, centers: false, spacing: M.DEFAULT_SPACING};
  const f = {
    id2x2on4x6: c('2 × 2 in', 'photo4x6', ID), p35on4x6: c('35 × 45 mm', 'photo4x6', ID), w23on4x6: c('2 × 3 in', 'photo4x6', PR),
    id2x2onLetter: c('2 × 2 in', 'usLetter', ID), id2x2onA4: c('2 × 2 in', 'a4', ID), p35onA4: c('35 × 45 mm', 'a4', ID), p35onLetter: c('35 × 45 mm', 'usLetter', ID),
    w23gap4x6: c('2 × 3 in', 'photo4x6', GAP), w23Letter: c('2 × 3 in', 'usLetter', PR), w23gapLetter: c('2 × 3 in', 'usLetter', GAP),
    w2535on4x6: c('2.5 × 3.5 in', 'photo4x6', PR), w2535Letter: c('2.5 × 3.5 in', 'usLetter', PR),
    s46Letter: c('4 × 6 in', 'usLetter', PR), s46gapLetter: c('4 × 6 in', 'usLetter', GAP), s46A4: c('4 × 6 in', 'a4', PR),
    s35Letter: c('3.5 × 5 in', 'usLetter', PR)
  };
  const expect = (value, n, what) => { if (value !== n) throw new Error(`photos-per-page prose: ${what} is ${value}, text says ${n}`); };
  expect(f.id2x2on4x6.n, 6, '2×2 on 4×6'); expect(f.p35on4x6.portrait, 6, '35×45 portrait 4×6'); expect(f.p35on4x6.n, 8, '35×45 best 4×6');
  expect(f.w23on4x6.n, 4, 'wallet on 4×6'); expect(f.id2x2onLetter.n, 20, '2×2 on Letter'); expect(f.w23gap4x6.n, 2, 'wallet 4×6 gap');
  expect(f.w23Letter.n, 13, 'wallet Letter'); expect(f.w23Letter.portrait, 12, 'wallet Letter portrait'); expect(f.w23gapLetter.n, 10, 'wallet Letter gap');
  expect(f.w2535on4x6.n, 2, '2.5×3.5 on 4×6'); expect(f.w2535Letter.n, 9, '2.5×3.5 Letter'); expect(f.s46Letter.n, 3, '4×6 Letter');
  expect(f.s46gapLetter.n, 2, '4×6 Letter gap'); expect(f.s46A4.n, 2, '4×6 A4'); expect(f.id2x2onA4.n, 15, '2×2 A4');
  expect(f.p35onA4.n, 32, '35×45 A4'); expect(f.p35onA4.portrait, 30, '35×45 A4 portrait'); expect(f.p35onLetter.portrait, 25, '35×45 Letter portrait'); expect(f.p35onLetter.n, 28, '35×45 Letter'); expect(f.s35Letter.n, 4, '3.5×5 Letter');

  // Server-rendered default: 2 × 2 in on borderless 4 × 6, as the script draws it.
  const d = sheetCount(2 * IN, 2 * IN, 'photo4x6', 'portrait', ID);
  const svg = `<svg viewBox="-4 -4 ${288 + 8} ${432 + 8}" role="img" aria-label="6 photos of 2 × 2 in on 4 × 6 in, 3 rows of 2"><rect x="0" y="0" width="288" height="432" fill="#fff" stroke="#b9b2a2" stroke-width="1.5" vector-effect="non-scaling-stroke"/>${d.cells.map(k => `<rect x="${k.x}" y="${k.y}" width="${k.w}" height="${k.h}" fill="#f3ddd2" stroke="#a34727" stroke-width="1" vector-effect="non-scaling-stroke"/>`).join('')}</svg>`;

  const faqs = [
    ['How many 2 × 2 photos fit on a 4 × 6?', `Six, in three rows of two, on borderless 4 × 6 in paper with no gap between them. With a 3 mm gap only two fit, because 2 + 2 inches plus a gap is wider than the 4 inch sheet.`],
    ['How many passport photos fit on a 4 × 6 sheet?', `Six 2 × 2 in photos. For 35 × 45 mm photos, ${f.p35on4x6.portrait} fit on a portrait sheet and ${f.p35on4x6.n} when the sheet is turned to landscape, with every face still upright.`],
    ['How many wallet photos fit on a page?', `Four 2 × 3 in wallets fit on a 4 × 6 print edge to edge; with a 3 mm gap only ${f.w23gap4x6.n} fit. A US Letter page with ¼ in margins holds ${f.w23Letter.n} with the page turned to landscape (${f.w23Letter.portrait} in portrait). The larger 2.5 × 3.5 in wallet fits ${f.w2535on4x6.n} on a 4 × 6 and ${f.w2535Letter.n} on Letter.`],
    ['How many 4 × 6 photos fit on a Letter or A4 page?', `Three on US Letter with no gap (two upright and one sideways below them), or two with gaps. A4 holds two. These counts use ¼ in margins.`],
    ['Is the count the same in the Photo Print app?', 'Yes, with the same margin and space settings. The calculator uses the same layout rules as Photo Print, and its Automatic settings are the app’s defaults: no space between ID photos, 3 mm between everyday prints. For edge-to-edge wallets, set Space between photos to 0 in the app. The app makes up to 50 copies of one photo at a time; add the photo again to go beyond that.'],
    ['Does this calculator need my photos?', 'No. It only needs the photo size and the paper, and it runs entirely in your browser.']
  ];
  const body = `<h1>Photos per page calculator</h1>
${byline}
<p class="answer">A borderless 4 × 6 in sheet holds <strong>six 2 × 2 in photos</strong>, <strong>eight 35 × 45 mm passport photos</strong> when the paper is turned to landscape, or <strong>four 2 × 3 in wallets</strong> with no space between them. A US Letter page with ¼ in margins holds twenty 2 × 2 in photos. Choose a photo size and paper to see the count and a to-scale layout.</p>
<section class="calculator card" aria-labelledby="calc-heading">
<h2 id="calc-heading">How many photos fit on one sheet?</h2>
<form id="sheet-form">
<div class="tool-fields">
<label class="wide">Photo size<select id="sheet-size">${sizeOptions('2 × 2 in')}</select></label>
${customFields('sheet')}
<label>Paper<select id="sheet-paper"><option value="photo4x6">4 × 6 in (10 × 15 cm)</option><option value="photo5x7">5 × 7 in (13 × 18 cm)</option><option value="usLetter">US Letter (8.5 × 11 in)</option><option value="a4">A4 (210 × 297 mm)</option><option value="a5">A5 (148 × 210 mm)</option><option value="a6">A6 (105 × 148 mm)</option><option value="legal">US Legal (8.5 × 14 in)</option></select></label>
<label>Paper direction<select id="sheet-orientation"><option value="best">Whichever fits more</option><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
<label>Margin<select id="sheet-margin"><option value="auto">Automatic (Photo Print default)</option><option value="0mm">None (borderless)</option><option value="3mm">3 mm</option><option value="5mm">5 mm</option><option value="0.25in">¼ in (6.35 mm)</option><option value="10mm">10 mm</option></select></label>
<label>Space between photos<select id="sheet-gap"><option value="auto">Automatic (Photo Print default)</option><option value="0mm">None: cut along shared lines</option><option value="1mm">1 mm</option><option value="2mm">2 mm</option><option value="3mm">3 mm</option><option value="5mm">5 mm</option></select></label>
<label class="choice wide"><input id="sheet-turn" type="checkbox"> Allow photos to turn sideways</label>
</div>
<noscript><p>The calculator needs JavaScript. The tables below list the counts for common sizes.</p></noscript>
</form>
<div id="sheet-result" class="tool-result" aria-live="polite"><span class="result-count">6</span><p><strong>6 photos of 2 × 2 in</strong> fit on one 4 × 6 in sheet in portrait.</p><p class="muted">3 rows of 2 · no margin (borderless) · no gap between photos.</p></div>
<figure id="sheet-preview" class="sheet-preview">${svg}<figcaption>Drawn to scale. <span class="legend-swatch up"></span>Upright.</figcaption></figure>
<p class="fine">Automatic is what Photo Print starts with: no margin on 4 × 6 and 5 × 7 photo paper and ¼ in on other paper; no space between ID photos and 3 mm between everyday prints. Runs in your browser with the same layout rules as the Photo Print app. A photo that does not fit is never shrunk.</p>
</section>

<h2 id="id-photos-per-sheet">Passport and ID photos per sheet</h2>
<p>ID photos are kept upright, with no gap, so the cut lines are shared. Turning the paper can fit more: “L” marks counts where landscape paper wins.</p>
<div class="table-wrap"><table>
<caption>Upright ID photos per sheet. 4 × 6 and 5 × 7 borderless; Letter and A4 with ¼ in margins.</caption>
<thead><tr><th scope="col">Photo size</th>${papers.map(([, n]) => `<th scope="col">${n}</th>`).join('')}</tr></thead>
<tbody>
${idRows}
</tbody></table></div>
<p>Sizes link to their guides: <a href="print-2x2-photos-iphone.html">2 × 2 in</a>, <a href="print-35x45-mm-photos-iphone.html">35 × 45 mm</a>, <a href="print-1x1-id-photos-iphone.html">1 × 1 in</a>, <a href="print-35x50-mm-photos-malaysia.html">35 × 50 mm</a>, <a href="print-4x6-cm-photos-vietnam-thailand.html">40 × 60 mm</a> and <a href="print-50x60-mm-biometric-photos-turkiye.html">50 × 60 mm</a>. The count is about paper, not acceptance: each office sets its own photo rules.</p>

<h2 id="prints-per-sheet">Wallet, 4 × 6 and other prints per sheet</h2>
<p>Everyday prints may turn sideways when that fits more. These counts have no gap between photos.</p>
<div class="table-wrap"><table>
<caption>Prints per sheet, turning allowed, no gap. 4 × 6 and 5 × 7 borderless; Letter and A4 with ¼ in margins. L = paper turned to landscape.</caption>
<thead><tr><th scope="col">Print size</th>${papers.map(([, n]) => `<th scope="col">${n}</th>`).join('')}</tr></thead>
<tbody>
${printRows}
</tbody></table></div>
<p>Gaps cost photos. With a 3 mm gap, a 4 × 6 holds ${f.w23gap4x6.n} wallets instead of 4, and Letter holds ${f.w23gapLetter.n} instead of ${f.w23Letter.n}. See the <a href="print-wallet-photos-iphone.html">wallet photo guide</a> and <a href="print-multiple-photos-on-one-page.html">several photos on one page</a>.</p>

<h2 id="how-the-count-works">How the count is worked out</h2>
<p>Photos are placed left to right along a row, and rows go down the page, the way you would lay prints on a table. Each photo keeps its exact size. When turning is allowed, it also tries photos lying sideways and keeps whichever arrangement holds more. It tries both directions of paper too.</p>
<p>The margin is taken off every edge first. What is left is the printable area, and nothing may cross it. If a single photo is larger than that area, the calculator says so instead of shrinking it, because a 2 × 2 photo printed smaller is no longer a 2 × 2 photo.</p>

<h2 id="turn-the-paper">Turn the paper, not the faces</h2>
<p>A 4 × 6 sheet is 101.6 × 152.4 mm. In portrait, three 35 × 45 mm photos stack down the 152.4 mm side and two sit across the 101.6 mm side: six photos. Turned to landscape, four fit across the long side (140 mm) and two down the short side (90 mm): eight photos, and every face is still upright. Larger paper gains too: ${f.p35onA4.n} on landscape A4 against ${f.p35onA4.portrait} in portrait, and ${f.p35onLetter.n} on landscape US Letter against ${f.p35onLetter.portrait}.</p>

<h2 id="margins">Margins: photo paper and plain paper</h2>
<p>Photo paper in 4 × 6 and 5 × 7 is usually printed borderless, so the whole sheet is usable. On A4 and Letter most home printers cannot print right to the edge; Photo Print uses a ¼ in (6.35 mm) margin there by default. If your printer's margins are larger, choose a bigger margin above. The <a href="print-printer-test-sheet.html">printer test sheet</a> shows how close to the edge your printer prints.</p>

<h2 id="gaps">Gaps and cutting</h2>
<p>With no gap, two neighbouring photos share one cut line, so one straight cut separates them. A gap of 2–3 mm is forgiving if you cut with scissors, at the cost of fewer photos per sheet. Either way, print cut guides and use a ruler or a paper trimmer.</p>

<h2 id="print-at-actual-size">Print the sheet at actual size</h2>
<p>A planned sheet only comes out right when it is printed at 100%. Choose Actual Size or 100% scale, turn off Fit to Page, and measure one photo with a ruler. If it is the wrong size, see <a href="photo-printed-wrong-size.html">why prints come out the wrong size</a>.</p>

${faqHtml(faqs)}

<h2 id="more-tools">More tools</h2>
<ul>
<li><a href="photo-print-quality-checker.html">Check whether a photo is sharp enough for its print size</a></li>
<li><a href="photo-crop-calculator.html">See what a print size crops off your photo</a></li>
<li><a href="photo-size-calculator.html">Convert photo sizes and pixels</a></li>
<li><a href="tools.html">All photo printing tools</a></li>
</ul>
${ending}
${cta('Make the sheet on your iPhone.', `Photo Print lays out these sheets for you: choose a size, add a photo, fill the sheet and print with AirPrint, save a PDF or send a 4 × 6 JPEG to a photo lab. ${APP_PITCH.split('. ').slice(1).join('. ')}`, 'tool-per-page')}`;
  return {file, html: shell({file, title, description, crumb: true, body, scripts: ['assets/print-math.js?v=20261115', 'assets/sheet-tool.js?v=20261115'],
    jsonld: [webApp('Photos per page calculator', file, description), faqLd(faqs)]})};
}

/* ---------------- Print quality checker ---------------- */
function qualityPage() {
  const file = 'photo-print-quality-checker.html';
  const title = 'Photo Print Quality Checker: Is My Photo Sharp Enough?';
  const description = 'Choose a photo and a print size to see its PPI, whether it will print sharp, what the crop cuts off and the largest good size. Nothing is uploaded.';
  const row = (label, px, py, w, h, turn) => {
    if (turn && Math.abs(w - h) > M.TOL && (px > py) !== (w > h)) [w, h] = [h, w];
    const q = M.quality(px, py, w, h, true);
    const cut = 1 - (q.source.w * q.source.h) / (px * py);
    return {label, ppi: Math.round(q.ppi), rating: M.RATINGS[q.rating].label, cut: cut < 0.0005 ? 'none' : `${(cut * 100).toFixed(1)}%`};
  };
  const sizes = [['4 × 6 in', 4 * IN, 6 * IN, true], ['5 × 7 in', 5 * IN, 7 * IN, true], ['8 × 10 in', 8 * IN, 10 * IN, true], ['11 × 14 in', 11 * IN, 14 * IN, true],
    ['16 × 20 in', 16 * IN, 20 * IN, true], ['20 × 30 in', 20 * IN, 30 * IN, true], ['2 × 2 in ID photo', 2 * IN, 2 * IN, false], ['35 × 45 mm ID photo', 35 * MM, 45 * MM, false]];
  const iphone = sizes.map(([l, w, h, t]) => row(l, 3024, 4032, w, h, t));
  const table = rows => rows.map(r => `<tr><th scope="row">${r.label}</th><td>${r.ppi}</td><td>${r.rating}</td><td>${r.cut}</td></tr>`).join('\n');
  const shot = [row('4 × 6 in', 1170, 2532, 4 * IN, 6 * IN, true), row('8 × 10 in', 1170, 2532, 8 * IN, 10 * IN, true)];
  const small = [row('4 × 6 in', 1600, 1200, 4 * IN, 6 * IN, true), row('8 × 10 in', 1600, 1200, 8 * IN, 10 * IN, true), row('11 × 14 in', 1600, 1200, 11 * IN, 14 * IN, true)];
  const check = (got, want, what) => { if (String(got) !== String(want)) throw new Error(`quality prose: ${what} ${got} vs ${want}`); };
  check(iphone[0].ppi, 672, '12MP 4x6'); check(iphone[2].ppi, 378, '12MP 8x10'); check(iphone[4].rating, 'Fair', '16x20'); check(iphone[5].rating, 'Low', '20x30');
  check(shot[0].ppi, 293, 'shot 4x6'); check(shot[0].cut, '30.7%', 'shot 4x6 cut'); check(shot[1].ppi, 146, 'shot 8x10');
  check(small[0].ppi, 267, 'small 4x6'); check(small[1].ppi, 150, 'small 8x10'); check(small[2].ppi, 109, 'small 11x14');
  // Default result shown before the script runs: a portrait 12 MP photo at 4 × 6 in.
  const dq = M.quality(3024, 4032, 4 * IN, 6 * IN, true);
  const l3 = M.largestSize(4 * IN, 6 * IN, dq.ppi, 300), l2 = M.largestSize(4 * IN, 6 * IN, dq.ppi, 200);
  const st = s => `${Math.round(s.w / MM)} × ${Math.round(s.h / MM)} mm (${(Math.floor(s.w / IN * 100 + 1e-9) / 100)} × ${(Math.floor(s.h / IN * 100 + 1e-9) / 100)} in)`;
  const faqs = [
    ['What resolution do I need for a 4 × 6 print?', '1200 × 1800 pixels gives 300 PPI, which is sharp even up close. 800 × 1200 pixels gives 200 PPI, which looks sharp at normal viewing distance. Count only the pixels left after cropping.'],
    ['Is 150 PPI good enough?', 'For a large print seen from across a room, often yes. Up close it looks a little soft. Below 150 PPI most photos look visibly soft or pixelated.'],
    ['Will an iPhone photo print sharp at 8 × 10?', 'Yes. A 12 MP photo (3024 × 4032) cropped to 8 × 10 still has 378 PPI. Even 11 × 14 is rated Good. Detail runs out around 16 × 20, where it drops to Fair.'],
    ['Is my photo uploaded?', 'No. The photo is opened by your browser on your own device to read its pixel size and draw the preview. Nothing is sent anywhere, and the page works offline once loaded.'],
    ['Why can’t it open my HEIC photo?', 'Safari opens HEIC photos; some other browsers cannot. On iPhone, choosing a photo usually hands the page a JPEG copy. If a file will not open, type its pixel width and height instead: the result is the same.'],
    ['Does printing at a higher DPI setting make the photo sharper?', 'No. The printer’s DPI is how finely it lays down ink. The detail comes from the photo’s pixels, so a low-PPI photo stays soft whatever the printer setting.']
  ];
  const body = `<h1>Photo print quality checker</h1>
${byline}
<p class="answer">A photo print looks sharp at <strong>300 pixels per inch (PPI)</strong> and good at <strong>200 PPI</strong>; below 150 PPI it starts to look soft. Choose a photo and a print size: the checker crops it the way the print will, then shows the PPI, what gets cut off and the largest size that stays sharp. The photo is opened in your browser and never uploaded.</p>
<section class="calculator card" aria-labelledby="calc-heading">
<h2 id="calc-heading">Check a photo for a print size</h2>
<form id="quality-form">
<div class="file-pick"><input id="q-file" type="file" accept="image/*"><label class="button" for="q-file">Choose a photo</label><span id="q-file-name" class="file-name" aria-live="polite"></span></div>
<p class="or-line">Or type its pixel size:</p>
<div class="tool-fields">
<label>Width in pixels<input id="q-px-width" type="number" min="1" max="100000" step="1" value="3024" inputmode="numeric"></label>
<label>Height in pixels<input id="q-px-height" type="number" min="1" max="100000" step="1" value="4032" inputmode="numeric"></label>
<label class="wide">Print size<select id="q-size">${sizeOptions('4 × 6 in')}</select></label>
${customFields('q')}
<fieldset class="wide"><legend>How the photo fills the print</legend>
<label class="choice"><input type="radio" name="q-fit" value="fill" checked> Fill the print (crop the edges)</label>
<label class="choice"><input type="radio" name="q-fit" value="fit"> Fit the whole photo (blank paper around it)</label>
</fieldset>
<label class="choice wide"><input id="q-turn" type="checkbox" checked> Turn the print to match the photo (portrait or landscape)</label>
</div>
<noscript><p>The checker needs JavaScript. The tables below show results for common photos.</p></noscript>
</form>
<div id="q-result" class="tool-result" aria-live="polite"><p><span class="rating ${dq.rating}">${M.RATINGS[dq.rating].label}</span><strong>${Math.round(dq.ppi)} PPI</strong> at 4 × 6 in</p><p>${M.RATINGS[dq.rating].summary}</p><p class="muted">The print uses ${Math.round(dq.source.w)} × ${Math.round(dq.source.h)} of the photo's 3,024 × 4,032 pixels.</p><p class="muted">The crop removes ${((1 - dq.source.w * dq.source.h / (3024 * 4032)) * 100).toFixed(1)}% of the photo, from the left and right sides.</p><p class="muted">Largest size in this shape: ${st(l3)} at 300 PPI (Excellent), ${st(l2)} at 200 PPI (Good).</p></div>
<figure class="crop-preview"><canvas id="q-canvas" width="300" height="400"></canvas><figcaption id="q-caption">The framed part prints; the shaded part is cut off.</figcaption></figure>
<p class="fine">Uses the same quality ratings and crop maths as the Photo Print app. Your photo stays on your device.</p>
</section>

<h2 id="ratings">What the ratings mean</h2>
<div class="table-wrap"><table>
<caption>Print quality by pixels per inch, as Photo Print rates it</caption>
<thead><tr><th scope="col">Rating</th><th scope="col">PPI</th><th scope="col">What to expect</th></tr></thead>
<tbody>
<tr><th scope="row">Excellent</th><td>300 or more</td><td>${M.RATINGS.excellent.summary}</td></tr>
<tr><th scope="row">Good</th><td>200 to 299</td><td>${M.RATINGS.good.summary}</td></tr>
<tr><th scope="row">Fair</th><td>150 to 199</td><td>${M.RATINGS.fair.summary}</td></tr>
<tr><th scope="row">Low</th><td>under 150</td><td>${M.RATINGS.low.summary}</td></tr>
</tbody></table></div>

<h2 id="iphone-photo-example">Example: a 12 MP iPhone photo at common sizes</h2>
<p>A 12 MP iPhone photo is 3024 × 4032 pixels (4:3). Each print below is cropped to fill, with everyday prints turned to match the photo.</p>
<div class="table-wrap"><table>
<caption>3024 × 4032 photo, cropped to fill each print</caption>
<thead><tr><th scope="col">Print</th><th scope="col">PPI</th><th scope="col">Rating</th><th scope="col">Cropped off</th></tr></thead>
<tbody>
${table(iphone)}
</tbody></table></div>
<p>An iPhone photo has far more detail than a 4 × 6 or a passport photo needs. Its limits show only at poster sizes. Newer iPhones can save 24 MP or 48 MP photos, which go further: see <a href="photo-size-calculator.html#iphone-camera-sizes">how big you can print an iPhone photo</a>.</p>

<h2 id="screenshots-and-copies">Screenshots and resized copies</h2>
<p>Problems usually come from files with fewer pixels than the camera made. A 1170 × 2532 iPhone screenshot prints a 4 × 6 at ${shot[0].ppi} PPI (Good), but the crop removes ${shot[0].cut} of it, and at 8 × 10 it drops to ${shot[1].ppi} PPI (Low). A copy resized to 1600 × 1200 pixels, as some messaging and social apps do, gives ${small[0].ppi} PPI at 4 × 6, ${small[1].ppi} at 8 × 10 and ${small[2].ppi} at 11 × 14. When you can, print from the original in your photo library.</p>

<h2 id="why-cropping-matters">Why cropping lowers the PPI</h2>
<p>The checker counts only the pixels that reach the paper. When a photo is cropped to fill a print of a different shape, the cut-off part takes its pixels with it, and zooming in on part of a photo cuts more. That is why the result names the pixels the print uses, not the whole photo. See <a href="photo-print-resolution-ppi.html">pixels, PPI and cropping</a> for worked examples.</p>

<h2 id="fill-or-fit">Fill or fit?</h2>
<p><strong>Fill</strong> covers the whole print and crops whatever sticks out, which is what photo labs do by default. <strong>Fit</strong> keeps every part of the photo and leaves blank paper on two sides. ID photos are always filled and kept upright. The <a href="photo-crop-calculator.html">crop calculator</a> shows what each print size cuts off.</p>

<h2 id="find-pixel-size">Find a photo's pixel size</h2>
<ul>
<li><strong>iPhone or iPad:</strong> open the photo in Photos and swipe up, or tap the info button. The size appears as, for example, 3024 × 4032.</li>
<li><strong>Mac:</strong> open the photo in Preview and choose Tools › Show Inspector.</li>
<li><strong>Windows:</strong> right-click the file, choose Properties, then Details, and read Dimensions.</li>
</ul>

${faqHtml(faqs)}

<h2 id="more-tools">More tools</h2>
<ul>
<li><a href="photo-crop-calculator.html">See what every print size crops off your photo</a></li>
<li><a href="photos-per-page-calculator.html">Count how many photos fit on a sheet</a></li>
<li><a href="photo-size-calculator.html">Convert photo sizes and pixels</a></li>
<li><a href="tools.html">All photo printing tools</a></li>
</ul>
${ending}
${cta('Check quality in the layout itself.', `Photo Print rates every photo at its real print size, after your crop, and suggests the largest size that stays sharp. ${APP_PITCH}`, 'tool-quality')}`;
  return {file, html: shell({file, title, description, crumb: true, body, scripts: ['assets/print-math.js?v=20261115', 'assets/photo-check.js?v=20261115'],
    jsonld: [webApp('Photo print quality checker', file, description), faqLd(faqs)]})};
}

/* ---------------- Crop calculator ---------------- */
function cropPage() {
  const file = 'photo-crop-calculator.html';
  const title = 'Photo Crop Calculator: What 4×6, 5×7 and 8×10 Cut Off';
  const description = 'See how much a 4×6, 5×7, 8×10, wallet, square or A4 print crops off your photo, and from which edges. Choose a photo or a shape; nothing is uploaded.';
  const shapes = [['4:3', 4, 3, 'iPhone camera'], ['3:2', 3, 2, 'most cameras'], ['16:9', 16, 9, 'widescreen'], ['1:1', 1, 1, 'square'], ['19.5:9', 19.5, 9, 'iPhone screenshot']];
  const prints = [['4 × 6', 4, 6], ['5 × 7', 5, 7], ['8 × 10', 8, 10], ['3.5 × 5', 3.5, 5], ['11 × 14', 11, 14], ['8.5 × 11', 8.5, 11], ['A4', 210 / 25.4, 297 / 25.4]];
  const cutFor = (a, b, w, h) => {
    const px = a * 1000, py = b * 1000;
    let cw = w * IN, ch = h * IN;
    if (Math.abs(cw - ch) > M.TOL && (px > py) !== (cw > ch) && px !== py) [cw, ch] = [ch, cw];
    const q = M.quality(px, py, cw, ch, true);
    return 1 - (q.source.w * q.source.h) / (px * py);
  };
  const pct = v => v < 0.0005 ? 'none' : `${(v * 100).toFixed(1)}%`;
  const rows = shapes.map(([label, a, b, what]) => `<tr><th scope="row">${label} <span class="fine">${what}</span></th>${prints.map(([, w, h]) => `<td>${pct(cutFor(a, b, w, h))}</td>`).join('')}</tr>`).join('\n');
  const check = (got, want, what) => { if (got !== want) throw new Error(`crop prose: ${what} ${got} vs ${want}`); };
  check(pct(cutFor(4, 3, 4, 6)), '11.1%', '4:3 4x6'); check(pct(cutFor(4, 3, 5, 7)), '4.8%', '4:3 5x7'); check(pct(cutFor(4, 3, 8, 10)), '6.3%', '4:3 8x10');
  check(pct(cutFor(3, 2, 4, 6)), 'none', '3:2 4x6'); check(pct(cutFor(3, 2, 8, 10)), '16.7%', '3:2 8x10'); check(pct(cutFor(1, 1, 4, 6)), '33.3%', '1:1 4x6');
  check(pct(cutFor(16, 9, 4, 6)), '15.6%', '16:9 4x6'); check(pct(cutFor(3, 4, 2, 2)), '25.0%', '3:4 square');
  const p35 = M.quality(3024, 4032, 35 * MM, 45 * MM, true);
  check(pct(1 - p35.source.w * p35.source.h / (3024 * 4032)), '3.6%', '35x45');
  const faqs = [
    ['Why does a 4 × 6 print cut off part of my iPhone photo?', 'An iPhone photo is 4:3 and a 4 × 6 print is 3:2, which is longer and narrower. To cover the paper, about 11% of the photo is cut away: the top and bottom of a landscape photo, or the sides of a portrait one.'],
    ['Which print size fits an iPhone photo without cropping?', 'Sizes in the 4:3 shape: 3 × 4, 6 × 8, 9 × 12 or 12 × 16 in. On 4 × 6 paper you can print a 4 × 5.33 in photo and trim the extra strip. Photo Print accepts any custom size in inches, cm or mm.'],
    ['Is 8 × 10 the same shape as 4 × 6?', 'No. 8 × 10 is 4:5, close to square, so it shortens a photo’s long side. A 3:2 camera photo loses about 17% to an 8 × 10, but nothing to a 4 × 6.'],
    ['Is A4 the same shape as US Letter?', 'No. A4 is 1 : 1.414 and Letter is 1 : 1.294, so a photo filling A4 is cropped differently from one filling Letter.'],
    ['Can I choose which part of the photo is kept?', 'Yes. The calculator shows a centred crop, which is what most labs and apps start from. In Photo Print you can move and zoom the crop for each photo, or switch to Fit to keep the whole picture.'],
    ['Is my photo uploaded?', 'No. Your browser opens the photo on your device to draw the previews. Nothing is sent anywhere.']
  ];
  const body = `<h1>Photo crop calculator</h1>
${byline}
<p class="answer">A print crops your photo whenever their shapes differ. An iPhone photo (4:3) loses about <strong>11% to a 4 × 6</strong> print, 5% to a 5 × 7 and 6% to an 8 × 10. A camera photo (3:2) fits a 4 × 6 exactly but loses about 17% to an 8 × 10. Choose a photo to see every crop on your own picture.</p>
<section class="calculator card" aria-labelledby="calc-heading">
<h2 id="calc-heading">See what each print size keeps</h2>
<form id="crop-form">
<div class="file-pick"><input id="crop-file" type="file" accept="image/*"><label class="button" for="crop-file">Choose a photo</label><button type="button" id="crop-clear" hidden>Use a shape instead</button><span id="crop-file-name" class="file-name" aria-live="polite"></span></div>
<p class="or-line">Or pick a photo shape:</p>
<div class="tool-fields">
<label>Photo shape<select id="crop-shape">${shapes.map(([l, , , w]) => `<option value="${l}">${l} · ${w}</option>`).join('')}</select></label>
<label>Direction<select id="crop-orientation"><option value="portrait">Portrait (upright)</option><option value="landscape">Landscape (sideways)</option></select></label>
</div>
</form>
<div id="crop-grid" class="crop-grid" aria-live="polite"><noscript><p>The previews need JavaScript. The table below lists every crop.</p></noscript></div>
<p class="fine">Centred crop, with each print turned to match the photo, as Photo Print does. Shaded parts are cut off. Your photo stays on your device.</p>
</section>

<h2 id="crop-table">How much each print size crops</h2>
<p>Share of the photo cut off when the print is filled edge to edge and turned to match the photo. The percentage is the same for portrait and landscape photos; only the edges swap.</p>
<div class="table-wrap"><table>
<caption>Percentage of the photo removed, by photo shape and print size (inches)</caption>
<thead><tr><th scope="col">Photo</th>${prints.map(([l]) => `<th scope="col">${l}</th>`).join('')}</tr></thead>
<tbody>
${rows}
</tbody></table></div>

<h2 id="why-4x6-crops">Why a 4 × 6 crops an iPhone photo</h2>
<p>Shape is width divided by height. A 4 × 6 print is 6 ÷ 4 = 1.5; an iPhone photo is 4032 ÷ 3024 ≈ 1.33. To make the photo as long as the print, it keeps its full 4032 pixel length and only 4032 ÷ 1.5 = 2688 of its 3024 pixel width. The other 336 rows, 11.1% of the picture, are cut, half from each side.</p>

<h2 id="which-edges">Which edges get cut</h2>
<p>If the print is longer and narrower than the photo, as a 4 × 6 is for an iPhone photo, the crop shortens the photo's short side: it cuts the top and bottom of a landscape shot, or the left and right of a portrait one. If the print is squarer, as an 8 × 10 is, the crop shortens the long side instead: the left and right of a landscape shot. A square print always shortens the long side.</p>

<h2 id="keep-what-matters">Keep heads and edges in the picture</h2>
<ul>
<li><strong>Move the crop.</strong> In Photo Print, open a photo's crop and drag or zoom so the important part is inside the frame.</li>
<li><strong>Fit instead of fill.</strong> The whole photo prints, with blank paper on two sides.</li>
<li><strong>Pick a matching size.</strong> 6 × 8 or 9 × 12 in for iPhone photos; 4 × 6 or 8 × 12 in for 3:2 camera photos.</li>
</ul>
<p>ID photos crop differently because they are always portrait. A portrait iPhone photo loses only about 4% to a 35 × 45 mm passport photo and 25% to a square 2 × 2 in one, so leave space around the head when you take it. See <a href="print-2x2-photos-iphone.html">2 × 2 photos</a> and <a href="print-35x45-mm-photos-iphone.html">35 × 45 mm photos</a>.</p>

${faqHtml(faqs)}

<h2 id="more-tools">More tools</h2>
<ul>
<li><a href="photo-print-quality-checker.html">Check whether a photo is sharp enough for its print size</a></li>
<li><a href="photos-per-page-calculator.html">Count how many photos fit on a sheet</a></li>
<li><a href="print-4x6-photo-exact-size-iphone.html">Print a 4 × 6 photo at its exact size</a></li>
<li><a href="tools.html">All photo printing tools</a></li>
</ul>
${ending}
${cta('Choose the crop before you print.', `In Photo Print you see each photo cropped on the sheet, drag the crop to keep what matters, or switch to Fit to keep everything. ${APP_PITCH}`, 'tool-crop')}`;
  return {file, html: shell({file, title, description, crumb: true, body, scripts: ['assets/print-math.js?v=20261115', 'assets/photo-check.js?v=20261115'],
    jsonld: [webApp('Photo crop calculator', file, description), faqLd(faqs)]})};
}

/* ---------------- Tools hub ---------------- */
function toolsPage() {
  const file = 'tools.html';
  const title = 'Free Photo Printing Tools: Sizes, Sheets and Quality';
  const description = 'Free photo printing tools that run in your browser: photos per page, print quality and PPI, crop preview, size and pixel conversion, printer test sheets.';
  const tools = [
    ['photos-per-page-calculator.html', 'Photos per page calculator', 'How many 2 × 2, passport, wallet or 4 × 6 photos fit on 4 × 6, 5 × 7, A4 or Letter, with a to-scale preview.'],
    ['photo-print-quality-checker.html', 'Print quality checker', 'Choose a photo and a print size: see the PPI, whether it will be sharp, and the largest good size.'],
    ['photo-crop-calculator.html', 'Crop calculator', 'See what a 4 × 6, 5 × 7, 8 × 10, wallet, square or A4 print cuts off your photo.'],
    ['photo-size-calculator.html', 'Photo size calculator', 'Convert inches, cm and mm, find the pixels a print needs, or how large a photo can print.'],
    ['print-printer-test-sheet.html', 'Printer test sheet', 'Free A4, Letter and 4 × 6 PDFs with rulers and a 50 mm square to check actual size and margins.'],
    ['print-printer-test-sheet.html#check-print-scale', 'Print scale helper', 'Measured the test sheet? Enter the lengths to see exactly how much your printer shrank or enlarged it.']
  ];
  const body = `<h1>Free photo printing tools</h1>
${byline}
<p class="answer">Six free tools for getting a photo print right the first time. They run in your browser, need no account and never upload your photos. The sheet and quality maths follows the same rules as the Photo Print app.</p>
<div class="tool-grid">
${tools.map(([href, name, text]) => `<a class="tool-card" href="${href}"><strong>${name}</strong><span>${text}</span></a>`).join('\n')}
</div>

<h2 id="which-tool">Which tool do I need?</h2>
<ul>
<li><strong>“How many passport photos fit on a 4 × 6?”</strong> Use the <a href="photos-per-page-calculator.html">photos per page calculator</a>.</li>
<li><strong>“Is this photo good enough to print at 8 × 10?”</strong> Use the <a href="photo-print-quality-checker.html">print quality checker</a>.</li>
<li><strong>“Why did my 4 × 6 cut off someone's head?”</strong> Use the <a href="photo-crop-calculator.html">crop calculator</a>.</li>
<li><strong>“How many pixels is 35 × 45 mm?”</strong> Use the <a href="photo-size-calculator.html">photo size calculator</a>.</li>
<li><strong>“My prints come out smaller than they should.”</strong> Print the <a href="print-printer-test-sheet.html">printer test sheet</a>, then read <a href="photo-printed-wrong-size.html">why prints come out the wrong size</a>.</li>
</ul>

<h2 id="how-they-work">How these tools work</h2>
<p>Every tool runs in your browser. Photos you choose are opened on your device to read their size and draw previews, and are never sent anywhere. There are no cookies, accounts or analytics on this site.</p>
<p>The photos-per-page, quality and crop tools use the layout and quality rules of the Photo Print app, checked against the app's own code, so a sheet planned here matches the sheet the app makes. The same rule applies everywhere: a photo is never shrunk to fit. If it is too big for the paper, the tool says so.</p>

<h2 id="guides">Step-by-step guides</h2>
<p>For printing a particular size, see the <a href="guides.html">printing guides</a>: <a href="print-2x2-photos-iphone.html">2 × 2 photos</a>, <a href="print-35x45-mm-photos-iphone.html">35 × 45 mm passport photos</a>, <a href="print-wallet-photos-iphone.html">wallet photos</a>, <a href="print-multiple-photos-on-one-page.html">several photos on one page</a> and <a href="print-passport-photos-photo-lab.html">printing at a photo lab</a>.</p>
${ending}
${cta('Do it all in one app.', APP_PITCH, 'tool-index')}`;
  const ld = {'@context': 'https://schema.org', '@type': 'CollectionPage', name: title, headline: title, description, url: BASE + file,
    datePublished: UPDATED_ISO, dateModified: UPDATED_ISO, author: AUTHOR,
    mainEntity: {'@type': 'ItemList', itemListElement: tools.filter(t => !t[0].includes('#')).map(([href, name], i) => ({'@type': 'ListItem', position: i + 1, name, url: BASE + href}))}};
  return {file, html: shell({file, title, description, crumb: false, body, jsonld: [ld]})};
}

for (const page of [sheetPage(), qualityPage(), cropPage(), toolsPage()]) {
  writeFileSync(path.join(ROOT, page.file), page.html);
  console.log('wrote', page.file);
}
