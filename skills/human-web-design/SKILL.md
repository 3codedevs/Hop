---
name: human-web-design
description: Design and build websites, landing pages, portfolios and product pages that look like a skilled human designer made them, not an AI template. Use this skill whenever someone asks to build, redesign, restyle, polish or "make beautiful / professional / premium / less generic" any web page or site, asks for a design system or visual direction for one, or asks whether a site looks AI-generated, even if they never say "design". Covers studying reference sites, choosing a direction, design tokens, human typography, layout, real photography and real maps, one signature scroll interaction with quiet motion everywhere else, plain copy, and checking the result with screenshots.
---

# Human web design

Most AI-made websites look alike: the same three trendy fonts, a pastel card for every feature, glass navbars, gradient blobs, uppercase monospace "telemetry" labels, every element animating, em dashes in every sentence. People recognise these tells immediately, and they read as "template", so the product feels untrustworthy.

This skill is the method used to redesign a real Lagos commuting product (Hop) after studying eight professionally built sites. It works for any stack. Code examples use React, Tailwind v4 and framer-motion because they are common; the reasoning carries over to plain HTML and CSS, Vue, Svelte or anything else.

The core idea: **restraint everywhere, plus one memorable thing that comes from the product itself.** A site looks designed by a person when every element has a reason to exist, the type is set with care, the images and data are real, and there is one interaction a visitor will remember and describe to someone else.

## The method

Work through these steps in order. Steps 1 to 3 are thinking, and they are where most of the quality comes from, so do not skip to code.

### 1. Find the product's one truth

Before any visual decision, write one sentence that says what is true about this product that is not true of its competitors. For Hop: "the best way across Lagos depends on the hour you leave." Everything else hangs off this sentence: the headline, the signature interaction, which data to show.

Also list what is real and specific about the product: places, prices, people, numbers, constraints. Specific detail ("BRT 102 boarding at Fadeyi", "danfo fares from ₦300") is the single strongest signal that a human who knows the subject made the page. Generic claims ("fast, reliable, seamless") are the strongest signal of the opposite.

### 2. Study references (when there are any)

If the user names reference sites, or has a portfolio or brand to match, study them properly instead of guessing from memory. Render them in a headless browser, scroll through them, screenshot each screen, and record their fonts, colours, CSS variables, keyframes and libraries. `scripts/audit.mjs` does this (see "Scripts" below).

Then write down the **house style** the references share, as a table: fonts, palette, layout moves, motion, imagery, what they avoid. You are looking for rules, not things to copy. In the reference set behind this skill, the shared rules were: one font family (often Inter Tight) plus at most one supporting face, one accent colour, Lenis smooth scrolling, a single expo ease-out curve, numbered chapters, real photography, and exactly one big scroll-driven moment per page. `references/patterns.md` catalogues those sites and their patterns.

Never recreate a specific site. Borrow principles and mechanisms, not layouts, art or branding.

### 3. Choose a direction

A reliable direction for product and marketing sites is **a calm, light product page interleaved with one or two dark cinematic chapters**:

- The light sections sell the product: a clear headline, the core interaction (a search box, a calculator, a booking widget), how it works, why it is different, FAQ.
- The dark chapters carry the memorable part: the signature interaction, a real map, a full-bleed photo story. Switching tone tells the visitor "this part matters".

Then design the **signature set-piece**: one scroll-driven interaction built from the product's one truth. Find the variable that matters most to the product and let scrolling control it:

| Product | Variable | Set-piece |
|---|---|---|
| Commuting (Hop) | Time of day | Scroll moves a clock from 06:00 to 22:00 over a city photo that fades from day to night; the best route and fare update each hour |
| Food ordering | The order's journey | Scroll follows one order from kitchen to doorstep |
| Fashion drop | The garment | Scroll turns the garment, or zooms from look to fabric |
| Savings or investing | Years | Scroll grows the balance year by year |
| Property | Walking through | Scroll walks from the street into the room |
| City or travel guide | Light | Scroll changes the city from day to night |

One set-piece per page. Two compete and both feel like gimmicks.

If the user's taste is unclear (light or dark, playful or sober, which accent), ask one short question with two or three concrete options before building. If they already chose, do not reopen it.

### 4. Set the tokens

Put every colour, font and easing curve in one place (CSS custom properties, or a Tailwind v4 `@theme` block) and use only those names in components. Hardcoded hex values scattered through components are both a maintenance problem and a visible AI tell, because the palette drifts. `references/tokens.css` is a starting point.

- **Palette:** a warm off-white "paper" (not pure white), a near-black "ink" (not pure black), a muted grey for secondary text, one hairline colour (ink at about 12% opacity), and **one accent**. The accent is for the primary action and one signal element (a route line, a progress bar, a "top pick" dot). Add one semantic colour only if the product needs it (green for savings). Dark chapters get "night" and "chalk" equivalents.
- **Accent choice:** derive it from the product's world (traffic-light orange for commuting, chilli red for food), not from a trend.
- **Radius:** pick one (about 20 to 24px for cards, fully rounded for pills) and keep it.
- **Easing:** one expo ease-out, `cubic-bezier(0.16, 1, 0.3, 1)`, for everything. Two durations (about 0.4s for UI, 0.9 to 1.2s for reveals).
- **Layout shell:** max width about 1320px, side gutter `clamp(20px, 4vw, 56px)`, a 12-column grid on desktop, section padding of 96 to 144px.

### 5. Set the type like a person would

Typography is where AI-made sites give themselves away most, and where a little care pays most. Read `references/typography.md` before choosing fonts. The short version:

- **Two families at most.** Either a serif for headlines plus a clean sans for everything else, or one confident sans for everything. The serif-headline pairing reads as editorial and human. A good default: Newsreader or Source Serif 4 (they have optical sizes) with Inter Tight or Inter. Avoid the combinations that have become template signatures (see `references/ai-tells.md`).
- **Emphasis with real italics**, not grey text, gradient text or a third font: "Every way across Lagos, *ranked for the hour you leave.*"
- **Sentence case** for labels, buttons, captions and navigation. Drop the letter-spaced uppercase monospace labels; they look like a terminal, not a page.
- **No monospace for decoration.** If numbers need to line up, use the body font with `font-variant-numeric: tabular-nums`.
- **Tracking scales with size:** about −0.02em for large serif headlines, −0.01em for small headings, 0 for body. The extreme −0.05em on everything is a tell.
- **Typesetting details:** `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs, `hanging-punctuation: first last`, curly quotes and apostrophes, closed en dashes in ranges (₦900–1,300, 09:00–19:00), a line length of about 60 to 75 characters, body text at 16 to 18px with line-height around 1.55.
- **Check glyph coverage** for currencies and local characters (₦, ₹, ₺, accented names). If the display font lacks a glyph, set that string in the sans.
- **Small editorial touches:** chapter labels as an italic "No. 3" followed by the section name, photo captions as an italic sentence with a plain "Photo: Name" credit.

### 6. Lay it out

- Start every section from the grid. Asymmetric splits (7/5, 5/7) look more designed than centred stacks.
- Prefer **numbered rows separated by hairlines** over a stack of coloured cards. Three equal cards with an icon each is the most common template pattern there is.
- Give the hero one job: a large headline, one sentence of support, the core interaction, and one real photo with a caption. A small stat row ("05 ways to travel, compared") can sit above it.
- Use **sticky pairs** for explanations: steps on one side light up as you scroll while a phone mockup or image on the other side changes.
- Keep the navbar solid and slim: wordmark, four or five links, one primary button. Let it switch to a dark style over dark chapters, and add a 2px scroll progress bar along its top edge. Translucent "liquid glass" navbars let content show through and look templated.
- End with a dark footer: a large closing line, the primary action, credits, and an oversized wordmark.

### 7. Use real things

- **Photography:** use real photos of the actual subject (the city, the product, the people). With no budget, use Unsplash-licensed photos: search the public site, check every candidate visually (titles lie, and "Lagos bridge" results are often not Lagos), keep only free-licence images (`images.unsplash.com/photo-...`, not `premium_photo-...`), resize to about 1600 to 2400px wide, write descriptive `alt` text, and credit photographers in the footer.
- **Data:** show real places, real prices as honest ranges, and real constraints. Never invent fake telemetry (coordinates, "ENGINE v1", "DRAFT", system-status labels) to look technical.
- **Maps:** if location matters, use a real map, not a dot grid. `references/real-maps.md` has a free, key-less recipe (MapLibre with OpenFreeMap tiles from OpenStreetMap, a custom style, real road routes from OSRM) and the gotchas that break it.

### 8. Motion: one set-piece, everything else quiet

Read `references/motion.md` for the code.

- **Smooth scroll** with Lenis, turned off when the user prefers reduced motion.
- **The set-piece** is a sticky, scroll-linked section (300 to 450vh tall), so it scrubs both ways as you scroll and never plays on its own.
- **Everything else is quiet:** headlines rise line by line from a mask, blocks fade and rise once on entry, long paragraphs fill word by word on scroll, SVG or map routes draw themselves once, dark chapters open from an inset rounded panel to full width.
- **Cut** decorative loops: text scramble, blinking colons, pinging dots, marquees, floating blobs, tilt-on-hover cards, cursor trails. Each one is cheap to add and together they make a page feel like a demo.
- Respect `prefers-reduced-motion` everywhere: content must appear immediately and be fully readable without any animation.

### 9. Write like a person

- Short, specific, concrete sentences. Real numbers and places.
- No em dash in every sentence, no "X lies. Y doesn't.", no "Unlock / Elevate / Seamless / Supercharge", no "✨".
- Badges in plain English: "Saves ₦3,200 and 18 minutes over ride-hailing", not "Saves ₦3,200 & 18 min vs ride-hail".
- Status text as sentences: "A bus was reported missing six minutes ago. Take BRT 102 instead.", not "Ghost bus flagged 6m ago · use BRT 102".
- Label estimates honestly ("About ₦900–1,300"), and say when the other option wins ("Ride-hailing is still cheaper today").

### 10. Check it by looking

Do not report a design as done from the code alone. Build it, run it, and look at it.

1. Build and lint cleanly.
2. Screenshot it with `scripts/audit.mjs` at 1440×900 and 390×844, scrolling screen by screen, and look at every screenshot. Check for overlaps, clipped italics, widowed words in headlines, text running off cards on mobile, empty or broken sections, and horizontal scrolling on mobile.
3. Scrub the set-piece forwards and backwards and confirm it returns to the same state.
4. Load once with reduced motion and confirm everything is visible and in place.
5. Watch the console for errors.
6. Compare against the AI-tells checklist in `references/ai-tells.md` and fix anything that matches.

Known traps: third-party CSS that is not in a cascade layer beats Tailwind v4 utilities (a map library setting `position: relative` on its container can collapse it to 0px high); headless Chromium with SwiftShader flags can hang on WebGL screenshots (use the default launch); a scramble or count-up animation can hide the real text from screen readers unless the real text is also in an `sr-only` element.

## Scripts

- `scripts/audit.mjs`: renders one or more URLs in headless Chromium (Playwright), saves a screenshot per screen while scrolling plus a mobile screenshot, and writes `probe.json` with computed fonts, colours, CSS custom properties, keyframes, running animations, detected libraries (Lenis, GSAP, three.js), image alt-text gaps and the heading outline. Use it to study references and to check your own build.

  ```bash
  npm i -D playwright && npx playwright install chromium
  node scripts/audit.mjs ./shots https://example.com http://localhost:5173
  ```

## References

Read these when you reach the matching step:

| File | Read it when |
|---|---|
| `references/typography.md` | Choosing fonts and setting type (step 5) |
| `references/tokens.css` | Starting the token file (step 4) |
| `references/motion.md` | Building reveals, scroll-fill text and the set-piece (step 8) |
| `references/real-maps.md` | The page needs a map (step 7) |
| `references/patterns.md` | Looking for section patterns and reference sites (steps 2, 3, 6) |
| `references/ai-tells.md` | Reviewing the result (step 10), or when a user asks "does this look AI-made?" |
| `references/case-study-hop.md` | You want a worked example of the whole method |

## Before you call it done

- [ ] One sentence states the product's truth, and the headline and set-piece come from it
- [ ] Tokens in one place; no stray hex values in components
- [ ] Two font families at most; real italics for emphasis; sentence case; no decorative monospace
- [ ] One accent colour, used sparingly
- [ ] Real photos (checked, credited, with alt text) or real data and maps; no fake telemetry
- [ ] Exactly one signature interaction; the rest of the motion is quiet and respects reduced motion
- [ ] Copy is specific and plain; no AI-tell phrases or punctuation tics
- [ ] Screenshots at desktop and mobile were taken and looked at; no overlaps or overflow
- [ ] Build, lint and console are clean
