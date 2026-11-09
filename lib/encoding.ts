import { isGsm, isGsmExtension } from "@/lib/gsm"

export type Encoding = "gsm7" | "latin1" | "ucs2"

export const ENCODINGS: Encoding[] = ["gsm7", "latin1", "ucs2"]

export const ENCODING_LABEL: Record<Encoding, string> = {
  gsm7: "GSM-7",
  latin1: "Latin-1",
  ucs2: "UCS-2",
}

export const ENCODING_UNIT: Record<Encoding, string> = {
  gsm7: "septets",
  latin1: "characters",
  ucs2: "UCS-2 characters",
}

/** Characters per page for a 160-octet USSD string: 182 septets, 160 bytes, or 80 UTF-16 units. */
export const DEFAULT_CHARS_PER_PAGE: Record<Encoding, number> = {
  gsm7: 182,
  latin1: 160,
  ucs2: 80,
}

export function defaultCharsPerPage(encoding: Encoding): number {
  return DEFAULT_CHARS_PER_PAGE[encoding]
}

export function isLatin1(ch: string): boolean {
  const cp = ch.codePointAt(0) ?? 0
  return ch.length === 1 && cp <= 0xff
}

export function canEncode(ch: string, encoding: Encoding): boolean {
  if (encoding === "gsm7") return isGsm(ch)
  if (encoding === "latin1") return isLatin1(ch)
  return true
}

/** The narrowest encoding that can hold every character: GSM-7, then Latin-1, then UCS-2. */
export function detectEncoding(text: string): Encoding {
  let gsm = true
  for (const ch of text) {
    if (gsm && isGsm(ch)) continue
    gsm = false
    if (!isLatin1(ch)) return "ucs2"
  }
  return gsm ? "gsm7" : "latin1"
}

export type Unencodable = { ch: string; cp: number; utf16Index: number }

export function unencodable(text: string, encoding: Encoding): Unencodable[] {
  const found: Unencodable[] = []
  let index = 0
  for (const ch of text) {
    if (!canEncode(ch, encoding)) found.push({ ch, cp: ch.codePointAt(0) ?? 0, utf16Index: index })
    index += ch.length
  }
  return found
}

/**
 * Page cost in the encoding's own unit. GSM-7 extension characters cost two septets.
 * A character the encoding cannot hold is counted as one so a forced encoding still paginates.
 */
export function charCost(ch: string, encoding: Encoding): number {
  if (encoding === "gsm7") return isGsmExtension(ch) ? 2 : 1
  if (encoding === "latin1") return 1
  return ch.length
}

export function textCost(text: string, encoding: Encoding): number {
  let total = 0
  for (const ch of text) total += charCost(ch, encoding)
  return total
}

export function octetsFor(units: number, encoding: Encoding): number {
  if (encoding === "gsm7") return Math.ceil((units * 7) / 8)
  if (encoding === "latin1") return units
  return units * 2
}
