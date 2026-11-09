# USSD Bench

USSD Bench is a browser tool for one USSD screen at a time. Paste a menu, fit it to an octet budget, clean characters that break a gateway, align it to a phone width, and count SMS segments. The menu text stays in the browser. It is not uploaded.

USSD Bench has two separate sections, each a step-by-step wizard with Next and Back and a step indicator:

- **USSD formatter** (ultramarine): Input, Encoding, Pagination, Alignment, and an optional Character Review.
- **SMS formatter** (green): Input, Encoding, and Segments with a preview.

What both sections share:

- A language picker: English, Arabic, French, Spanish, Urdu, and Hindi are one-click chips, and a searchable list covers every other ISO 639-1 language. Each selected language is its own menu, on its own tab.
- Smart characters (curly quotes, en and em dashes, ellipses, no-break and other special spaces, zero-width characters) are replaced automatically with their GSM-7, Latin-1, or UCS-2 equivalent, and every replacement is highlighted.
- The encoding (GSM-7, Latin-1, or UCS-2) is detected per language and can be overridden.
- A phone preview with a Smartphone / Feature phone switch and an editable column count on the phone itself (defaults 32 and 20).

USSD specifics:

- Characters per Page defaults to the language's encoding: 182 for GSM-7, 160 for Latin-1, 80 for UCS-2.
- Reply key and label for Next and Back are set per language. Pagination is by word or by line; in line mode a line longer than a page is split at a word.
- Alignment forces direction per page: RLE (U+202B) for right or LRE (U+202A) for left at the start of each page, PDF (U+202C) at the end. It only applies to UCS-2, and pagination counts both marks.
- The phone follows whichever page you have scrolled to.

SMS segments: GSM-7 160 / 153, Latin-1 (8-bit) 140 / 134, UCS-2 70 / 67. Dark theme by default, with a light theme on the switch. Ads are off.

## Design: Short Code

The visual identity is "Short Code": a handset-and-keypad look for a tool that lives in `*100#` menus. It pairs a high-contrast, utilitarian layout (hard 1.5px ink borders, small radii, offset "pressed key" shadows) with a pixel-LCD phone preview.

**Palette.** Every colour is a semantic token in `app/globals.css`; retune the `:root` (light) and `.dark` blocks and the whole app follows.

| Token | Light | Dark |
| --- | --- | --- |
| Background | `#F4F5FB` cool paper | `#090B1A` ink-indigo |
| Surface (card) | `#FFFFFF` | `#12152E` |
| Foreground | `#0C0F24` ink | `#EEF0FF` |
| Primary | `#3326D9` ultramarine | `#C8F03C` signal lime |
| Accent / highlight | `#C8F03C` signal lime | `#8B7DFF` violet |
| Sidebar chrome | `#0C0F24` | `#05060F` |
| Phone LCD | `#C9EA45` on `#0F1403` | `#0B1503` on `#C8F03C` |
| Destructive | `#C8103A` | `#FF6B88` |

Body copy, muted text, buttons, and the LCD pairs all meet WCAG AA contrast in both themes. Non-text borders and input outlines meet 3:1.

**Fonts** (loaded with `next/font/google` in `app/layout.tsx`): Bricolage Grotesque for the wordmark and headings, Instrument Sans for body copy, JetBrains Mono for menu text, counters, and labels.

**Section bases.** Inside the Short Code identity, the USSD section uses shades of ultramarine and the SMS section shades of green, in both themes: a tinted page wash, tinted panel headers with a section stripe, the step indicator, and the phone shell. They are set with `[data-section="ussd"]` and `[data-section="sms"]` blocks in `app/globals.css`.

**Non-Latin text.** JetBrains Mono has no Arabic or Devanagari glyphs, so menu text and the phone fall back to Noto Kufi Arabic and Noto Sans Devanagari. The phone draws each row as one run of text, so Arabic shapes and joins and the browser applies the page direction.

**Icons.** `app/favicon.ico`, `app/icon.svg`, `app/icon.png`, and `app/apple-icon.png` are the `*#` key, picked up by Next's icon file conventions.

**Navigation.** On desktop (1024px and up) a fixed left rail holds the USSD Bench wordmark, a Home link, the two formatters as numbered keys (1 USSD formatter, 2 SMS formatter) with each wizard's steps as a submenu (the current step is highlighted and every step is clickable), and the dark-mode switch. The active page is a filled lime key with `aria-current="page"`. On mobile there is a slim top bar (wordmark and theme switch) and a three-tab bottom bar (Home, USSD, SMS).

**Page chrome.** Steps are flat "panels" with a mono title strip, not nested cards. Languages are tabs. Pagination, Alignment, and Segments are two columns with a sticky phone on the right. Home pairs a typographic headline and an LCD limits readout with the two formatters.

## Run it locally

```bash
npm install
npm run dev
```

The dev server listens on port 43123. Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

```bash
npm test
npm run lint
```

`npm test` runs the unit tests for encoding detection, smart-character replacement, characters per page, word and line pagination, per-page direction marks, SMS segments, display width, and phone bidi.
