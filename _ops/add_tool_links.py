#!/usr/bin/env python3
"""Wire the tool pages into the hand-authored pages. Idempotent: run it again after edits."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
GENERATED={'tools.html','photos-per-page-calculator.html','photo-print-quality-checker.html','photo-crop-calculator.html'}
CSS='assets/style.css?v=20261115'
SHEET='<li><a href="photos-per-page-calculator.html">Photos per page calculator: how many fit on a sheet</a></li>'
QUALITY='<li><a href="photo-print-quality-checker.html">Print quality checker: is your photo sharp enough?</a></li>'
CROP='<li><a href="photo-crop-calculator.html">Crop calculator: what each print size cuts off</a></li>'
# Page -> links added at the top of its related list.
RELATED={
 'print-multiple-photos-on-one-page.html':[SHEET],
 'print-wallet-photos-iphone.html':[SHEET],
 'print-2x2-photos-iphone.html':[SHEET,CROP],
 'print-1x1-id-photos-iphone.html':[SHEET],
 'print-35x45-mm-photos-iphone.html':[SHEET,CROP],
 'print-35x50-mm-photos-malaysia.html':[SHEET],
 'print-4x6-cm-photos-vietnam-thailand.html':[SHEET],
 'print-50x60-mm-biometric-photos-turkiye.html':[SHEET],
 'print-passport-photos-at-home.html':[SHEET],
 'print-passport-photos-photo-lab.html':[SHEET],
 'print-4x6-photo-exact-size-iphone.html':[CROP,QUALITY],
 'photo-print-resolution-ppi.html':[QUALITY,CROP],
 'photo-printed-wrong-size.html':[SHEET],
 'photo-size-calculator.html':[SHEET,QUALITY,CROP],
}
for p in sorted(ROOT.glob('*.html')):
 if p.name in GENERATED:continue
 s=o=p.read_text()
 s=s.replace('<a href="guides.html">Printing guides</a><a href="support.html">Support</a>','<a href="guides.html">Printing guides</a><a href="tools.html">Tools</a><a href="support.html">Support</a>')
 s=s.replace('<nav aria-label="Footer"><a href="guides.html">Guides</a><a href="privacy.html">','<nav aria-label="Footer"><a href="guides.html">Guides</a><a href="tools.html">Tools</a><a href="privacy.html">')
 s=re.sub(r'assets/style\.css\?v=\d+',CSS,s)
 for link in reversed(RELATED.get(p.name,[])):
  if link in s:continue
  m=re.search(r'<h2 id="(related-guides|related-printing-guides|next-steps|more-printing-help)">[^<]*</h2>\s*<ul>',s)
  if not m:raise SystemExit(f'{p.name}: no related list')
  s=s[:m.end()]+'\n'+link+s[m.end():]
 if s!=o:p.write_text(s);print('updated',p.name)
# The size calculator now lives under Tools.
p=ROOT/'photo-size-calculator.html';s=o=p.read_text()
s=s.replace('<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Photo Print</a><span aria-hidden="true">/</span><a href="guides.html">Printing guides</a></nav>','<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Photo Print</a><span aria-hidden="true">/</span><a href="tools.html">Tools</a></nav>')
s=s.replace('{"@type": "ListItem", "position": 2, "name": "Printing guides", "item": "https://usephotoprint.com/guides.html"}','{"@type": "ListItem", "position": 2, "name": "Tools", "item": "https://usephotoprint.com/tools.html"}')
if s!=o:p.write_text(s);print('breadcrumb',p.name)
# Guide directory: a tools card first.
p=ROOT/'guides.html';s=o=p.read_text()
card='<div class="card"><p class="eyebrow">Free tools</p><h2><a href="tools.html">Photo printing tools</a></h2><p>Count photos per sheet, check print quality and PPI, preview crops and convert sizes, all in your browser.</p></div>'
if card not in s:s=s.replace('<div class="card"><p class="eyebrow">Start with your measurements</p>',card+'<div class="card"><p class="eyebrow">Start with your measurements</p>',1)
if s!=o:p.write_text(s);print('tools card',p.name)
# Home page: the notebook section links the tools.
p=ROOT/'index.html';s=o=p.read_text()
old='<p><a href="photo-size-calculator.html">Check dimensions and print pixels with the photo size calculator →</a></p>'
new='<p>Free tools: <a href="photos-per-page-calculator.html">photos per page</a>, <a href="photo-print-quality-checker.html">print quality checker</a>, <a href="photo-crop-calculator.html">crop calculator</a> and <a href="photo-size-calculator.html">size calculator</a>. <a href="tools.html">All tools →</a></p>'
s=s.replace(old,new)
if s!=o:p.write_text(s);print('home',p.name)
