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
if errors:
 print('\n'.join(errors));raise SystemExit(1)
print(f'PASS: {len(pages)} pages; links, anchors, local assets, canonical URLs, descriptions, JSON-LD, sitemap and llms.txt')
