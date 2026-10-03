# Photo Print acquisition playbook

Updated 2026-10-03. Goal: increase qualified downloads and proceeds, judged by App Store Connect and RevenueCat, with no website or in-app analytics SDK.

## Facts to preserve

- Official app: Photo Print: Size & Layout, App Store ID 6808903369, by Mohamed Elatabany.
- iPhone/iPad, iOS/iPadOS 17+. Exact physical photo sizes in in/cm/mm; A4, Letter, 4×6 paper; AirPrint and PDF.
- Free download: first completed output, three saved layouts. Pro: one-time purchase, unlimited output/layouts and saved page setups. Regional prices change; show current price in app instead of hard-coding a global amount.
- Photos are processed locally. Apple/RevenueCat handle purchases and Settings may query Apple's catalogue for other apps. Keep policy source in the app repo synchronized through tools/build_site.py.
- The app does not validate official passport/visa/ID requirements. Never claim acceptance, government approval, automatic background removal, online printing services or Android support.
- No fabricated reviews, ratings, endorsements, rankings or urgency. Product facts must match code/live listing. Software offer price 0 is the download price, not an assertion that Pro is free.

## Search and AI discovery

Use static readable HTML, a direct answer near the beginning, descriptive title/description, one H1, real examples, internal links and accurate JSON-LD. Important content is available without JavaScript. FAQ markup must match the visible answers; do not promise FAQ/HowTo rich results. Authors must be real. Link official authorities only after checking current guidance for the actual application; do not infer ID eligibility from size alone.

OAI-SearchBot handles ChatGPT search; GPTBot controls possible training use separately. Allow crawling, but never promise inclusion or recommendations. llms.txt is an optional navigation aid, not a ranking mechanism or supported submission method.

The official domain serves robots.txt at /robots.txt. All site content is crawlable, including by OAI-SearchBot. DNS records are DNS-only; no Cloudflare proxy challenge is placed in front of crawlers.

Sources checked 2026-10-03:
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.openai.com/api/docs/bots

## Domain decision and migration

Official domain: https://usephotoprint.com/, registered by owner on 2026-10-03 through Cloudflare ($10.46 for one year; auto-renew enabled). photoprint.com and photoprint.app were already registered.

Completed:
- GitHub Pages verified domain ownership before connection. Four DNS-only A records (185.199.108.153 through 185.199.111.153) and www CNAME to atabany.github.io.
- Custom domain set, all metadata/canonicals/sitemap/robots/llms/validator/privacy generator migrated.
- Initial DNS cache delay resolved. HTTPS provisioning needed one restart using GitHub's documented remove/re-add recovery step. Certificate approved; HTTPS enforcement enabled; ordinary HTTPS returns 200, HTTP and www redirect to canonical HTTPS, legacy Pages guide URLs redirect to matching paths.
- Google Search Console Domain property verified by TXT. Sitemap submitted; initial processing says "Couldn't fetch" immediately after certificate issuance. Public sitemap returns HTTPS 200 application/xml; Google may still have cached pre-registration DNS. Recheck/resubmit after propagation. This is not a successful indexation claim.
- App Legal URLs and Settings website/guides buttons implemented; simulator build/run passed. App Store marketing/support AND privacy URL edits rejected with 409 state errors on live 1.4.0; change in next editable release. Existing URLs redirect correctly.

Bing manual site addition was attempted on 2026-10-03, but rejected with "you have sent too many requests to us recently". No further retries during this session; retry after rate limit clears. Google homepage live test passed (URL available to Google, page can be indexed) and indexing request was accepted into the priority crawl queue. Two guide inspections remain a follow-up; all eleven guide/site pages return HTTPS 200. No ranking or recommendation guarantees.

## Measure results

Baseline dated 2026-10-01: 78 first-time downloads, 28 ChatGPT app referrals, ~6.5–7.3% download-to-paid. Source: app repo docs/kb/growth.md. US base Pro changed to $7.99 on 2026-10-02 with selected emerging-market prices preserved. Do not attribute every later sales change to the website.

Before campaign claims: create website campaign links in App Store Connect and replace badge links with the resulting valid provider token (pt) plus campaign tag (ct). Current ct/mt links are prepared labels only; they are NOT verified campaign attribution. Never invent pt or promise per-page conversion reports without it.

Weekly review: Search Console impressions/clicks/query/position, Bing discovery, App Store web/app referrals and first-time downloads, RevenueCat proceeds/refunds/conversion. Judge experiments over comparable windows, noting the pricing change and small samples. No automatic recurring job is scheduled by this task.

## Content queue

Prioritize genuinely different questions; avoid near-duplicate country doorway pages:
1. 35×45 mm prints: exact units, head-guide workflow, printable area.
2. Wallet photo sheet for a frame: real page preview and trim workflow.
3. Printing a true-size PDF at a print shop: settings and ruler verification.
4. Photo resolution and print quality: practical pixel examples checked against app math.
5. AirPrint paper/margin troubleshooting: real printer behaviour and test sheet after its feature ships.

Research current official documentation where needed, write one useful guide, link from the guide index and relevant pages, update matching JSON-LD/llms/sitemap, run python3 _ops/validate.py, visually inspect desktop/mobile, publish and verify HTTP responses. Add translations only after a language review and valid hreflang/canonicals; avoid publishing unreviewed bulk translations.

## Growth expansion — 2026-10-03

Published five distinct practical guides: 35×45 mm, wallet photos, printing PDFs at actual size,
print resolution/PPI and AirPrint troubleshooting. Added a local-only size/pixel calculator
with server-rendered conversion chart, worked examples and links into the app. Eleven guides
and seventeen indexable pages; custom 404 recovery page is noindex and excluded from sitemap.
Guides have table-of-contents anchors, breadcrumbs, real author links, correction/support links,
related reading and matching BreadcrumbList data. Shared social preview metadata added.
Claude-SearchBot and Claude-User explicitly allowed alongside OpenAI bots; wildcards already
allowed them. Permission to crawl does not prove an actual visit or recommendation.

Google sitemap changed to Success with 11 discovered pages before this expansion. Homepage
live test and indexing request passed earlier. Expanded sitemap is published for discovery;
indexing and rankings still require time. Bing registration was rate-limited, retry later.

Sources checked: Apple AirPrint https://support.apple.com/en-us/109349 ; Adobe Actual size
https://helpx.adobe.com/acrobat/desktop/print-documents/set-up-and-print-pdfs/page-size.html ;
Anthropic crawler roles https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler .
Resolution labels checked against PhotoPrint/Domain/PrintQuality.swift. Pixel examples are
calculated from exact inches/mm and rounded up, after crop. No ID acceptance claims.

Validation: calculator 35×45 mm at 300 PPI → 414×532 pixels; 4×6 in at 200 PPI →
800×1200 pixels; negative values blocked. Desktop/mobile inspected with no horizontal overflow.
Run `_ops/build_guides.py`, then `_ops/enrich_site.py`, then `_ops/validate.py` when rebuilding.
Original six guides remain hand-authored; the generator preserves their directory entries.
