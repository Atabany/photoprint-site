"""Apply shared discoverability metadata and navigation without changing product claims."""
from pathlib import Path
import re,json,html,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
BASE='https://usephotoprint.com/'
GUIDES=[p for p in ROOT.glob('*.html') if p.name.startswith('print-') or p.name in ['photo-printed-wrong-size.html','photo-print-resolution-ppi.html','airprint-photo-printing-troubleshooting.html']]
for p in ROOT.glob('*.html'):
 s=p.read_text();title=html.unescape(re.search(r'<title>(.*?)</title>',s,re.S)[1]);url=BASE+('' if p.name=='index.html' else p.name)
 # A descriptive shared preview, self-hosted and based on the app's onboarding artwork.
 if 'property="og:image"' not in s:
  s=s.replace('</head>','<meta property="og:image" content="'+BASE+'assets/print-studio-poster.webp"><meta property="og:image:alt" content="Photo Print artwork showing photo sizes, sheets and printing"><meta name="twitter:card" content="summary_large_image"></head>')
 s=s.replace('assets/style.css?v=20261003"','assets/style.css?v=20261003b"')
 if p in GUIDES:
  if 'aria-label="Breadcrumb"' not in s:
   s=s.replace('<main id="main">','<main id="main"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Photo Print</a><span aria-hidden="true">/</span><a href="guides.html">Printing guides</a></nav>')
  headings=[]
  def heading(m):
   label=html.unescape(re.sub('<[^>]+>','',m[1]));identifier=re.sub(r'[^a-z0-9]+','-',label.lower()).strip('-')
   headings.append((identifier,label));return '<h2 id="'+identifier+'">'+m[1]+'</h2>'
  s=re.sub(r'<h2(?: id="[^"]*")?>(.*?)</h2>',heading,s)
  # Keep the contents focused on article sections, excluding the download card.
  if 'class="article-toc"' not in s:
   toc='<nav class="article-toc" aria-label="In this guide"><strong>In this guide</strong><ul>'+''.join('<li><a href="#'+i+'">'+html.escape(t)+'</a></li>' for i,t in headings[:-1])+'</ul></nav>'
   first=s.find('<h2');s=s[:first]+toc+s[first:]
  if 'class="article-end"' not in s:
   s=s.replace('<aside class="guide-cta">','<p class="article-end">Written by <a href="about.html">Mohamed Elatabany</a>, developer of Photo Print. App instructions are based on Photo Print; printer behaviour varies. <a href="support.html">Send a correction or ask for help</a>.</p><aside class="guide-cta">')
  if p.name in ['print-35x45-mm-photos-iphone.html','print-passport-photos-at-home.html'] and 'class="guide-screenshot"' not in s:
   figure='<figure class="guide-screenshot"><img src="assets/passport-sheet.webp" width="660" height="1434" loading="lazy" alt="Photo Print app preview of repeated ID portraits on a photo sheet"><figcaption>Actual app screen with a fictional demo portrait.</figcaption></figure>'
   s=s.replace('<nav class="article-toc"',figure+'<nav class="article-toc"')
  # Consistent entity references complement the article's own factual content.
  extra={'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Photo Print','item':BASE},{'@type':'ListItem','position':2,'name':'Printing guides','item':BASE+'guides.html'},{'@type':'ListItem','position':3,'name':title,'item':url}]}
  if '"BreadcrumbList"' not in s:s=s.replace('</head>','<script type="application/ld+json">'+json.dumps(extra)+'</script></head>')
 p.write_text(s)
# Link the practical tool from the main landing page as well as the guide directory.
p=ROOT/'index.html';s=p.read_text()
if 'href="photo-size-calculator.html"' not in s:
 s=s.replace('<h2>Get the first sheet right.</h2>','<h2>Get the first sheet right.</h2><p><a href="photo-size-calculator.html">Check dimensions and print pixels with the photo size calculator →</a></p>')
p.write_text(s)
# Existing guides point to the new useful next steps rather than becoming isolated pages.
links={'print-passport-photos-at-home.html':['print-35x45-mm-photos-iphone','photo-size-calculator'], 'print-2x2-photos-iphone.html':['photo-print-resolution-ppi','print-photo-pdf-actual-size'],'photo-printed-wrong-size.html':['airprint-photo-printing-troubleshooting','print-photo-pdf-actual-size'],'print-multiple-photos-on-one-page.html':['print-wallet-photos-iphone','photo-size-calculator'],'print-4x6-photo-exact-size-iphone.html':['print-wallet-photos-iphone','airprint-photo-printing-troubleshooting'],'print-1x1-id-photos-iphone.html':['photo-size-calculator','photo-print-resolution-ppi']}
for name,slugs in links.items():
 p=ROOT/name;s=p.read_text()
 if 'class="more-guides"' not in s:
  links_html='<nav class="more-guides" aria-label="More printing help"><ul>'+''.join('<li><a href="'+slug+'.html">'+html.unescape(re.search('<title>(.*?)</title>',(ROOT/(slug+'.html')).read_text())[1])+'</a></li>' for slug in slugs)+'</ul></nav>'
  s=s.replace('<aside class="guide-cta">',links_html+'<aside class="guide-cta">');p.write_text(s)
# Preserve previously recorded substantive modification dates on metadata-only rebuilds.
ns='http://www.sitemaps.org/schemas/sitemap/0.9';ET.register_namespace('',ns)
existing_dates={u.find('{'+ns+'}loc').text:u.findtext('{'+ns+'}lastmod') for u in ET.parse(ROOT/'sitemap.xml').getroot()}
root=ET.Element('{'+ns+'}urlset')
for p in sorted(ROOT.glob('*.html')):
 if p.name=='404.html':continue
 u=ET.SubElement(root,'{'+ns+'}url');ET.SubElement(u,'{'+ns+'}loc').text=BASE+('' if p.name=='index.html' else p.name);ET.SubElement(u,'{'+ns+'}lastmod').text=existing_dates.get(BASE+('' if p.name=='index.html' else p.name),'2026-10-05')
ET.indent(root,space='  ');ET.ElementTree(root).write(ROOT/'sitemap.xml',encoding='UTF-8',xml_declaration=True)
# Human-readable guide titles in the optional navigation file.
llms_path=ROOT/'llms.txt';s=llms_path.read_text().split('## Printing guides')[0]+'## Printing guides and tools\n'
for p in sorted(GUIDES+[ROOT/'photo-size-calculator.html']):
 title=html.unescape(re.search(r'<title>(.*?)</title>',p.read_text(),re.S)[1]);s+='- ['+title+']('+BASE+p.name+')\n'
llms_path.write_text(s)
p=ROOT/'robots.txt';s=p.read_text()
for bot in ['Claude-SearchBot','Claude-User']:
 if bot not in s:s=s.replace('Sitemap:',f'User-agent: {bot}\nAllow: /\n\nSitemap:')
p.write_text(s)

# Campaign parameters are reapplied after regenerating static pages.
import subprocess,sys
subprocess.run([sys.executable,str(ROOT/"_ops/appstore_campaign.py")],check=True)
