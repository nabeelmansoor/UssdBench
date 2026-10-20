# USSD Bench

USSD Bench is a browser tool for one USSD screen at a time. Paste a menu, fit it to an octet budget, clean characters that break a gateway, align it to a phone width, and count SMS segments. The menu text stays in the browser. It is not uploaded.

Version 1 includes:

- Pagination with and without Next and Back, on a 160-octet budget (182 GSM septets or 80 UCS-2 characters). The named preset is Vodafone Qatar at that same 160 octets.
- A shared phone width for Paginate and Align: 16–24 columns for a feature phone, 30–40 and above for a smartphone.
- Left, center, and right padding, and one right-to-left or left-to-right mark pair per line.
- A character scan for special spaces, invisibles, smart punctuation, fullwidth lookalikes, and anything outside GSM 7-bit.
- SMS segment counts for GSM 7-bit (160 / 153, extension characters at two septets) and UCS-2 (70 / 67).
- Light and dark themes. Ads are off.

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
