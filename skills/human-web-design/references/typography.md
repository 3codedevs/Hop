# Typography that reads as human

Type is the fastest way a visitor (and a designer) decides whether a page was made with care. These rules come from setting Hop's type twice: once in a "techy" AI-template style, then by hand.

## Choosing families

Use two families at most. Three good pairings:

| Pairing | Feel | Good for |
|---|---|---|
| **Newsreader** (serif, optical sizes) + **Inter Tight** | Editorial, warm, trustworthy | Products with a story: transport, food, civic, finance |
| **Source Serif 4** + **Inter** | Quieter editorial | Documentation-heavy products, publishing |
| **Inter Tight** alone, light display weights (200–300) at very large sizes | Swiss, confident, minimal | Portfolios, design-led brands, dark cinematic pages |

Fonts that have become template signatures when used together: **Syne** (extended display), **Instrument Serif** italic as a one-word accent, **JetBrains Mono / Space Mono** uppercase labels, **Plus Jakarta Sans**, **Space Grotesk** with everything. Any one of them can be fine with a reason. Reaching for the combination by default reads as AI-made.

Load only the weights you use. With Google Fonts and a variable serif:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@200;300;400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..600&display=swap" rel="stylesheet" />
```

## Roles

| Role | Family | Size | Weight | Tracking | Leading |
|---|---|---|---|---|---|
| Hero headline | Serif | `clamp(3rem, 6vw, 6rem)` | 400 | −0.025em | 0.98 |
| Section headline | Serif | `clamp(2.5rem, 5vw, 4.5rem)` | 400 | −0.02em | 1.02 |
| Row or step title | Serif | `clamp(1.6rem, 2.5vw, 2.4rem)` | 400 | −0.015em | 1.1 |
| Big statement paragraph | Serif | `clamp(2rem, 3.8vw, 3.5rem)` | 400 | −0.015em | 1.15 |
| Body | Sans | 16–18px | 400 | 0 | 1.55 |
| UI, buttons, nav | Sans | 13–15px | 500–600 | 0 | 1.2 |
| Captions, labels | Sans | 12–13px | 400 | 0 | 1.4 |
| Big numbers (clock, prices) | Sans | as needed | 200–300 | −0.02 to −0.04em | 1 |

Numbers are data, so set them in the sans with tabular figures. Headlines are voice, so set them in the serif.

## Emphasis

Mark the second half of a headline with real italics, optionally in a softer tone:

```html
<h1>Every way across Lagos, <em class="italic text-muted">ranked for the hour you leave.</em></h1>
```

Italic glyphs overhang to the right. If the words sit inside an `overflow: hidden` mask for a reveal animation, add about `0.07em` of right padding so the last letter is not clipped.

Do not emphasise with gradient text, a highlighter pill behind a word, a third font, or ALL CAPS.

## Labels and captions

- Sentence case: "Traffic on Third Mainland", not "TRAFFIC ON THIRD MAINLAND".
- Chapter labels: an italic serif "No. 3" followed by the section name in the sans.
- Photo captions: an italic serif sentence describing the photo, then a plain credit on the right: *A danfo driver waiting for passengers.* · Photo: Ben Iwara.
- Never decorate with monospace. If something looks better in mono, it usually means the text has no real job; cut it instead.

## Base CSS

```css
html {
  font-optical-sizing: auto;
  font-feature-settings: 'kern', 'liga', 'calt';
  hanging-punctuation: first allow-end last;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
h1, h2, h3 { text-wrap: balance; }
p, li, dd { text-wrap: pretty; }
.num { font-variant-numeric: tabular-nums lining-nums; }
```

## Typesetting details people notice

- Curly quotes and apostrophes: “ ” ‘ ’ (driver’s, not driver's).
- En dash, closed, for ranges: ₦900–1,300, 09:00–19:00, pages 4–7.
- Repeat the currency only when the reader needs it: ₦900–1,300, not ₦900 – ₦1,300.
- Use "and", "over" and "about" in running text instead of "&", "vs" and "~".
- A real ellipsis (…) in loading states.
- No orphaned single words on the last line of a headline; `text-wrap: balance` fixes most of them.
- Line length of 60 to 75 characters for paragraphs (`max-width: 36rem` to `40rem` at 17px).
- Check that the display font has every glyph you use (₦, ₹, €, accented names). Fall back to the sans for those strings.
