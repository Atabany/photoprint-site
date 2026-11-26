#!/usr/bin/env python3
"""Store links for every device, on every page. Safe to run again: it changes only what is missing.

- <head>: sets <html data-os="ios|android|desktop"> before the first paint (CSS shows the right badge) and loads
  assets/get-app.js (the phone download bar and the desktop QR popover).
- Header: the App Store badge leaves the menu for a `.get-app` group: App Store, Google Play and, on a computer,
  a "Get the app" button that opens a QR code.
- Every App Store badge gets a Google Play badge beside it, with the same campaign name.
- Calls to action at the end of guides and tools, and the home hero and final call to action, get a
  "Scan to download" QR card that only computers show.
- Footer: iPhone, iPad and Android.

Run it after any generator in _ops/ that writes pages (build_guides.py, add_*.py, build_comparison.py,
build_tools.mjs) and after the app repo's tools/build_site.py writes privacy.html. validate.py checks the result.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CSS_VERSION = '2026112605'
JS_VERSION = '2026112604'
PLAY = 'https://play.google.com/store/apps/details?id=com.atabany.photoprint&amp;utm_source=usephotoprint&amp;utm_campaign='
APPLE = 'https://apps.apple.com/app/apple-store/id6808903369?pt=127826363&amp;ct={ct}&amp;mt=8'
OS_SCRIPT = ('<script>(function(d,n){var u=n.userAgent,o=/iPhone|iPad|iPod/.test(u)||(/Macintosh/.test(u)&&n.maxTouchPoints>1)'
             "?'ios':/Android/.test(u)?'android':'desktop';d.documentElement.setAttribute('data-os',o)})(document,navigator)</script>")
QR_ALT = 'QR code that opens Photo Print in your phone’s app store'


def play_badge(ct, prefix, nav=False):
    if nav:
        return (f'<a class="nav-store store-play" href="{PLAY}{ct}" aria-label="Get Photo Print on Google Play">'
                f'<img src="{prefix}assets/google-play-badge.svg" width="135" height="40" alt="Get it on Google Play"></a>')
    return (f'<a class="store store-play" href="{PLAY}{ct}" aria-label="Get Photo Print on Google Play">'
            f'<img src="{prefix}assets/google-play-badge.svg" width="189" height="56" alt="Get it on Google Play"></a>')


def qr_card(spot, prefix):
    return (f'<div class="qr-card"><img src="{prefix}assets/qr-{spot}.svg" width="112" height="112" alt="{QR_ALT}">'
            '<p><strong>Scan to download</strong>Point your phone’s camera here. It opens the App Store on iPhone '
            'or Google Play on Android.</p></div>')


def get_app_group(ct, prefix):
    apple = (f'<a class="nav-store" href="{APPLE.format(ct=ct)}" aria-label="Download Photo Print on the App Store">'
             f'<img src="{prefix}assets/app-store-badge.svg" width="120" height="40" alt="Download on the App Store"></a>')
    pop = (f'<details class="qr-pop"><summary>Get the app</summary><div class="qr-pop-panel">'
           f'<img src="{prefix}assets/qr-nav.svg" width="160" height="160" alt="{QR_ALT}">'
           '<p><strong>Scan with your phone’s camera</strong>It opens the App Store on iPhone or Google Play on Android.</p>'
           f'<div class="qr-pop-badges"><a href="{APPLE.format(ct=ct + "-pop")}" aria-label="Download Photo Print on the App Store">'
           f'<img src="{prefix}assets/app-store-badge.svg" width="120" height="40" alt="Download on the App Store"></a>'
           f'<a href="{PLAY}{ct}-pop" aria-label="Get Photo Print on Google Play">'
           f'<img src="{prefix}assets/google-play-badge.svg" width="135" height="40" alt="Get it on Google Play"></a></div></div></details>')
    return f'<div class="get-app">{apple}{play_badge(ct, prefix, nav=True)}{pop}</div>'


def update(page):
    s = original = page.read_text()
    prefix = '/' if 'href="/assets/style.css' in s else ''

    # <head>
    # The flag script is replaced whole, so a change to OS_SCRIPT reaches every page.
    s = re.sub(r"<script>\(function\(d,n\)\{.*?setAttribute\('data-os',o\)\}\)\(document,navigator\)</script>", lambda m: OS_SCRIPT, s)
    if "setAttribute('data-os'" not in s:
        s, n = re.subn(r'<meta name="viewport"[^>]*>', lambda m: m.group(0) + OS_SCRIPT, s, count=1)
        if not n:
            raise SystemExit(f'{page.name}: no viewport meta to put the data-os flag after')
    s = re.sub(r'(assets/style\.css)(\?v=\d+)?"', rf'\1?v={CSS_VERSION}"', s)
    if 'assets/get-app.js' not in s:
        s = s.replace('</head>', f'<script src="{prefix}assets/get-app.js?v={JS_VERSION}" defer></script></head>', 1)
    s = re.sub(r'(assets/get-app\.js)\?v=\d+', rf'\1?v={JS_VERSION}', s)

    # Header: the badge leaves the menu for the .get-app group.
    m = re.search(r'<a class="nav-store" href="https://apps\.apple\.com/[^"]*ct=([a-z0-9-]+)[^"]*"[^>]*><img[^>]*></a></nav>', s)
    if m and 'class="get-app"' not in s:
        s = s[:m.start()] + '</nav>' + get_app_group(m.group(1), prefix) + s[m.end():]

    # Play badges written by hand before this script (the home page) take the shared class first.
    s = s.replace('<a class="store" href="https://play.google.com/', '<a class="store store-play" href="https://play.google.com/')
    # The comparison page's badge link also holds the app icon (build_comparison.py): make it the standard badge.
    s = re.sub(r'<a class="store" (href="https://apps\.apple\.com/[^"]*")><img src="assets/app-icon\.png"[^>]*>'
               r'<img src="assets/app-store-badge\.svg"[^>]*></a>',
               r'<a class="store" \1 aria-label="Download Photo Print on the App Store"><img src="assets/app-store-badge.svg" '
               r'width="168" height="56" alt="Download on the App Store"></a>', s)
    # A Google Play badge after every App Store badge in the page.
    def add_play(m):
        after = s[m.end():m.end() + 60]
        if after.lstrip().startswith('<a class="store store-play"'):
            return m.group(0)
        return m.group(0) + ' ' + play_badge(m.group(1), prefix)
    s = re.sub(r'<a class="store" href="https://apps\.apple\.com/[^"]*ct=([a-z0-9-]+)[^"]*"[^>]*><img[^>]*></a>', add_play, s)

    # QR cards for computers.
    if 'class="qr-card"' not in s:
        def aside(m):
            body = m.group(0)
            return body if 'class="store"' not in body else body.replace('</aside>', qr_card('page', prefix) + '</aside>')
        s = re.sub(r'<aside class="guide-cta">.*?</aside>', aside, s, flags=re.S)
        if page.name == 'index.html':
            # Hero and final call to action: after the rating line (update_rating.py expects the rating
            # right after the badges).
            s = re.sub(r'(<section class="hero">.*?<!--/app-rating-->)',
                       lambda m: m.group(1) + qr_card('home', prefix), s, count=1, flags=re.S)
            s = re.sub(r'(<section class="final-cta">.*?<!--/app-rating-->)',
                       lambda m: m.group(1) + qr_card('home', prefix), s, count=1, flags=re.S)

    s = s.replace('Made by Mohamed Elatabany for iPhone &amp; iPad.', 'Made by Mohamed Elatabany for iPhone, iPad &amp; Android.')
    if s != original:
        page.write_text(s)
        return True
    return False


if __name__ == '__main__':
    changed = [p.name for p in sorted(ROOT.glob('*.html')) if update(p)]
    print(f'{len(changed)} pages updated' + (': ' + ', '.join(changed) if changed else ''))
