#!/usr/bin/env python3
"""Keep the App Store rating on the site current and identical everywhere.

  python3 _ops/update_rating.py           # read every storefront from Apple, save _ops/rating.json, apply
  python3 _ops/update_rating.py --apply   # apply the saved _ops/rating.json only (after a page rebuild)

Apple keeps ratings per storefront, so the count is the sum over all storefronts and the average is
weighted by count. Below MIN_COUNT ratings nothing is shown. Places it fills:
  - <!--app-rating-->…<!--/app-rating--> after every App Store CTA row (inserted on first run),
  - the About page facts row, the home page MobileApplication aggregateRating, the llms.txt fact line.
"""
from pathlib import Path
from datetime import date
import json, re, sys, time, urllib.request

ROOT = Path(__file__).resolve().parents[1]
APP_ID = '6808903369'
MIN_COUNT = 5
DATA = ROOT / '_ops/rating.json'
STOREFRONTS = ('ae ag ai al am ao ar at au az ba bb be bf bg bh bj bm bn bo br bs bt bw by bz ca cg ch ci cl cm cn co cr '
               'cv cy cz de dk dm do dz ec ee eg es fi fj fm fr ga gb gd gh gm gr gt gw gy hk hn hr hu id ie il in iq is '
               'it jm jo jp ke kg kh kn kr kw ky kz la lb lc lk lr lt lu lv ly ma md me mg mk ml mn mo mr ms mt mu mv mw '
               'mx my mz na ne ng ni nl no np nz om pa pe pg ph pk pl pt pw py qa ro rs ru rw sa sb sc se sg si sk sl sn '
               'sr st sv sz tc td th tj tm tn tr tt tw tz ua ug us uy uz vc ve vg vn xk ye za zm zw').split()
MONTHS = 'January February March April May June July August September October November December'.split()


def fetch():
    found, failed = {}, []
    for code in STOREFRONTS:
        for _ in range(3):
            try:
                with urllib.request.urlopen(f'https://itunes.apple.com/lookup?id={APP_ID}&country={code}', timeout=10) as r:
                    result = (json.load(r).get('results') or [{}])[0]
                if result.get('userRatingCount'):
                    found[code] = {'count': result['userRatingCount'], 'average': result['averageUserRating']}
                break
            except Exception:
                time.sleep(3)
        else:
            failed.append(code)
        time.sleep(0.4)
    if failed:
        raise SystemExit(f'lookup failed for {failed}; nothing changed (a partial count would understate the rating)')
    count = sum(v['count'] for v in found.values())
    average = sum(v['count'] * v['average'] for v in found.values()) / count if count else 0
    return {'count': count, 'average': round(average, 2), 'checked': date.today().isoformat(), 'storefronts': found}


def render(data):
    if data['count'] < MIN_COUNT:
        return '', '', None
    avg = f"{data['average']:.1f}"
    stars = '★' * round(data['average']) + '☆' * (5 - round(data['average']))
    y, m, d = data['checked'].split('-')
    checked = f'{int(d)} {MONTHS[int(m) - 1]} {y}'
    line = (f'<p class="app-rating"><span class="stars" aria-hidden="true">{stars}</span> <strong>{avg}</strong> '
            f"on the App Store · rated by {data['count']} users worldwide</p>")
    fact = f"{avg} average from {data['count']} ratings worldwide (checked {checked})"
    schema = {'@type': 'AggregateRating', 'ratingValue': avg, 'ratingCount': data['count'], 'bestRating': '5', 'worstRating': '1'}
    return line, fact, schema


PLAY_BADGE = re.compile(r'\s*<a class="store store-play" [^>]*>.*?</a>', re.S)


def after_badges(s, pos):
    """Where the rating line belongs after an App Store badge: past the Google Play badge beside it."""
    m = PLAY_BADGE.match(s, pos)
    return m.end() if m else pos


def apply(data):
    line, fact, schema = render(data)
    block = f'<!--app-rating-->{line}<!--/app-rating-->'
    for page in sorted(ROOT.glob('*.html')):
        s = original = page.read_text()
        # First run: a marker after every CTA row that holds an App Store badge.
        def mark(m):
            tail = s[m.end():m.end() + 20]
            return m.group(0) if tail.startswith('<!--app-rating-->') else m.group(0) + block
        s = re.sub(r'<div class="cta-row">.*?</div>', mark, s, flags=re.S)
        if page.name != 'index.html':
            # Guides whose call to action is a bare badge link, outside a CTA row.
            def mark_link(m):
                before = s[:m.start()]
                in_row = before.rfind('<div class="cta-row">') > before.rfind('</div>')
                if in_row or s.startswith('<!--app-rating-->', m.end()):
                    return m.group(0)
                return m.group(0) + block
            # The App Store badge together with the Google Play badge beside it.
            s = re.sub(r'<a class="store" [^>]*>.*?</a>(?:\s*<a class="store store-play" [^>]*>.*?</a>)?', mark_link, s, flags=re.S)
        if page.name == 'index.html':
            # The final call to action: right after its badge link, once.
            m = re.search(r'<section class="final-cta">.*?<a class="store" [^>]*>.*?</a>', s, flags=re.S)
            end = after_badges(s, m.end()) if m else 0
            if m and not s.startswith('<!--app-rating-->', end):
                s = s[:end] + block + s[end:]
        s = re.sub(r'<!--app-rating-->.*?<!--/app-rating-->', lambda m: block, s, flags=re.S)
        if page.name == 'about.html':
            row = f'<tr><th scope="row">App Store rating</th><td><!--app-rating-fact-->{fact}<!--/app-rating-fact--></td></tr>'
            if '<!--app-rating-fact-->' in s:
                s = re.sub(r'<!--app-rating-fact-->.*?<!--/app-rating-fact-->', f'<!--app-rating-fact-->{fact}<!--/app-rating-fact-->', s)
            elif fact:
                s = s.replace('<tr><th scope="row">Photo processing</th>', row + '<tr><th scope="row">Photo processing</th>', 1)
            if not fact:
                s = re.sub(r'<tr><th scope="row">App Store rating</th>.*?</tr>', '', s)
        if page.name == 'index.html':
            def patch(m):
                graph = json.loads(m.group(1))
                for node in graph.get('@graph', [graph]):
                    if node.get('@type') == 'MobileApplication':
                        if schema: node['aggregateRating'] = schema
                        else: node.pop('aggregateRating', None)
                return '<script type="application/ld+json">' + json.dumps(graph, ensure_ascii=False) + '</script>'
            s = re.sub(r'<script type="application/ld\+json">(\{"@context": "https://schema.org", "@graph".*?)</script>', patch, s, count=1, flags=re.S)
        if s != original:
            page.write_text(s)
            print('updated', page.name)
    llms = ROOT / 'llms.txt'
    text = llms.read_text()
    text = re.sub(r'^- App Store rating: .*\n', '', text, flags=re.M)
    if fact:
        text = text.replace('## Product facts\n', f'## Product facts\n- App Store rating: {fact}.\n', 1)
    llms.write_text(text)


if __name__ == '__main__':
    if '--apply' in sys.argv:
        data = json.loads(DATA.read_text())
    else:
        data = fetch()
        DATA.write_text(json.dumps(data, indent=1) + '\n')
        print(f"{data['count']} ratings, average {data['average']}, from {sorted(data['storefronts'])}")
    apply(data)
