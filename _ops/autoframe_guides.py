"""2026-10-11: mention Auto-frame (Photo Print 1.6), the four 1.5 ID sizes, backgrounds and the
photo-lab option in the ID-photo guides — visible steps and their HowTo JSON-LD alike."""
from pathlib import Path
import re, json, html
ROOT = Path(__file__).resolve().parents[1]
DATE = '2026-10-11'
AF = ("From version 1.6, Photo Print frames the face for you: it finds the face on your iPhone and sizes and "
      "centres the head for the size’s head guide. Check it, and move or zoom if you need to.")

def edit_jsonld(s, fn):
    def sub(m):
        d = json.loads(m.group(1))
        d = fn(d)
        if isinstance(d, dict) and 'dateModified' in d: d['dateModified'] = DATE
        return m.group(0).replace(m.group(1), json.dumps(d, ensure_ascii=False))
    return re.sub(r'<script type="application/ld\+json">(.*?)</script>', sub, s, flags=re.S)

def touch(s):
    s = re.sub(r'Updated \d{1,2} (September|October) 2026', 'Updated 11 October 2026', s, count=1)
    return edit_jsonld(s, lambda d: d)

def rep(s, a, b, name):
    assert a in s, (name, a[:70]); return s.replace(a, b, 1)

changes = {}

# Passport guide: steps 2, 4 and 7, in the page and in its HowTo data.
name = 'print-passport-photos-at-home.html'; s = (ROOT / name).read_text()
old_sizes = '2 × 2 in, 1 × 1 in, 35 × 45 mm, 33 × 48 mm or 50 × 70 mm'
new_sizes = '2 × 2 in, 1 × 1 in, 35 × 45 mm, 33 × 48 mm, 35 × 50 mm, 40 × 60 mm, 50 × 60 mm, 50 × 70 mm or 30 × 40 mm'
s = s.replace(old_sizes, new_sizes)
old4 = 'Open the crop editor, then move and zoom the photo so your face is centred. The head-size guide shows where the head sits in the frame; compare it with your country'
new4 = AF + ' The head-size guide shows where the head sits in the frame; compare it with your country'
s = s.replace(old4, new4)
s = s.replace('compare it with your country’s head-size rule, which the app does not check for you.',
              'compare it with your country’s head-size rule, which the app does not check for you. You can also set the background to white or light grey.')
s = s.replace('compare it with your country&rsquo;s head-size rule, which the app does not check for you.',
              'compare it with your country&rsquo;s head-size rule, which the app does not check for you. You can also set the background to white or light grey.')
s = s.replace('<strong>Adjust the crop.</strong>', '<strong>Check the framing.</strong>').replace('"name": "Adjust the crop."', '"name": "Check the framing."')
s = rep(s, 'never “Fit to page”.</li>', 'never “Fit to page”. No printer? <a href="print-passport-photos-photo-lab.html">Save a 4 × 6 photo for a photo lab</a>.</li>', name) if 'never “Fit to page”.</li>' in s else s
s = s.replace('never &ldquo;Fit to page&rdquo;.</li>', 'never &ldquo;Fit to page&rdquo;. No printer? <a href="print-passport-photos-photo-lab.html">Save a 4 × 6 photo for a photo lab</a>.</li>')
s = s.replace('never “Fit to page”."', 'never “Fit to page”. No printer? Save a 4 × 6 photo for a photo lab from the Export tab."')
assert AF in s and new_sizes in s and 'print-passport-photos-photo-lab.html' in s, name
changes[name] = touch(s)

# 2 × 2, 35 × 45 and 1 × 1 guides: one sentence after the crop step.
for name, a in [('print-2x2-photos-iphone.html', 'Use Fill and adjust the crop if you need the portrait to cover the square.'),
                ('print-35x45-mm-photos-iphone.html', 'The head-size guide is a positioning aid; verify it against your application’s rules.'),
                ('print-1x1-id-photos-iphone.html', 'Adjust the crop so the required parts of the portrait are visible.')]:
    s = (ROOT / name).read_text()
    s = rep(s, a + '</li>', a + ' ' + AF + '</li>', name)
    changes[name] = touch(s)

# Country guides and the lab guide.
old = 'Open the photo to place the head between the guide’s outlines. You can set the background to white or light grey.'
new = AF + ' The head goes between the guide’s outlines. You can set the background to white or light grey.'
for name in ['print-35x50-mm-photos-malaysia.html', 'print-50x60-mm-biometric-photos-turkiye.html',
             'print-4x6-cm-photos-vietnam-thailand.html', 'print-passport-photos-photo-lab.html']:
    s = (ROOT / name).read_text()
    changes[name] = touch(rep(s, old, new, name))

for name, s in changes.items():
    (ROOT / name).write_text(s)

p = ROOT / 'sitemap.xml'; s = p.read_text()
for name in changes:
    s = re.sub(r'(<loc>https://usephotoprint\.com/' + re.escape(name) + r'</loc>\s*<lastmod>)[^<]+', r'\g<1>' + DATE, s)
p.write_text(s)
print('\n'.join(changes))
