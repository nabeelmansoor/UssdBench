import bidiFactory from "bidi-js"
import { lineDirection, stripDirectionMarks } from "@/lib/text"
import { displayColumns, hasUnsafeEmoji, wrapWords } from "@/lib/width"

const bidi = bidiFactory()

export type PhoneDirection = "ltr" | "rtl" | "auto"

export type PhoneRow = { text: string; columns: number; unsafe: boolean }

export type PhoneLineLayout = {
  dir: "ltr" | "rtl"
  rows: PhoneRow[]
  columns: number
}

/** Direction forced by a line's own RLE/LRE…PDF pair, or "auto". */
export function phoneBaseDirection(line: string): PhoneDirection {
  const direction = lineDirection(line)
  if (direction === "rtl") return "rtl"
  if (direction === "ltr") return "ltr"
  return "auto"
}

/** Paragraph direction from the first strong character, as a handset does without marks. */
export function paragraphDirection(text: string): "ltr" | "rtl" {
  if (text.length === 0) return "ltr"
  return bidi.getEmbeddingLevels(text).paragraphs[0]?.level === 1 ? "rtl" : "ltr"
}

/**
 * Wraps one logical line to the phone width at word boundaries. Rows stay in logical order:
 * the browser applies the bidi algorithm and Arabic shaping when the row is drawn with `dir`.
 */
export function layoutPhoneLine(line: string, width: number, pageBase: PhoneDirection = "auto"): PhoneLineLayout {
  const shown = stripDirectionMarks(line)
  const own = phoneBaseDirection(line)
  const base = pageBase !== "auto" ? pageBase : own !== "auto" ? own : paragraphDirection(shown)
  const rows = shown.length === 0 ? [] : wrapWords(shown, width)
  return {
    dir: base,
    rows: rows.map((text) => ({ text, columns: displayColumns(text), unsafe: hasUnsafeEmoji(text) })),
    columns: displayColumns(shown),
  }
}
