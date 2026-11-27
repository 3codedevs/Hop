# AI tells, and what to do instead

Use this as a review checklist, and as the answer when someone asks "does this look AI-made?". Each item is something people recognise from template and AI-generated sites. One on its own is fine with a reason; three or more together read as "generated".

## Type

| Tell | Instead |
|---|---|
| Syne or another extended display font, plus Instrument Serif italic accents, plus uppercase JetBrains Mono labels | Two families: a serif for headlines and a clean sans for the rest, or one sans |
| Uppercase, letter-spaced monospace labels everywhere ("ROUTE ENGINE · V1") | Sentence-case labels in the body font; italic serif for chapter numbers and captions |
| Tracking of −0.05em on every heading | About −0.02em on large headlines, less as they get smaller |
| A word highlighted with a coloured pill or gradient text | Real italics |
| Monospace numbers for decoration | Tabular figures in the body font |

## Colour and surface

| Tell | Instead |
|---|---|
| A different pastel card colour for every feature | One accent; rows separated by hairlines |
| Glassmorphism ("liquid glass") navbars and cards that let text show through | A solid slim nav with a hairline border |
| Gradient blobs or mesh gradients behind the hero | A real photo, or a plain paper background |
| Pure #FFFFFF and #000000 | Warm off-white paper and near-black ink |
| Hex values hardcoded through components, so the palette drifts | Tokens in one place |

## Layout

| Tell | Instead |
|---|---|
| Three equal cards, each with an icon, title and two lines | Numbered rows, a sticky pair, or one strong example |
| Everything centred | A 12-column grid with asymmetric splits |
| A bento grid of mismatched tiles with no reason | Sections with one job each |
| Sparkles icon on the main button | A plain verb ("Find the best way") with an arrow |

## Content

| Tell | Instead |
|---|---|
| Fake telemetry: coordinates, "ENGINE", "DRAFT V1", system-status chips | Real data the product actually has |
| A dot grid with made-up pins pretending to be a map | A real map from OpenStreetMap data (see `real-maps.md`) |
| No photography, only UI mockups | Real photos of the subject, credited |
| Generic claims ("fast, seamless, reliable") | Specific places, prices and times |
| Emoji as icons | One consistent icon set, used sparingly |

## Copy

| Tell | Instead |
|---|---|
| An em dash in nearly every sentence | Full stops and commas |
| "X lies. Y doesn't." and other punchy pairs | A plain sentence that says what happens |
| Unlock, elevate, seamless, supercharge, effortless, game-changing | Concrete verbs: compare, book, see, pay |
| "&", "vs", "~" and dot-separated fragments in UI text | "and", "over", "about", full sentences |
| A spaced hyphen or en dash in ranges ("₦900 – ₦1,300") | A closed en dash, currency once ("₦900–1,300") |

## Motion

| Tell | Instead |
|---|---|
| Text scramble or "decode" effects | A masked line rise on headlines |
| Blinking colons, pinging dots, marquees, floating shapes | Nothing. Stillness reads as confidence |
| Every block tilting, scaling and blurring in | A short fade and rise, once |
| Several competing scroll effects | One signature set-piece built from the product's truth |
| No reduced-motion support | Everything readable and in place with motion off |

## Code and build

| Tell | Instead |
|---|---|
| Starter files left in (`react.svg`, `vite.svg`, unused `App.css`) | Delete them |
| A page title with an em dash and every keyword | A short title: "Hop · Every way across Lagos, compared" |
| Images without `alt` | Descriptive alt text; empty alt only for decorative images |
