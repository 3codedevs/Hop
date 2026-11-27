# Case study: Hop

Hop compares BRT, danfo (minibus), ride-hailing and self-drive car rental for trips across Lagos, Nigeria. Its first landing page was built quickly with AI help. The owner asked, "does it look AI-built or human?". This is how the method fixed it.

## Before

- Four fonts: Syne extended headlines, Instrument Serif italic accents, a sans for body, JetBrains Mono uppercase labels.
- Navy and yellow plus a different pastel card for each feature.
- Fake telemetry: "LAGOS CORRIDOR ENGINE · ROUTE & FARE ESTIMATES", "6.5244° N, 3.3792° E · DRAFT V1".
- Text scramble, blinking colon, pinging dots, a marquee, tilted cards, and a refracting glass navbar that let headings show through.
- No photographs. A dot grid standing in for a map.
- About 80 hardcoded copies of the navy hex value.
- Em dashes and "Static schedules lie. Lagos commuters don't." style copy.

## The method applied

1. **Truth:** "The best way across Lagos depends on the hour you leave."
2. **References:** eight sites rendered, screenshotted and measured. House style: one family, one accent, Lenis, expo ease, numbered chapters, real photos, one set-piece.
3. **Direction:** a light product page with two dark chapters. Set-piece: **scroll controls the time of day**. A clock runs from 06:00 to 22:00 over a Third Mainland Bridge photo that crossfades to dusk and night, a traffic bar rises and falls, and a card shows the best way from Yaba to Lekki for that hour, with the ride-hail comparison.
4. **Tokens:** paper #F3F1EC, ink #0E0F0C, muted #6B6B65, one accent "signal" orange #FF5A1F (traffic lights, rush hour), green only for savings, night and chalk for dark chapters.
5. **Type:** Newsreader serif headlines with real italics for the second half ("Every way across Lagos, *ranked for the hour you leave.*"), Inter Tight for interface and figures, "No. 3" chapter labels, italic photo captions, closed en dashes in fares.
6. **Layout:** stat row and hero with a framed photo; sticky phone next to three steps; numbered "Why Hop" rows with hairlines next to a sticky photo; dark calculator; photo car cards plus a hairline list; hairline FAQ; dark footer with an oversized italic wordmark.
7. **Real things:** eight Unsplash photos of Lagos (each checked by eye, credited); a real vector map from OpenStreetMap data in a custom dark style, with the Ikeja to Lekki corridor drawn along real roads and pins at true coordinates that fly in to street level.
8. **Motion:** Lenis; masked headline rise; one paragraph that fills on scroll; routes that draw once; dark chapters that open to full width; the set-piece. Scramble, blink, ping and marquee removed.
9. **Copy:** "Saves ₦3,200 and 18 minutes over ride-hailing"; "A bus was reported missing six minutes ago. Take BRT 102 instead."; "Ride-hailing is still cheaper today. Hop will say so."
10. **Checks:** build and lint clean; headless screenshots at 1440 and 390 wide; the clock read 07:15 → 11:35 → 17:30 → 21:10 and back to 11:35 when scrolled up; no console errors; reduced motion shows everything in place; no horizontal overflow on mobile. Two real bugs were found only by looking: the glass nav overlapping headings, and the map container collapsing to 0px because the library's CSS beat the Tailwind utilities.
