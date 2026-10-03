# Photo Print website

Static GitHub Pages site for Photo Print: Size & Layout. Production: https://atabany.github.io/photoprint-site/ . Chosen future domain: usephotoprint.com (registration pending).

- Home: animated print-studio demo, real app screens, official Apple download badge, use cases, honest free/Pro comparison and FAQ.
- Six printing guides, author/about page, support and privacy.
- Shared assets/style.css; the hero motion script pauses offscreen/in background and respects reduced motion/data saving. Core content and links work without JavaScript.
- SEO: canonical URLs, titles/descriptions, matching JSON-LD, internal links, sitemap and an optional llms.txt navigation file. See _ops/SEO-PLAYBOOK.md for source references, domain migration, attribution limitations and next topics.
- privacy.html is generated from PhotoPrint/docs/PRIVACY_POLICY.md with `python3 tools/build_site.py ../photoprint-site` in the app checkout. Change the policy at its source; shared visual design is preserved by the updated generator.

Validate: `python3 _ops/validate.py`. Preview: `python3 -m http.server 8766`. Publish: push this repo's main branch; GitHub Pages serves the root. No npm/build dependencies, cookies, external asset requests or analytics.

## Asset sources

App icon: PhotoPrint/Resources/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png.
Screens: marketing/releases/1.1/raw/phone-preview.png, marketing/releases/1.4/raw/phone-passport.png and phone-id-crop.png. Demo images, including the fictional portrait, are marketing assets.
Hero animation/poster: PhotoPrint/Resources/Onboarding/onboarding-loop-light.mp4 and onboarding-poster-light.png, authored in tools/Motion (Remotion). Source checkout had updated onboarding artwork when copied on 2026-10-03.
App Store badge: Apple's original SVG from https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg, reused unmodified from the owner's Photo Cleaner site.

The site repo was initially clean. Changes to the iOS app occurring in parallel are outside this website task.
