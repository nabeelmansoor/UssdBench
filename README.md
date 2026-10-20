# USSD Bench

USSD Bench is a browser tool for one USSD screen at a time. Paste a menu, fit it to an octet budget, clean characters that break a gateway, align it to a phone width, and count SMS segments. The menu text stays in the browser. It is not uploaded.

Version 1 includes:

- Pagination with and without Next and Back, on a 160-octet budget (182 GSM septets or 80 UCS-2 characters). The named preset is Vodafone Qatar at that same 160 octets.
- A shared phone width for Paginate and Align: 16–24 columns for a feature phone, 30–40 and above for a smartphone.
- Left, center, and right padding, and one right-to-left or left-to-right mark pair per line.
- A character scan for special spaces, invisibles, smart punctuation, fullwidth lookalikes, and anything outside GSM 7-bit.
- SMS segment counts for GSM 7-bit (160 / 153, extension characters at two septets) and UCS-2 (70 / 67).
- Light and dark themes. Ads are off.

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

**Navigation.** On desktop (1024px and up) a fixed left rail holds the USSD Bench wordmark, a Home link, the four tools as numbered keys (1 Paginate, 2 Align, 3 Characters, 4 SMS), and the dark-mode switch. The active page is a filled lime key with `aria-current="page"`. On mobile there is a slim top bar (wordmark and theme switch) and a five-tab bottom bar (Home, Paginate, Align, Characters, SMS).

**Page chrome.** Tools are flat "panels" with a mono title strip, not nested cards. Paginate and Align are two columns with a sticky phone on the right; the buffer actions sit directly under the textarea. Home pairs a typographic headline and an LCD limits readout with the shared buffer and a numbered tool menu.

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

`npm test` runs the unit tests for GSM packing, display width, pagination, cleanup, and SMS segments.
