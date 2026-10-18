"""Render the reviewed printing-workflow comparison without rebuilding older guides."""
from pathlib import Path
import html
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SLUG = 'photo-printing-apps-iphone'
TITLE = 'iPhone Photo Printing Apps: Compare Four Workflows'
DESCRIPTION = 'Compare Apple Photos and AirPrint, Photo Print, Canon PRINT and Epson Smart Panel by task, printer compatibility, exact sizing and sheet layout.'
BASE = 'https://usephotoprint.com/'
URL = BASE + SLUG + '.html'
source = (ROOT / 'print-2x2-photos-iphone.html').read_text()
body = (ROOT / '_ops' / (SLUG + '.fragment')).read_text()
head = source.split('</head>')[0]
head = re.sub(r'<title>.*?</title>', '<title>' + TITLE + '</title>', head, flags=re.S)
head = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="' + DESCRIPTION + '">', head)
head = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="' + URL + '">', head)
for key, value in [('og:title', TITLE), ('og:description', DESCRIPTION), ('og:url', URL)]:
    head = re.sub(r'(<meta property="' + key + r'" content=")[^"]*', lambda m: m[1] + html.escape(value, quote=True), head)
head = re.sub(r'<script type="application/ld\+json">.*?</script>', '', head, flags=re.S)
faqs = re.findall(r'<details><summary>(.*?)</summary><p>(.*?)</p></details>', body)
schemas = [
    {'@context': 'https://schema.org', '@type': 'Article', 'headline': TITLE, 'url': URL, 'description': DESCRIPTION, 'datePublished': '2026-10-18', 'dateModified': '2026-10-18', 'author': {'@type': 'Person', 'name': 'Mohamed Elatabany', 'url': BASE + 'about.html'}, 'mainEntityOfPage': URL},
    {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faqs]},
    {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': n + 1, 'name': name, 'item': url} for n, (name, url) in enumerate([('Photo Print', BASE), ('Printing guides', BASE + 'guides.html'), (TITLE, URL)])]}
]
head += '<script type="application/ld+json">' + json.dumps(schemas, ensure_ascii=False) + '</script></head>'
header = re.search(r'<header.*?</header>', source, re.S)[0].replace('ct=website-nav', 'ct=compare-print-workflows')
footer = re.search(r'<footer.*?</footer>', source, re.S)[0]
cta = '<aside class="guide-cta"><h2>Prepare a measured photo sheet.</h2><p>Photo Print for iPhone and iPad: exact sizes, sheet previews, AirPrint, PDF and photo-lab JPEG output.</p><a class="store" href="https://apps.apple.com/app/apple-store/id6808903369?pt=127826363&amp;ct=compare-print-workflows&amp;mt=8"><img src="assets/app-icon.png" width="48" height="48" alt="Photo Print app icon"><img src="assets/app-store-badge.svg" width="120" height="40" alt="Download on the App Store"></a></aside>'
out = head + '<body><a class="skip" href="#main">Skip to content</a><div class="wrap">' + header + '<main id="main"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Photo Print</a> / <a href="guides.html">Printing guides</a></nav><h1>' + TITLE + '</h1><p class="updated">By <a href="about.html">Mohamed Elatabany</a> · Updated 18 October 2026</p>' + body + cta + '</main>' + footer + '</div></body></html>'
(ROOT / (SLUG + '.html')).write_text(out)
# Add links without replacing existing page content or modification dates.
for name in ['index.html', 'guides.html', 'print-4x6-photo-exact-size-iphone.html']:
    p = ROOT / name
    text = p.read_text()
    if 'href="' + SLUG + '.html"' not in text:
        text = text.replace('</main>', '<div class="card"><h2><a href="' + SLUG + '.html">Compare iPhone photo printing workflows</a></h2><p>Choose between a quick AirPrint photo, a measured sheet and your printer maker’s app.</p></div></main>')
        p.write_text(text)
ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
ET.register_namespace('', ns)
tree = ET.parse(ROOT / 'sitemap.xml')
dates = {BASE, BASE + 'guides.html', BASE + 'print-4x6-photo-exact-size-iphone.html', URL}
if URL not in [x.text for x in tree.getroot().iter('{' + ns + '}loc')]:
    node = ET.SubElement(tree.getroot(), '{' + ns + '}url')
    ET.SubElement(node, '{' + ns + '}loc').text = URL
for node in tree.getroot():
    if node.findtext('{' + ns + '}loc') in dates:
        lastmod = node.find('{' + ns + '}lastmod')
        if lastmod is None:
            lastmod = ET.SubElement(node, '{' + ns + '}lastmod')
        lastmod.text = '2026-10-18'
ET.indent(tree, space='  ')
tree.write(ROOT / 'sitemap.xml', encoding='utf-8', xml_declaration=True)
print('Rendered printing comparison; run enrich_site.py and validate.py next.')
