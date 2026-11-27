# Section patterns and where they come from

These patterns were collected by rendering eight professionally built sites (a developer portfolio and its seven live projects) and recording their fonts, palettes, layout and motion. Borrow the mechanism, never the look: no site should be recognisable in your result.

## The reference set at a glance

| Site type | Type | Palette | Signature |
|---|---|---|---|
| Developer portfolio | One sans (Inter Tight), hero word at 216px, weight 250 | White, #111, grey | Huge light type, stat counters, floating icon-pill nav, pixel-font marquee |
| WhatsApp food business | Inter Display, Manrope | Cream, red, orange | Photo pill inside the headline, paragraphs that fill in on scroll, full-bleed colour sections |
| Women-driven ride app (Lagos) | One sans only | Ink and one pink accent | Greyed or italic second half of headlines, sticky phone next to steps, dot-matrix country map, real driver photos |
| Streetwear store | Space Grotesk, Anton | Bone, ink, flare red | Full-bleed video hero, "01 / TEES" numbering, wide-tracked labels |
| Car concept | Archivo 900, mono for data | Black, chalk, red | 0→100 loader, video chapters, side chapter index, live stat readout |
| Music fan concept | Inter Tight 800, mono labels | Royal blue grid, lime | WebGL stone bust, scattered tilted photos, words that split apart on scroll |
| City archive concept | Inter Tight 300, serif italic for one word | Near-black and paper | **Scroll controls the time of day**: video, giant clock and a day-to-night scale |
| Fragrance store | Cormorant, Jost | Warm earth tones | Scroll walks you through the shop door |

House style they share: Lenis smooth scroll, one expo ease curve, one or two families, one accent, numbered chapters, real photography, and exactly one scroll-driven set-piece per page. None of them use GSAP, pastel card stacks, glassmorphism or particle backgrounds.

## Patterns

**Huge light headline.** A single word or short line at 150–300px, weight 200–300, slightly negative tracking. Instant confidence. Best for portfolios and brand pages; on product pages keep it to the hero.

**Greyed or italic second half.** "Your ride in *three steps*." Hierarchy inside one sentence without a second style. Use on most section headlines.

**Stat counters.** Two or three facts above the hero: "+07 live projects", "05 ways to travel, compared". Use only true, specific numbers.

**Photo or icon inside the headline.** A small rounded photo or icon tile sitting inline between words. Use once, in the hero, with a real photo.

**Sticky pair.** Numbered steps on one side; as each step reaches the middle of the screen it lights up and the phone mockup or image on the other side changes. The clearest way to explain a flow.

**Numbered rows with hairlines.** Instead of feature cards: number, small label, large title, one paragraph, a hairline between rows. Pairs well with a sticky photo on the other side.

**Plate captions.** Media with a caption line below: what it shows on the left, the credit on the right. Makes photography feel curated.

**Chapter labels.** "No. 3  Corridors" or "(02) The sound". Numbering gives a long page structure and lets the visitor feel progress.

**Dark chapter.** One or two sections in near-black inside an otherwise light page, opening from an inset rounded panel to full width as they scroll in. Use for the set-piece and for maps or photo stories.

**Live readout.** A big name or number with a status and one sentence ("CMS / Marina · Alert · A bus was reported missing six minutes ago."). Use where the product has live data.

**Scroll-controlled variable (the set-piece).** A sticky full-screen stage whose content is driven entirely by scroll position: time of day, a journey, a balance over years, a walk through a door. See the table in SKILL.md, step 3.

**Paragraph fill.** A large statement paragraph whose words go from faint to full as it scrolls through. Use once per page for the key argument.

**Words that split.** Two words that move apart as you scroll ("Lagos ← → Worldwide"). Strong for brand and music pages; usually too playful for a product.

**Dark footer with an oversized wordmark.** A closing line, the primary action, credits, then the brand name very large and very faint, cropped by the bottom edge.

**Solid slim nav with a progress bar.** Wordmark, four or five links, one primary button, a 2px accent progress line on top. Switches to dark over dark chapters.
