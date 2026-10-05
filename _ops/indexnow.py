#!/usr/bin/env python3
"""Notify participating search engines of changed public URLs after deployment.

Usage: python3 _ops/indexnow.py https://usephotoprint.com/changed-page.html
An accepted notification does not confirm indexing or ranking.
"""
import json
from pathlib import Path
import ssl
import sys
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
from urllib.error import HTTPError

HOST = 'usephotoprint.com'
ROOT = Path(__file__).resolve().parent.parent
key = (ROOT / '_ops/indexnow-key.txt').read_text().strip()
urls = list(dict.fromkeys(sys.argv[1:]))
if not urls or len(urls) > 10000:
    sys.exit('Supply 1–10,000 changed public URLs after publishing.')
for url in urls:
    parts = urlsplit(url)
    if parts.scheme != 'https' or parts.netloc != HOST or parts.query or parts.fragment:
        sys.exit('Only canonical HTTPS URLs without query strings or fragments are accepted.')
if (ROOT / f'{key}.txt').read_text().strip() != key:
    sys.exit('Published key file and submission key differ.')
context = ssl.create_default_context(cafile='/etc/ssl/cert.pem') if Path('/etc/ssl/cert.pem').exists() else ssl.create_default_context()
location = f'https://{HOST}/{key}.txt'
with urlopen(location, context=context, timeout=30) as response:
    if response.read().decode().strip() != key:
        sys.exit('Live key file does not match; wait for deployment before submitting.')
payload = json.dumps({'host': HOST, 'key': key, 'keyLocation': location, 'urlList': urls}).encode()
request = Request('https://api.indexnow.org/indexnow', data=payload, headers={'Content-Type': 'application/json; charset=utf-8'}, method='POST')
try:
    with urlopen(request, context=context, timeout=30) as response:
        print(f'IndexNow HTTP {response.status}: {len(urls)} URLs received. This does not confirm indexing.')
except HTTPError as error:
    sys.exit(f'IndexNow HTTP {error.code}; no automatic retries. Check the protocol and retry later if rate-limited.')
