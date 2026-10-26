# Weekly Photo Print guide and growth routine

Owner authorization: continue researching, writing, validating and publishing useful
website guides, following the locket-photo guide published on 26 October 2026. Use the
existing `photo-print-website-growth` task, Mondays at 10:00 Asia/Dubai. Do not create a
second schedule. The local computer and desktop app need to be running for local work.

## Pick one useful piece of work

1. Read the app's `CLAUDE.md`, `docs/kb/growth.md`, and this site's
   `_ops/SEO-PLAYBOOK.md`. Use the `app-website-seo` skill. Inspect both repositories'
   status and current remote heads; preserve unrelated work and existing URLs.
2. Check the latest dated publication record before starting. Publish **at most one new
   guide in a rolling seven-day period**, counting manual publications. The locket guide
   on 26 October 2026 counts. Do not publish again simply because a scheduled run begins.
3. When accessible, review Search Console/Bing queries and indexing, App Store campaign
   referrals and aggregate downloads. Record source, reporting window and data delays.
   Missing access or suppressed data is not zero and does not block independent research.
4. Prefer a distinct question with a real app workflow or a substantial improvement to an
   existing guide. Check the whole guide index before choosing. Avoid near-duplicate
   country pages, keyword variants and articles written merely to meet a quota. Use query
   evidence when available; otherwise label the choice as editorial judgment. Improve an
   existing page when that better answers the question.

Research candidates, not promised new pages: Fit versus Fill and aspect ratio (extend the
existing wallet guide if sufficient); physical differences between 4 × 6 inches and
10 × 15 cm; measuring a frame's insert versus visible window. Check overlap and actual
user need before writing. Reassess the locket guide only after reporting data is available.

## Write and prepare

5. Research current primary sources. Verify exact app controls in the Swift source and
   current product facts against the public App Store listing. Never invent search volume,
   ratings, reviews, pricing, rankings, attribution or features. Recheck official sources
   for passport guidance; exact dimensions alone do not establish acceptance.
6. For a new guide, aim for 800–1,300 useful words: direct answer in the first two sentences,
   built-in iPhone method where appropriate, exact app steps, a worked example, practical
   limits and visible FAQ. Add a real author link, publication/update dates, correction
   link and current primary-source links. Use the hand-authored locket guide as a structural
   example; do not run old bulk generators over unrelated pages.
7. Preserve the shared design. Include one H1, a unique title of at most 60 characters,
   description of at most 155, canonical/social metadata, Article and BreadcrumbList JSON-LD,
   and FAQ data only when it matches visible text. Any diagram must clarify the workflow;
   never present a screen illustration as a measured print template.
8. Link the guide from `guides.html` and relevant existing articles, including the directory's
   structured data. Update only changed sitemap dates, add the page to `llms.txt`, and add a
   unique campaign mapping in `_ops/appstore_campaign.py`. App Store CTAs use the official
   badge with app icon, provider token `127826363`, `mt=8`, and a `ct` tag of at most 30
   characters. Preserve verification files and privacy source ownership.

## Check, publish, verify

9. `python3 _ops/validate.py` must PASS; run `git diff --check` and independently verify
   worked arithmetic. Inspect the actual rendered page on desktop and at 390 px with
   JavaScript disabled. Check images, table overflow, contents anchors, CTA and metadata.
   Fix findings before publishing. If a required check is unavailable, retain the draft
   and report the specific blocker instead of claiming validation.
10. Review and commit only this run's changes. Publish to the existing
    `Atabany/photoprint-site` main branch using the connected GitHub tools when available.
    Check the remote head immediately before updating it and use an expected-head lease;
    reconcile concurrent changes without overwriting them. If the CLI login is expired,
    use the connected GitHub account rather than repeatedly retrying it. If publication
    access is unavailable, keep the prepared work and report that blocker.
11. Wait for validation and GitHub Pages deployment to succeed. Verify public HTTPS 200
    responses and actual published content for the guide, new assets, changed linking
    pages, sitemap and `llms.txt`. Inspect the live mobile page. A successful push alone
    does not finish publication.
12. After deployment run `python3 _ops/indexnow.py <changed canonical page URLs>`.
    HTTP 200/202 acknowledges receipt, not indexing. Use Search Console/Bing submission
    when already accessible; do not fabricate an indexing outcome or request new OAuth.
13. Record date, URL, topic rationale, source checks, commit, validation/deployment results
    and IndexNow outcome in the playbook and app growth/status KB. Keep unfinished work
    explicit. After **every** scheduled run, post a concise result in the existing task thread:
    **SUCCESS** with the live link, what changed and verification results; **SKIPPED**
    with the reason; or **FAILED/PARTIAL** with the exact blocker, completed work and
    whether the live site changed. Distinguish successful publication from a later
    IndexNow or reporting failure. Use normal in-app task result notifications, not
    external email or messaging. Do not stay silent on skipped or unchanged runs.
    Do not repeat today's guide in a scheduled run.

This routine authorizes website content and maintenance. It does not authorize paid
campaigns, purchases, backlinks, outreach, social posts, app releases, pricing changes,
agreements or new account permissions.
