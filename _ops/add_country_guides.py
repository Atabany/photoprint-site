"""Add the country ID-photo guides (2026-10-10). Pages reuse the current guide shell; run
_ops/enrich_site.py afterwards for contents, breadcrumbs, sitemap, llms.txt and campaign links."""
from pathlib import Path
import re, json, html
ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://usephotoprint.com/'
DATE = '2026-10-10'
template = (ROOT / 'print-35x45-mm-photos-iphone.html').read_text()
header = re.search(r'<header.*?</header>', template, re.S).group()
footer = re.search(r'<footer.*?</footer>', template, re.S).group()
esc = html.escape

def page(slug, title, description, body):
    url = BASE + slug + '.html'
    data = {'@context': 'https://schema.org', '@type': 'Article', 'headline': title, 'name': title,
            'description': description, 'url': url, 'datePublished': DATE, 'dateModified': DATE,
            'author': {'@type': 'Person', 'name': 'Mohamed Elatabany', 'url': BASE + 'about.html'},
            'mainEntityOfPage': url}
    cta = (f'<aside class="guide-cta"><h2>Make the sheet on your iPhone.</h2><p>Photo Print has exact sizes, '
           f'sheet previews, AirPrint and PDF. Your first completed output is included; Pro is a one-time purchase.</p>'
           f'<a class="store" href="https://apps.apple.com/app/id6808903369?ct=guide-{slug[:20]}&amp;mt=8" '
           f'aria-label="Download Photo Print on the App Store"><img src="assets/app-store-badge.svg" width="168" '
           f'height="56" alt="Download on the App Store"></a></aside>')
    out = (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           f'<title>{esc(title)}</title><meta name="description" content="{esc(description, quote=True)}">'
           f'<link rel="canonical" href="{url}"><meta name="robots" content="index,follow,max-image-preview:large">'
           f'<meta property="og:type" content="article"><meta property="og:title" content="{esc(title, quote=True)}">'
           f'<meta property="og:description" content="{esc(description, quote=True)}"><meta property="og:url" content="{url}">'
           f'<meta name="apple-itunes-app" content="app-id=6808903369"><link rel="icon" type="image/svg+xml" href="assets/favicon.svg">'
           f'<link rel="apple-touch-icon" href="assets/app-icon.png"><link rel="stylesheet" href="assets/style.css?v=20261005">'
           f'<script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script></head><body>'
           f'<a class="skip" href="#main">Skip to content</a><div class="wrap">{header}<main id="main"><h1>{esc(title)}</h1>'
           f'<p class="updated">By <a href="about.html">Mohamed Elatabany</a> · Updated 10 October 2026</p>{body}{cta}</main>{footer}</div></body></html>')
    (ROOT / (slug + '.html')).write_text(out)
    return {'@type': 'Article', 'headline': title, 'url': url, 'description': description}

def steps(w, h):
    return (f'<h2>Make the sheet</h2><ol><li>In Photo Print, open Settings and set units to <strong>millimetres</strong>.</li>'
            f'<li>Start a layout and add your portrait from the photo library.</li>'
            f'<li>Open the photo and type <strong>{w}</strong> for width and <strong>{h}</strong> for height. Enter millimetres exactly; do not round to inches.</li>'
            f'<li>Choose Fill so the portrait covers the rectangle, then drag and zoom to position the face.</li>'
            f'<li>Add copies, and choose the paper loaded in your printer: 4 × 6 in, A4 or US Letter.</li>'
            f'<li>Print with AirPrint, or save a PDF and print it at <strong>Actual size / 100%</strong>. Measure one photo with a ruler before trimming.</li></ol>')

caution = ('<div class="card"><strong>Size is only one requirement.</strong><p>Check the issuing authority’s current rules for the portrait itself — '
           'background, expression, lighting and age of the photo. Photo Print prints the exact size you enter; it does not check a photo against '
           'any government’s requirements.</p></div>')
related = ('<p><a href="print-printer-test-sheet.html">Check scaling with a free printer test sheet</a></p><h2>Next steps</h2><ul>'
           '<li><a href="photo-size-calculator.html">Convert photo sizes and calculate pixel targets</a></li>'
           '<li><a href="print-photo-pdf-actual-size.html">Print a photo PDF at actual size</a></li>'
           '<li><a href="guides.html">Browse all printing guides</a></li></ul>')

guides = []
guides.append(page('print-35x50-mm-photos-malaysia', 'Print 35 × 50 mm photos for Malaysia from iPhone',
    'Make a sheet of 35 × 50 mm photos on iPhone: exact size, Malaysia Immigration head-size guidance, pixel targets and how many fit on 4 × 6 paper.',
    '<p class="answer">A 35 × 50 mm photo is <strong>3.5 × 5 cm</strong>, about <strong>1.378 × 1.969 inches</strong>. Malaysia’s Immigration Department asks for 35 × 50 mm with the head 30–35 mm from chin to crown. In Photo Print, enter 35 × 50 mm, crop to fill, and print at 100%.</p>'
    + caution +
    '<h2>What the official guidance says</h2><p>The Immigration Department’s <a href="https://esd.imi.gov.my/portal/photo-requirements/">ESD photo requirements</a> (for expatriate passes) specify 35 × 50 mm, a head of 30–35 mm, about 5 mm above the head, and a plain background (white for VTR passes; white or blue for VDR). Rules for other documents can differ, so check the page for your application.</p>'
    + steps(35, 50) +
    '<h2>What resolution do I need?</h2><p>At 300 pixels per inch, aim for at least <strong>414 × 591 pixels</strong> after cropping. That is a print-quality target, not an official requirement.</p>'
    '<h2>How many fit on a 4 × 6 sheet?</h2><p>Six: two 35 mm columns (70 mm) across the 101.6 mm side and three 50 mm rows (150 mm) down the 152.4 mm side. That leaves very little edge room, so 4 × 6 photo paper must print borderless; on A4 or US Letter there is plenty of space.</p>'
    + related))
guides.append(page('print-50x60-mm-biometric-photos-turkiye', 'Print 50 × 60 mm biometric photos for Türkiye from iPhone',
    'Print 50 × 60 mm biyometrik photos for a Turkish passport or ID card from iPhone: exact size, head-size range, white background, pixels and sheet layout.',
    '<p class="answer">A 50 × 60 mm photo is <strong>5 × 6 cm</strong>, about <strong>1.969 × 2.362 inches</strong>. Turkish passports and identity cards use 50 × 60 mm biometric photos on a white background, with the head about 32–36 mm tall. In Photo Print, enter 50 × 60 mm, crop to fill and print at 100%.</p>'
    + caution +
    '<h2>What the official guidance says</h2><p>Turkish consulates list a 50 × 60 mm biometric photo with a plain white background (for example the <a href="https://losangeles-bk.mfa.gov.tr/Mission/ShowInfoNote/408295">Consulate General in Los Angeles</a>). The population directorate (NVI) describes a face height of 32–36 mm. Check your consulate or NVI office for the current wording.</p>'
    + steps(50, 60) +
    '<h2>What resolution do I need?</h2><p>At 300 pixels per inch, aim for at least <strong>591 × 709 pixels</strong> after cropping.</p>'
    '<h2>How many fit on a 4 × 6 sheet?</h2><p>Four: two 50 mm columns (100 mm) across the 101.6 mm side and two 60 mm rows (120 mm) down the long side. On A4, twelve fit with room for margins.</p>'
    + related))
guides.append(page('print-4x6-cm-photos-vietnam-thailand', 'Print 4 × 6 cm photos (Vietnam passport, Thai visa) from iPhone',
    '4 × 6 cm is not 4 × 6 inches. Print 40 × 60 mm photos for a Vietnamese passport or a Thai visa from iPhone, with pixel targets and sheet layout.',
    '<p class="answer">A 4 × 6 cm photo is <strong>40 × 60 mm</strong>, about <strong>1.575 × 2.362 inches</strong> — much smaller than a 4 × 6 <em>inch</em> print. Vietnam’s passport rules and Thailand’s visa pages ask for 4 × 6 cm. In Photo Print, enter 40 × 60 mm, crop to fill and print at 100%.</p>'
    + caution +
    '<h2>Do not confuse centimetres and inches</h2><p>“4 × 6” on a photo shop menu almost always means 4 × 6 inches (10 × 15 cm). A passport photo of that size would be rejected. Always enter 40 and 60 with the unit set to millimetres.</p>'
    '<h2>What the official guidance says</h2><p>Vietnam’s passport photo rules (Ministry of Public Security Circular 31/2023) call for 4 × 6 cm on a white background, explained by provincial police such as <a href="https://congan.thainguyen.gov.vn/tin-tuc/chuyen-doi-so/huong-dan-quy-chuan-anh-khi-lam-ho-chieu-1478.html">Thái Nguyên Police</a>. Thailand’s Ministry of Foreign Affairs lists 4 × 6 cm photos for visa applications on its <a href="https://www.mfa.go.th/en/publicservice/5d5bcc2615e39c306000a316">visa page</a>.</p>'
    + steps(40, 60) +
    '<h2>What resolution do I need?</h2><p>At 300 pixels per inch, aim for at least <strong>473 × 709 pixels</strong> after cropping.</p>'
    '<h2>How many fit on a 4 × 6 inch sheet?</h2><p>Four: two 40 mm columns (80 mm) across the 101.6 mm side and two 60 mm rows (120 mm) down the long side, with room for cut lines.</p>'
    + related))

p = ROOT / 'guides.html'
s = p.read_text()
marker = '<h2>Paper, quality &amp; printer settings</h2>'
assert marker in s
cards = ''.join(f'<div class="card"><h2><a href="{g["url"].removeprefix(BASE)}">{esc(g["headline"])}</a></h2><p>{esc(g["description"])}</p></div>' for g in guides)
if 'print-35x50-mm-photos-malaysia.html' not in s:
    s = s.replace(marker, '<h2>Country ID photo sizes</h2>' + cards + marker, 1)
m = re.search(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)
d = json.loads(m[1]); have = {g['url'] for g in d.get('hasPart', [])}
d['hasPart'] = d.get('hasPart', []) + [g for g in guides if g['url'] not in have]
s = s[:m.start(1)] + json.dumps(d, ensure_ascii=False) + s[m.end(1):]
p.write_text(s)
print('\n'.join(g['url'] for g in guides))
