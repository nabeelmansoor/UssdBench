import type { Encoding } from "@/lib/encoding"

export type ForcedDirection = "rtl" | "ltr" | "none"

export const RLE = "\u202B"
export const LRE = "\u202A"
export const PDF = "\u202C"

/** Direction marks exist only in UCS-2. GSM-7 and Latin-1 pages are never wrapped. */
export function effectiveDirection(direction: ForcedDirection, encoding: Encoding): ForcedDirection {
  return encoding === "ucs2" ? direction : "none"
}

export function directionMarkCost(direction: ForcedDirection): number {
  return direction === "none" ? 0 : 2
}

/** One RLE or LRE at the start of the page and one PDF at its end. Lines inside are not marked. */
export function wrapPage(text: string, direction: ForcedDirection): string {
  if (direction === "none") return text
  return `${direction === "rtl" ? RLE : LRE}${text}${PDF}`
}

export function unwrapPage(text: string): { text: string; direction: ForcedDirection } {
  if (text.endsWith(PDF) && text.startsWith(RLE)) return { text: text.slice(1, -1), direction: "rtl" }
  if (text.endsWith(PDF) && text.startsWith(LRE)) return { text: text.slice(1, -1), direction: "ltr" }
  return { text, direction: "none" }
}

export function showMarks(text: string): string {
  return text.replaceAll(LRE, "[LRE]").replaceAll(RLE, "[RLE]").replaceAll(PDF, "[PDF]")
}
