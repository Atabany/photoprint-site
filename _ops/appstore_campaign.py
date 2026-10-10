"""Apply the provider token generated in the owner's App Store Connect campaign tool."""
from pathlib import Path
from urllib.parse import urlsplit,parse_qs,urlencode
import html,re
ROOT=Path(__file__).resolve().parents[1]
PROVIDER='127826363'  # Generated for Photo Print in App Store Connect, 2026-10-03.
TAGS={'print-printer-test-sheet':'guide-printer-test','photo-size-calculator':'tool-size','photo-print-resolution-ppi':'guide-quality','airprint-photo-printing-troubleshooting':'guide-airprint','print-35x45-mm-photos-iphone':'guide-35x45','print-wallet-photos-iphone':'guide-wallet','print-photo-pdf-actual-size':'guide-pdf','print-passport-photos-at-home':'guide-passport','print-4x6-photo-exact-size-iphone':'guide-4x6','print-multiple-photos-on-one-page':'guide-layouts','photo-printed-wrong-size':'guide-scaling','print-1x1-id-photos-iphone':'guide-1x1','print-2x2-photos-iphone':'guide-2x2','guides':'guide-index','about':'page-about','support':'page-support','privacy':'page-privacy','index':'website-home','404':'page-404','print-35x50-mm-photos-malaysia':'guide-malaysia','print-50x60-mm-biometric-photos-turkiye':'guide-turkiye','print-4x6-cm-photos-vietnam-thailand':'guide-vietnam'}
for p in ROOT.glob('*.html'):
 def link(m):
  raw=html.unescape(m[1]);u=urlsplit(raw)
  if u.hostname!='apps.apple.com' or '6808903369' not in u.path:return m[0]
  old=parse_qs(u.query).get('ct',[''])[0]
  tag=old if old.startswith('website-') and len(old)<=30 else TAGS[p.stem]
  assert len(tag)<=30
  url='https://apps.apple.com/app/apple-store/id6808903369?'+urlencode({'pt':PROVIDER,'ct':tag,'mt':'8'})
  return 'href="'+html.escape(url,quote=True)+'"'
 s=re.sub(r'href="([^"]+)"',link,p.read_text());p.write_text(s)
