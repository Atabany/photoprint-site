#!/usr/bin/env python3
"""Check discoverability, internal links, assets and structured data before publishing."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
BASE='https://usephotoprint.com/'
errors=[]
class Page(HTMLParser):
 def __init__(self):
  super().__init__();self.ids=set();self.links=[];self.assets=[];self.h1=0;self.canonical=[];self.description=[];self.title='';self.in_title=False;self.in_json=False;self.buffer='';self.data=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):
   if a['id'] in self.ids:errors.append(f'duplicate HTML id: {a["id"]}')
   self.ids.add(a['id'])
  if tag=='a' and a.get('href'):self.links.append(a['href'])
  if tag in ['img','script','source'] and a.get('src'):self.assets.append(a['src'])
  if tag=='video' and a.get('poster'):self.assets.append(a['poster'])
  if tag=='link' and a.get('rel') in ['stylesheet','icon','apple-touch-icon']:self.assets.append(a.get('href',''))
  if tag=='h1':self.h1+=1
  if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href'))
  if tag=='meta' and a.get('name')=='description':self.description.append(a.get('content',''))
  if tag=='title':self.in_title=True
  if tag=='script' and a.get('type')=='application/ld+json':self.in_json=True;self.buffer=''
 def handle_data(self,data):
  if self.in_title:self.title+=data
  if self.in_json:self.buffer+=data
 def handle_endtag(self,tag):
  if tag=='title':self.in_title=False
  if tag=='script' and self.in_json:
   self.data.append(json.loads(self.buffer));self.in_json=False
pages={}
for p in ROOT.glob('*.html'):
 q=Page()
 try:q.feed(p.read_text())
 except Exception as e:errors.append(f'{p.name}: parse error {e}')
 pages[p.name]=q
 if 'pending Apple review' in p.read_text() and '1.4.1' in p.read_text():errors.append(f'{p.name}: printer check 1.4.1 is released; remove outdated pending-review copy')
titles=[q.title for q in pages.values()]
if len(set(titles))!=len(titles):errors.append('duplicate page titles')
for name,q in pages.items():
 def require(condition,message):
  if not condition:errors.append(f'{name}: {message}')
 require(q.h1==1,'needs exactly one H1')
 require(bool(q.title),'missing title')
 require(len(q.description)==1 and bool(q.description[0]),'missing/duplicate description')
 expected=BASE+('' if name=='index.html' else name)
 require(q.canonical==[expected],f'canonical must be {expected}')
 require(bool(q.data),'missing JSON-LD')
 for raw in q.links+q.assets:
  u=urlsplit(raw)
  if u.scheme or u.netloc:continue
  target=unquote(u.path).lstrip('/') or name
  p=ROOT/target
  require(p.exists(),f'missing local target {raw}')
  if u.fragment and target in pages:require(unquote(u.fragment) in pages[target].ids,f'missing anchor {raw}')
 for raw in q.assets: require(not urlsplit(raw).netloc,'assets must be self-hosted')
 urls={x.text for x in ET.parse(ROOT/'sitemap.xml').getroot().iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
 if name!='404.html':require(expected in urls,'missing sitemap entry')
for url in urls:
 path=url.removeprefix(BASE) or 'index.html'
 if path not in pages:errors.append(f'sitemap points to missing page: {url}')
if len(urls)!=len(pages)-('404.html' in pages):errors.append('sitemap and page counts differ')
for url in re.findall(r'\]\((https://[^)]+)\)',(ROOT/'llms.txt').read_text()):
 if url.startswith(BASE) and (url.removeprefix(BASE) or 'index.html') not in pages:errors.append(f'llms.txt missing page {url}')
# Search crawlers must be able to access the guide directory.
from urllib.robotparser import RobotFileParser
policy=RobotFileParser();policy.parse((ROOT/'robots.txt').read_text().splitlines())
for bot in ['Googlebot','bingbot','OAI-SearchBot','Claude-SearchBot','Claude-User']:
 if not policy.can_fetch(bot,BASE+'guides.html'):errors.append(f'robots blocks {bot}')
# Download links require the real account token and an Apple-supported campaign label.
from urllib.parse import parse_qs
for name,q in pages.items():
 for raw in q.links:
  u=urlsplit(raw)
  if u.hostname=='apps.apple.com' and '6808903369' in u.path:
   params=parse_qs(u.query)
   if params.get('pt')!=['127826363'] or not 0<len(params.get('ct',[''])[0])<=30:
    errors.append(f'{name}: invalid App Store campaign link')
# The App Store rating is written by _ops/update_rating.py and must be the same everywhere.
rating_file=ROOT/'_ops/rating.json'
if rating_file.exists():
 rating=json.loads(rating_file.read_text())
 blocks={b for f in ROOT.glob('*.html') for b in re.findall(r'<!--app-rating-->(.*?)<!--/app-rating-->',f.read_text(),re.S)}
 if len(blocks)>1:errors.append('App Store rating differs between pages; run python3 _ops/update_rating.py --apply')
 if rating['count']>=5 and f"rated by {rating['count']} users" not in ''.join(blocks):errors.append('App Store rating does not match _ops/rating.json')
 for f in ROOT.glob('*.html'):
  t=f.read_text()
  if 'class="store"' in t and '<!--app-rating-->' not in t:errors.append(f'{f.name}: App Store badge without the rating line; run python3 _ops/update_rating.py --apply')
  if t.count('<!--app-rating-->')!=len(re.findall(r'<a class="store" href="https://apps',t)) and f.name!='index.html':errors.append(f'{f.name}: one rating line per App Store badge expected')
# Owner rule (2026-11-26): every visitor sees both store badges; data-os may order them, never hide one.
css=(ROOT/'assets/style.css').read_text()
def hides_a_badge(sel):
 # A selector under html[data-os=…] whose last part is a store badge or a bare link. Desktop's header badges are the one
 # exception: both are hidden together, and the "Get the app" popover shows both instead.
 sel=' '.join(sel.split())
 if not re.search(r'html\[data-os=["\']?[a-z]+["\']?\]',sel) or sel=='html[data-os=desktop] .get-app>.nav-store':return False
 last=re.split(r'\s*[\s>+~]\s*',sel.strip())[-1]
 return bool(re.search(r'\.(store|nav-store|store-play)(?![\w-])|:not\(\.store-play\)',last) or re.match(r'a(?![\w-])',last))
if any(hides_a_badge(sel) for sels,body in re.findall(r'([^{}]+)\{([^{}]*)\}',css) if re.search(r'display:\s*none|visibility:\s*hidden',body) for sel in sels.split(',')):errors.append('assets/style.css: a store badge is hidden by device (data-os); every visitor sees both')
# Store links for every device (_ops/get_app.py): the OS flag, the script, the header group, a Google Play badge
# beside every App Store badge, and the QR code for computers.
for f in ROOT.glob('*.html'):
 t=f.read_text();fix='; run python3 _ops/get_app.py'
 if "setAttribute('data-os'" not in t:errors.append(f'{f.name}: no data-os flag in <head>'+fix)
 if 'assets/get-app.js' not in t:errors.append(f'{f.name}: assets/get-app.js not loaded'+fix)
 if 'class="get-app"' not in t:errors.append(f'{f.name}: header has no store group'+fix)
 if len(re.findall(r'<a class="store" href="https://apps',t))!=len(re.findall(r'<a class="store store-play" href="https://play\.google\.com/',t)):errors.append(f'{f.name}: every App Store badge needs its Google Play badge'+fix)
 if '<aside class="guide-cta">' in t and 'class="qr-card"' not in t:errors.append(f'{f.name}: call to action without the QR card'+fix)
 if 'for iPhone &amp; iPad.' in t:errors.append(f'{f.name}: footer still says iPhone & iPad only'+fix)
get=ROOT/'get/index.html'
if not get.exists():errors.append('get/index.html (the QR codes open it) is missing')
else:
 for a in re.findall(r'(?:src|href)="(/assets/[^"?]+)',get.read_text()):
  if not (ROOT/a.lstrip('/')).exists():errors.append(f'get/index.html: missing {a}')
for spot in ['nav','home','page']:
 if not (ROOT/f'assets/qr-{spot}.svg').exists():errors.append(f'assets/qr-{spot}.svg missing')
if errors:
 print('\n'.join(errors));raise SystemExit(1)
print(f'PASS: {len(pages)} pages; links, anchors, local assets, canonical URLs, descriptions, JSON-LD, sitemap and llms.txt')
