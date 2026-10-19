const NAMES: Record<number, string> = {
  0x000c: "FORM FEED",
  0x00a0: "NO-BREAK SPACE",
  0x00ad: "SOFT HYPHEN",
  0x00e1: "LATIN SMALL LETTER A WITH ACUTE",
  0x00e7: "LATIN SMALL LETTER C WITH CEDILLA",
  0x00ea: "LATIN SMALL LETTER E WITH CIRCUMFLEX",
  0x061c: "ARABIC LETTER MARK",
  0x1680: "OGHAM SPACE MARK",
  0x2000: "EN QUAD",
  0x2001: "EM QUAD",
  0x2002: "EN SPACE",
  0x2003: "EM SPACE",
  0x2004: "THREE-PER-EM SPACE",
  0x2005: "FOUR-PER-EM SPACE",
  0x2006: "SIX-PER-EM SPACE",
  0x2007: "FIGURE SPACE",
  0x2008: "PUNCTUATION SPACE",
  0x2009: "THIN SPACE",
  0x200a: "HAIR SPACE",
  0x200b: "ZERO WIDTH SPACE",
  0x200c: "ZERO WIDTH NON-JOINER",
  0x200d: "ZERO WIDTH JOINER",
  0x200e: "LEFT-TO-RIGHT MARK",
  0x200f: "RIGHT-TO-LEFT MARK",
  0x2013: "EN DASH",
  0x2014: "EM DASH",
  0x2018: "LEFT SINGLE QUOTATION MARK",
  0x201c: "LEFT DOUBLE QUOTATION MARK",
  0x201d: "RIGHT DOUBLE QUOTATION MARK",
  0x2019: "RIGHT SINGLE QUOTATION MARK",
  0x2026: "HORIZONTAL ELLIPSIS",
  0x202a: "LEFT-TO-RIGHT EMBEDDING",
  0x202b: "RIGHT-TO-LEFT EMBEDDING",
  0x202c: "POP DIRECTIONAL FORMATTING",
  0x202f: "NARROW NO-BREAK SPACE",
  0x205f: "MEDIUM MATHEMATICAL SPACE",
  0x2060: "WORD JOINER",
  0x2066: "LEFT-TO-RIGHT ISOLATE",
  0x2067: "RIGHT-TO-LEFT ISOLATE",
  0x2068: "FIRST STRONG ISOLATE",
  0x2069: "POP DIRECTIONAL ISOLATE",
  0x20ac: "EURO SIGN",
  0x3000: "IDEOGRAPHIC SPACE",
  0xfeff: "ZERO WIDTH NO-BREAK SPACE",
}

export function characterName(codePoint: number): string {
  const known = NAMES[codePoint]
  if (known) return known
  if (codePoint >= 0xff01 && codePoint <= 0xff5e) {
    return `FULLWIDTH ${String.fromCodePoint(codePoint - 0xfee0)}`
  }
  const ch = String.fromCodePoint(codePoint)
  if (/\p{L}/u.test(ch)) return "Letter outside the GSM 7-bit alphabet"
  if (/\p{N}/u.test(ch)) return "Number outside the GSM 7-bit alphabet"
  if (/\p{P}/u.test(ch)) return "Punctuation outside the GSM 7-bit alphabet"
  if (/\p{Z}/u.test(ch)) return "Space separator"
  if (/\p{Cf}/u.test(ch) || /\p{Cc}/u.test(ch)) return "Format character"
  return "Character outside the GSM 7-bit alphabet"
}

export function formatCodePoint(codePoint: number): string {
  return `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`
}
