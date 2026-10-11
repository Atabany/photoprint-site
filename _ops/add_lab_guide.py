"""2026-10-11: the photo-lab guide (Photo Print 1.5+ saves a true-size 4 × 6 photo) and the
country guides switched from custom-size steps to the built-in ID sizes added in 1.5.
Run _ops/appstore_campaign.py afterwards (enrich_site.py renames an anchor in the test-sheet guide)."""
from pathlib import Path
import re, json, html
ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://usephotoprint.com/'
DATE = '2026-10-11'
esc = html.escape
import importlib.util
spec = importlib.util.spec_from_file_location("acg", ROOT / "_ops/add_country_guides.py")

template = (ROOT / 'print-35x45-mm-photos-iphone.html').read_text()
header = re.search(r'<header.*?</header>', template, re.S).group()
footer = re.search(r'<footer.*?</footer>', template, re.S).group()

def page(slug, title, description, body):
    url = BASE + slug + '.html'
    data = {'@context': 'https://schema.org', '@type': 'Article', 'headline': title, 'name': title,
            'description': description, 'url': url, 'datePublished': DATE, 'dateModified': DATE,
            'author': {'@type': 'Person', 'name': 'Mohamed Elatabany', 'url': BASE + 'about.html'},
            'mainEntityOfPage': url}
    crumbs = {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Photo Print', 'item': BASE},
        {'@type': 'ListItem', 'position': 2, 'name': 'Printing guides', 'item': BASE + 'guides.html'},
        {'@type': 'ListItem', 'position': 3, 'name': title, 'item': url}]}
    headings = [(re.sub(r'[^a-z0-9]+', '-', html.unescape(re.sub('<[^>]+>', '', h)).lower()).strip('-'), html.unescape(re.sub('<[^>]+>', '', h)))
                for h in re.findall(r'<h2>(.*?)</h2>', body)]
    for ident, label in headings:
        body = body.replace(f'<h2>{esc(label)}</h2>', f'<h2 id="{ident}">{esc(label)}</h2>', 1).replace(f'<h2>{label}</h2>', f'<h2 id="{ident}">{label}</h2>', 1)
    toc = '<nav class="article-toc" aria-label="In this guide"><strong>In this guide</strong><ul>' + ''.join(
        f'<li><a href="#{i}">{esc(t)}</a></li>' for i, t in headings) + '</ul></nav>'
    first = body.find('<h2')
    body = body[:first] + toc + body[first:]
    cta = ('<p class="article-end">Written by <a href="about.html">Mohamed Elatabany</a>, developer of Photo Print. App instructions are based on Photo Print; lab and printer behaviour varies. <a href="support.html">Send a correction or ask for help</a>.</p>'
           '<aside class="guide-cta"><h2>Make the sheet on your iPhone.</h2><p>Photo Print has exact sizes, sheet previews, AirPrint, PDF and photo-lab images. Your first completed output is included; Pro is a one-time purchase.</p>'
           f'<a class="store" href="https://apps.apple.com/app/id6808903369?ct=guide-photo-lab&amp;mt=8" aria-label="Download Photo Print on the App Store"><img src="assets/app-store-badge.svg" width="168" height="56" alt="Download on the App Store"></a></aside>')
    out = (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           f'<title>{esc(title)}</title><meta name="description" content="{esc(description, quote=True)}"><link rel="canonical" href="{url}">'
           f'<meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:type" content="article">'
           f'<meta property="og:title" content="{esc(title, quote=True)}"><meta property="og:description" content="{esc(description, quote=True)}">'
           f'<meta property="og:url" content="{url}"><meta name="apple-itunes-app" content="app-id=6808903369">'
           f'<link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><link rel="apple-touch-icon" href="assets/app-icon.png">'
           f'<link rel="stylesheet" href="assets/style.css?v=20261005"><script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>'
           f'<meta property="og:image" content="{BASE}assets/print-studio-poster.webp"><meta property="og:image:alt" content="Photo Print artwork showing photo sizes, sheets and printing">'
           f'<meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">{json.dumps(crumbs, ensure_ascii=False)}</script></head><body>'
           f'<a class="skip" href="#main">Skip to content</a><div class="wrap">{header}<main id="main"><nav class="breadcrumbs" aria-label="Breadcrumb">'
           f'<a href="index.html">Photo Print</a><span aria-hidden="true">/</span><a href="guides.html">Printing guides</a></nav><h1>{esc(title)}</h1>'
           f'<p class="updated">By <a href="about.html">Mohamed Elatabany</a> · Updated 11 October 2026</p>{body}{cta}</main>{footer}</div></body></html>')
    (ROOT / (slug + '.html')).write_text(out)
    return {'@type': 'Article', 'headline': title, 'url': url, 'description': description}

lab = page('print-passport-photos-photo-lab', 'Print passport photos at a photo lab — no printer needed',
  'No printer? Make a sheet of passport or ID photos on iPhone, save it as a true-size 4 × 6 photo and order it from a store kiosk or online lab. Settings that keep the size exact.',
  '<p class="answer">Make the sheet in Photo Print, save it as a <strong>4 × 6 inch (10 × 15 cm) photo</strong> — 1200 × 1800 pixels at 300 pixels per inch — and order an ordinary 4 × 6 print at a store photo kiosk or online lab. Ask for <strong>no border</strong> and turn off <strong>auto-crop</strong> and <strong>auto-fix</strong>, then cut along the guides.</p>'
  '<div class="card"><strong>Size is only one requirement.</strong><p>Check the issuing authority’s current rules for the portrait itself — background, expression, lighting and age of the photo. Photo Print prints the exact size you choose; it does not check a photo against any government’s requirements, and some offices take the photo themselves.</p></div>'
  '<h2>Why a 4 × 6 photo</h2><p>4 × 6 inches (10 × 15 cm) is the standard print size at almost every photo lab and store kiosk. Photo Print lays your passport or ID photos out on exactly that sheet, so when the lab prints it at 4 × 6 without cropping, every photo comes out at its true size.</p>'
  '<h2>Make the sheet</h2><ol><li>On the Home screen, tap <strong>ID photos</strong> and choose your size, for example 2 × 2 in or 35 × 45 mm.</li>'
  '<li>Pick your portrait. Photo Print fills a 4 × 6 sheet with copies and cut guides.</li>'
  '<li>Open the photo to place the head between the guide’s outlines. You can set the background to white or light grey.</li>'
  '<li>On the <strong>Export</strong> tab, use <strong>No printer? Use a photo lab</strong> to save the sheet as a photo. Save it to Photos, or share it straight to a lab’s app or website.</li></ol>'
  '<h2>Settings to ask for at the lab</h2><div class="table-wrap"><table><caption>So the photos keep their size</caption><thead><tr><th scope="col">Setting</th><th scope="col">Choose</th><th scope="col">Why</th></tr></thead><tbody>'
  '<tr><th scope="row">Print size</th><td>4 × 6 in (10 × 15 cm)</td><td>The sheet is made for exactly this size.</td></tr>'
  '<tr><th scope="row">Border</th><td>None (full bleed)</td><td>A white border shrinks the whole picture to fit inside it.</td></tr>'
  '<tr><th scope="row">Crop / fit</th><td>Off, or “print entire image”</td><td>Auto-crop can trim the edges and enlarge everything slightly.</td></tr>'
  '<tr><th scope="row">Auto-fix / enhance</th><td>Off</td><td>Colour and brightness changes can make a portrait look unnatural.</td></tr>'
  '<tr><th scope="row">Finish</th><td>As your application asks (often matte or glossy photo paper)</td><td>Some offices state a finish.</td></tr></tbody></table></div>'
  '<h2>Check the first print</h2><p>Measure one photo with a ruler before cutting: a 2 × 2 in photo is 50.8 mm on each side, a 35 × 45 mm photo is exactly that. If it is smaller, the lab fitted or bordered the image — ask them to print it again at 4 × 6 without a border or cropping.</p>'
  '<h2>How many photos per print</h2><p>A 4 × 6 sheet holds six 2 × 2 in or six 35 × 45 mm photos, four 50 × 60 mm photos, or nine 30 × 40 mm photos, with cut guides between them. One inexpensive 4 × 6 print usually covers an application with copies to spare.</p>'
  '<p><a href="print-passport-photos-at-home.html">Printing at home instead? Passport photos on your own printer</a></p>'
  '<h2>Next steps</h2><ul><li><a href="print-2x2-photos-iphone.html">Print 2 × 2 inch photos from iPhone</a></li><li><a href="print-35x45-mm-photos-iphone.html">Print 35 × 45 mm photos from iPhone</a></li><li><a href="guides.html">Browse all printing guides</a></li></ul>')

# Country guides: built-in sizes since Photo Print 1.5.
STEPS = '''<h2 id="make-the-sheet">Make the sheet</h2><ol><li>On the Home screen, tap <strong>ID photos</strong> and choose <strong>{size}</strong> ({label}).</li><li>Pick your portrait. Photo Print fills a sheet with copies and cut guides — {fit} on 4 × 6 paper.</li><li>Open the photo to place the head between the guide’s outlines. You can set the background to white or light grey.</li><li>Print with AirPrint, or save a PDF and print it at <strong>Actual size / 100%</strong>. No printer? On the Export tab, <a href="print-passport-photos-photo-lab.html">save a 4 × 6 photo for a photo lab</a>.</li><li>Measure one photo with a ruler before trimming.</li></ol>'''
for slug, size, label, fit in [('print-35x50-mm-photos-malaysia', '35 × 50 mm', 'Malaysia', 'six'),
                               ('print-50x60-mm-biometric-photos-turkiye', '50 × 60 mm', 'Türkiye', 'four'),
                               ('print-4x6-cm-photos-vietnam-thailand', '40 × 60 mm', 'Vietnam', 'four')]:
    p = ROOT / f'{slug}.html'
    s = p.read_text()
    s, n = re.subn(r'<h2 id="make-the-sheet">Make the sheet</h2><ol>.*?</ol>', STEPS.format(size=size, label=label, fit=fit), s, count=1, flags=re.S)
    assert n == 1, slug
    s = s.replace('Updated 10 October 2026', 'Updated 11 October 2026').replace('"dateModified": "2026-10-10"', '"dateModified": "2026-10-11"')
    p.write_text(s)

# Guide index: the lab guide first among the printing tasks.
p = ROOT / 'guides.html'
s = p.read_text()
card = f'<div class="card"><h2><a href="print-passport-photos-photo-lab.html">{esc(lab["headline"])}</a></h2><p>{esc(lab["description"])}</p></div>'
if 'print-passport-photos-photo-lab.html' not in s:
    s = s.replace('<h2>Choose a printing task</h2>', '<h2>Choose a printing task</h2>' + card, 1)
    m = re.search(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)
    d = json.loads(m[1]); d['hasPart'] = d.get('hasPart', []) + [lab]
    s = s[:m.start(1)] + json.dumps(d, ensure_ascii=False) + s[m.end(1):]
    p.write_text(s)

# Sitemap and llms.txt.
p = ROOT / 'sitemap.xml'; s = p.read_text()
for slug in ['print-35x50-mm-photos-malaysia', 'print-50x60-mm-biometric-photos-turkiye', 'print-4x6-cm-photos-vietnam-thailand', 'guides']:
    s = re.sub(r'(<loc>' + re.escape(BASE + slug) + r'\.html</loc>\s*<lastmod>)[^<]+', r'\g<1>' + DATE, s)
if 'print-passport-photos-photo-lab.html' not in s:
    s = s.replace('</urlset>', f'  <url>\n    <loc>{BASE}print-passport-photos-photo-lab.html</loc>\n    <lastmod>{DATE}</lastmod>\n  </url>\n</urlset>')
p.write_text(s)
p = ROOT / 'llms.txt'; s = p.read_text()
if 'print-passport-photos-photo-lab.html' not in s:
    s = s.replace('## Printing guides and tools\n', f'## Printing guides and tools\n- [{lab["headline"]}]({lab["url"]})\n', 1)
p.write_text(s)
print('ok')
