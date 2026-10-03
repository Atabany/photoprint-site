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

Important: the project is currently on a GitHub Pages subpath. robots.txt at /photoprint-site/robots.txt is NOT the origin-wide crawler policy; robots are read from https://atabany.github.io/robots.txt (404 when checked). The missing origin policy does not block crawling. After the custom-domain move, our file will be at /robots.txt and become effective.

Sources checked 2026-10-03:
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.openai.com/api/docs/bots

## Domain decision and migration

Chosen: usephotoprint.com. Verisign RDAP returned 404 on 2026-10-03; this is not a registrar reservation or price quote. photoprint.com, photoprint.app, getphotoprint.com and photoprintstudio.com were registered. Do not buy an aftermarket domain based on keywords alone; get a verified quote first.

Pending domain registration/payment by the owner. Do not add CNAME, switch canonical URLs, or publish DNS instructions as completed before ownership and DNS are confirmed.

After registration:
1. Verify the domain in GitHub Pages settings; add verification TXT and the Pages DNS records shown there. Add the custom domain/CNAME, then confirm HTTPS issuance and enforce HTTPS.
2. Update canonical/og URLs, JSON-LD IDs/URLs, sitemap, robots sitemap, llms.txt, validator BASE and app privacy-generator base. Keep guide filenames. Confirm old Pages URLs redirect permanently to matching new paths.
3. Verify a Google Search Console Domain property with DNS, submit /sitemap.xml and inspect the home page plus two guides. Add/import to Bing Webmaster Tools and submit the sitemap. Record actual status; do not call a submitted or inaccessible sitemap successfully indexed.
4. Update app Legal URLs and App Store marketing/support/privacy URLs when the listing allows edits; keep the existing URLs redirecting.

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
