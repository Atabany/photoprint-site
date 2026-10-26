# Photo Print acquisition playbook

Updated 2026-10-03. Goal: increase qualified downloads and proceeds, judged by App Store Connect and RevenueCat, with no website or in-app analytics SDK.

## Facts to preserve

- Official app: Photo Print: Size & Layout, App Store ID 6808903369, by Mohamed Elatabany.
- iPhone/iPad, iOS/iPadOS 17+. Exact physical photo sizes in in/cm/mm; A4, Letter, 4×6 paper; AirPrint and PDF.
- Free download: first completed output, three saved layouts. Pro: one-time purchase, unlimited output/layouts and saved page setups. Regional prices change; show current price in app instead of hard-coding a global amount.
- Photos are processed locally. Apple/RevenueCat handle purchases and Settings may query Apple's catalogue for other apps. Keep policy source in the app repo synchronized through tools/build_site.py.
- The app does not validate official passport/visa/ID requirements. Never claim acceptance, government approval, unreleased background features, online printing services or Android support.
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

Bing manual site addition was attempted on 2026-10-03, but rejected with "you have sent too many requests to us recently". No further retries during this session; retry after rate limit clears. Google homepage live test passed (URL available to Google, page can be indexed) and indexing request was accepted into the priority crawl queue. Priority indexing requests accepted for the 35×45 mm and true-size PDF guides; all eleven guide/site pages return HTTPS 200. No ranking or recommendation guarantees.

## Measure results

Baseline dated 2026-10-01: 78 first-time downloads, 28 ChatGPT app referrals, ~6.5–7.3% download-to-paid. Source: app repo docs/kb/growth.md. US base Pro changed to $7.99 on 2026-10-02 with selected emerging-market prices preserved. Do not attribute every later sales change to the website.

Official App Store provider token and per-page campaign tags are now configured (see expansion record). Campaign results require Apple’s thresholds and processing time; do not equate absent reports with zero traffic.

Weekly review: Search Console impressions/clicks/query/position, Bing discovery, App Store web/app referrals and first-time downloads, RevenueCat proceeds/refunds/conversion. Judge experiments over comparable windows, noting the pricing change and small samples. Weekly growth heartbeat is active; see the dated expansion record below.

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

Official campaign provider token **127826363** was generated in App Store Connect for
Photo Print on 2026-10-03 (website-home link). Download links now use this real pt token,
mt=8 and descriptive ct tags under 30 characters. `_ops/appstore_campaign.py` reapplies
them after guide rebuilding. Identity/schema URLs remain plain App Store URLs. Apple
requires at least five first-time downloads from distinct Apple Accounts for campaign
reporting and may delay report availability; blank reports do not mean zero clicks.
Source: https://developer.apple.com/help/app-store-connect/view-app-analytics/manage-campaigns/

Weekly thread heartbeat `photo-print-website-growth` is active (Mondays at 10:00 local time).
It checks health/discovery, pending Bing setup, available aggregate metrics and prioritizes
useful improvements using evidence; it stays quiet on unchanged/non-actionable states.
No paid advertising, outreach, app release or new agreement is authorized by that heartbeat.

Final checks: expanded sitemap accepted and reports **Success, 17 discovered pages**. All 17
indexable URLs return HTTPS 200. Simulated OpenAI/Claude search/user-agent requests return
200 (not proof of real crawler visits). Nested missing URL returns proper 404 and recovery
links. Bing retry remains rate-limited. Campaign reports currently have insufficient data.

Google accepted a priority indexing request for the new size calculator. This is a crawl
queue request, not confirmation that it is indexed or ranked.

The about page now has a visible official product-facts table and links to existing app
artwork/screens, with AboutPage/Person entity metadata. No reviews or endorsements invented.

Google accepted priority indexing requests for the calculator, 35×45 mm guide and true-size
PDF guide. Actual indexing/ranking is still pending.

GitHub Actions now runs static site validation on pushes and pull requests, with read-only
permissions and a pinned official checkout action. It checks metadata, links, anchors,
assets, sitemap coverage, duplicate IDs/titles, search crawler access and campaign tags.

## 2026-10-05 — printer-check release website update

Existing domain and GitHub Pages hosting retained. Added a homepage feature section, real 1.4.1 screenshot, and `print-printer-test-sheet.html` with free app-generated PDFs for A4, US Letter and 4 × 6 paper. Linked from support, wrong-size, AirPrint and actual-size PDF guides, the guide directory, sitemap and llms.txt. In-app feature explicitly marked pending Apple review; website downloads are available immediately. No paid offers, ratings or compliance claims added.

Validation: 19 HTML pages pass links, anchors, assets, canonical/description/JSON-LD, sitemap and campaign checks. All PDFs contain one page at the correct physical paper size: 210 × 297 mm, 8.5 × 11 in and 4 × 6 in. Mobile downloads and desktop homepage inspected in the browser. New guide retained by the optional rebuild scripts; sitemap dates now survive metadata-only rebuilds.

After 1.4.1 is released, replace the pending-review copy on the homepage, guide, support, three troubleshooting guides and llms.txt with available-now wording. Preserve the free downloads and guide URL.

## 2026-10-05 — weekly growth review and ruler helper

HTTPS 200 verified for home, key guides, robots, sitemap and llms.txt. Google sitemap is Success, last read October 5 with 18 discovered pages. Performance report (September 30–October 3, last update 4.5 hours ago) shows 0 clicks, 0 impressions and no query rows; no ranking claim. Printer-test guide was unknown to Google; priority indexing request accepted this review. App Store campaigns remain below reporting threshold and October 2–3 data is delayed. Preserve October 1 acquisition baseline; no measurable website-attributed sales yet.

Public US listing still 1.4.0, 0 ratings; no rating/review claims added. ASC confirms 1.4.1 Waiting for Review. All six pending 1.4.1 locales already use official custom-domain marketing/support URLs. Leave pending-review website wording in place.

Chosen support improvement: printer test sheet measurements are actionable, but readers previously had to calculate shrinking/enlargement themselves. Added a local-only ruler scale helper to the existing guide, with static formula/example, same-unit instructions, horizontal/vertical checks, accessible status, positive-value validation and explicit measurement limits. It recommends correcting print settings, not distorting photo dimensions. Adobe Actual size guidance rechecked: https://helpx.adobe.com/acrobat/desktop/print-documents/set-up-and-print-pdfs/page-size.html . Browser checks: 100→96 = 96% / 4% smaller; 100→104 = 104% / 4% larger; 100→100 exact length without precision guarantee; zero rejected. Mobile 390px has no horizontal overflow; desktop inspected. Static validator passes 19 HTML pages.

Bing manual site addition now reaches XML verification (earlier rate limit cleared). Published BingSiteAuth.xml obtained from the authenticated dashboard; verify after deployment. Added IndexNow root key file and `_ops/indexnow.py` with host validation and live-key verification before submission. Run `python3 _ops/indexnow.py <changed canonical URL>...` after Pages deploys, not before; submit changed URLs only and no automatic retry loops. Reference: https://www.indexnow.org/documentation . HTTP 200 means received, 202 means key validation pending; neither confirms indexing/ranking.

Verified deployment: website validation and Pages Actions both succeeded for commit `1cd5938`. Live helper works over HTTPS. Bing XML ownership verification completed; custom-domain dashboard is accessible, sitemap submitted October 5 and currently Processing (1 known sitemap, no errors/warnings). Earlier Bing rate-limit blocker is resolved. IndexNow returned HTTP 202 for seven changed pages (printer guide, home, support, directory and three related troubleshooting guides): received, key validation pending. Do not repeatedly resubmit unchanged pages to chase 200.

Aggregate reporting checked: ASC Jul 4–Oct 1 view shows 82 first-time downloads, 9 redownloads, 1.11K impressions, 122 product-page views, $29 proceeds, 7 IAPs; day-1 download-to-paid 7.69%, day-7 7.04%. This is a different window from the October 1 ~30-day baseline. RevenueCat production overview Sep 7–Oct 5: $61 revenue, 144 new customers, 149 active customers. RevenueCat customers are not first-time downloads; revenue is not ASC proceeds. Different windows/definitions and October 2 pricing prevent attribution to the new site. Next review: Bing sitemap/IndexNow validation, Google indexing and actual query rows, campaign reports after Apple catches up, 1.4.1 release wording only after verified live.

## 2026-10-12 — released printer-check guidance

Live App Store US lookup and ASC API both confirm 1.6.0 is available; ASC also confirms 1.4.1 Ready for Sale. Public US rating count remains 0, so no rating claims added. The homepage, support, printer-test guide and three troubleshooting guides still incorrectly described the shipped printer check as awaiting review. Corrected this support/conversion obstacle across those six pages and llms.txt, preserving every URL and all PDF downloads. Exact entry points checked in SettingsView.swift and ExportPanel.swift; printer tests remain free and outside the output ledger. Updated substantive page dates and sitemap dates; validator now rejects the obsolete 1.4.1 pending-review claim. No app code or release action.

Existing HTTPS home/key-guide/robots/sitemap/llms requests returned 200. Local validation passes 23 HTML pages. Desktop browser inspection confirms readable available-now instructions. At 390px the responsive DOM has no horizontal overflow; narrow screenshot captures below the fold were blank in Orca, so full mobile visual verification is limited by that browser capture issue. No stylesheet/layout changed.

Authenticated browser tools from the previous review are unavailable. Available Orca browser requires sign-in for Google Search Console, Bing Webmaster and App Store Analytics; no new indexing/traffic/campaign results inferred. Preserve October 10 KB metrics (Sep 9–Oct 8 ASC, 130 first-time downloads; 59 ChatGPT app referrals; $51 proceeds / 12 IAPs; RevenueCat last 28 days $90). These were recorded by the October 10 review, not re-pulled today. Website sales attribution remains unverified. Next authenticated review: Google query/indexing and Bing sitemap status, campaigns, comparable post-price windows. Domain and ownership files unchanged.

Publication verified: validator and GitHub Pages Actions succeeded for `9f5324c`; live guide shows available-now wording. IndexNow returned HTTP 200 for all six changed page notifications (received, not an indexing guarantee).

## Growth batch — 18 October 2026

Prepared `photo-printing-apps-iphone.html`, a disclosed developer comparison of Apple Photos/AirPrint, Photo Print, Canon PRINT and Epson Smart Panel. Official sources support printer compatibility and workflows; no invented tests, rankings or prices. Author content: `_ops/photo-printing-apps-iphone.fragment`; render with `_ops/build_comparison.py`, then `_ops/enrich_site.py`, then `_ops/validate.py`. The enrichment step now preserves existing heading IDs so published anchors remain stable. Existing Photo Print weekly growth automation is ACTIVE as read today.

## 2026-10-22 — make the photo-lab route visible on the homepage

Reviewed latest recorded evidence in app KB: October 19 GSC snapshot has 164 impressions, 0 clicks, mean position 17.5 and 3 indexed pages; indexing requests already sent October 19 and IndexNow accepted October 20. Preserve the decision to avoid adding more guide URLs while discovery is limited. Available aggregate acquisition/sales records include RevenueCat $138/28 days to October 16 and territory revenue/new-customer figures September 20–October 18; these are existing recorded observations, not a fresh re-pull. Price increased October 19 and paid campaigns now exist, so later revenue changes cannot be attributed solely to this website. This heartbeat made no ads, price or outreach changes.

Chosen support/conversion gap: visitors without a printer saw only AirPrint/PDF in the homepage introduction, steps and FAQ despite the shipped photo-lab export. Added an existing-style section with the real demo sheet preview, official Apple badge and app icon, `website-home-lab` campaign tag, and link to the existing photo-lab guide. Updated introduction, output steps, matching visible/JSON-LD FAQ, support and llms product facts; no new guide or URL. Explain matching 4×6 print, cropping/settings, ruler check and separate lab charges; no print-ordering or ID acceptance claims.

Primary evidence checked: public US Apple lookup confirms live 1.6.0 and its photo-lab release notes (0 US ratings); `PhotoPrint/Export/PrintShopExporter.swift` confirms JPEG sheet output at 300 ppi, `Features/Export/ExportPanel.swift` confirms exact UI entry and lab-setting advice. Apple AirPrint requirements rechecked at https://support.apple.com/en-us/109349 . Home/key guides/robots/sitemap/llms all return HTTPS 200 (initial broad concurrent check timed out; focused normal-TLS checks succeeded).

Google Search Console, Bing sitemap dashboard and App Store campaign dashboard still require sign-in in the available Orca profile, so authenticated indexing and fresh metrics remain unverified. Do not repeat indexing requests based only on unavailable reports. Browser capture in Orca remained blank; an isolated headless Chrome preview verified actual desktop (1280px) and mobile (390px) rendering, no horizontal overflow, working FAQ, lab guide link and campaign CTA. 24 HTML pages pass static validation. Screenshot evidence is local `_ops/photo-lab-home-proof.png` and `_ops/photo-lab-mobile-proof.png`. Next review: obtain comparable authenticated query/indexing and campaign data; measure this CTA only after Apple's threshold, with no assumed conversion uplift.

Verified publication: GitHub connector published commit `3cb702d` after the CLI login expired; both static validation and Pages deployment completed successfully. Live homepage includes the photo-lab section and campaign tag. IndexNow accepted the two changed URLs with HTTP 200 (notification received, not confirmation of indexing or ranking). Local branch was aligned to the identical published tree; no unrelated work discarded. CLI authentication remains expired; use the connected GitHub account or re-authenticate before future command-line pushes.

## 2026-10-24 — discovery audit and passport accuracy

Read in the owner's Chrome. Google Search Console (Pages, last update Oct 16): **4 indexed, 18 "Discovered – currently
not indexed", 3 redirects**. Performance, 28 days: 326 impressions, **0 clicks**; top queries "how to print multiple
pictures on one page" (7), pixel-size queries, "passport size photo lab print" (1). Bing: a search for
"usephotoprint.com" returns **no results** — the site is not in Bing's index yet, so ChatGPT search cannot cite it.
Bing Webmaster is not signed in in this Chrome profile.

App Store Connect (Sep 24 – Oct 23): 100 of 205 first-time downloads come from the ChatGPT app referrer, 3 from web
referrers. ChatGPT is recommending the **App Store listing**, not this site. The listing description is the text
LLMs read about the app; keep it factual and complete (sizes, no-printer route, one-time purchase).

Accuracy fix (commit d610534): the US State Department and HM Passport Office reject photos altered by software
(travel.state.gov photo page; gov.uk/photos-for-passports "unaltered by computer software"). The at-home, photo-lab
and 2×2 guides now say background replacement is not for US or UK passports. App 1.7.0 shows the same warning.

Blocker: "Discovered – currently not indexed" on a 3-week-old domain = no external links. Next steps need the owner:
sign in to Bing Webmaster (or "Import from GSC"), and publish the prepared listings in `../PhotoPrint/marketing/backlinks-2026-10.md`
(AlternativeTo, Product Hunt). GitHub CLI login has expired; `gh auth login` before the next push.

## 2026-10-26 — locket photo guide

Owner requested a useful SEO article and publication. Added `print-locket-photos-iphone.html`: a distinct custom-size use case beyond the existing passport, wallet and printer guides. Topic choice is an editorial judgment based on app capability and a content gap, not measured keyword volume. The October 24 Search Console record remains the latest query evidence; no fresh traffic or ranking claims made.

Guide covers insert-versus-pendant measurements, a maker-specific template, Photos → Share → Print, custom width/height and copies in Photo Print, Fill versus Fit, a 15 × 20 mm example (178 × 237 visible pixels at 300 PPI), actual-size proofing, hand trimming and a print-shop fallback. Explicitly explains that Photo Print produces rectangles, without claiming locket-shaped masks or a universal locket size. Original SVG is an explanatory diagram, clearly labeled as not a printable template.

Sources checked October 26: Apple’s iPhone printing guide https://support.apple.com/guide/iphone/print-photos-iph1ac0b04b/ios ; Astley Clarke’s replacement-photo guidance https://www.astleyclarke.com/pages/replacement-locket-photos ; Adobe’s scaling documentation https://helpx.adobe.com/acrobat/desktop/print-documents/set-up-and-print-pdfs/page-size.html . App steps checked against SettingsView, PhotoDetailView and ExportPanel in the app repo. Apple US lookup confirms live 1.8.0, minimum iOS 17.0, 0 ratings; no social proof added.

Discovery: linked from the guide directory, wallet guide and multiple-photo guide; added Article, BreadcrumbList and matching visible FAQ schema, canonical/social metadata, sitemap, llms.txt and campaign tag `guide-locket`. Shared build scripts preserve the new directory entry; campaign mapping includes the page.

Prepublication validation: 25 HTML pages pass `_ops/validate.py`; new title 56 characters and description 131. Desktop 1440 px and mobile 390 px were visually inspected in Chrome with JavaScript disabled; no horizontal overflow, broken images or contents targets. Publication and IndexNow verification pending below.
