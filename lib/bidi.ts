import bidiFactory from "bidi-js"
import { lineDirection, stripDirectionMarks } from "@/lib/text"
import { displayColumns, walkWidth, wrapUnits, type WidthUnit } from "@/lib/width"

const bidi = bidiFactory()

export type PhoneDirection = "ltr" | "rtl" | "auto"

export type PlacedUnit = WidthUnit & { column: number }

export type PhoneLineLayout = {
  align: "left" | "right"
  rows: PlacedUnit[][]
  columns: number
}

/** Base direction for one phone row. RLE is a right-to-left paragraph. LRE stays left to right. */
export function phoneBaseDirection(line: string): PhoneDirection {
  const direction = lineDirection(line)
  if (direction === "rtl") return "rtl"
  if (direction === "ltr") return "ltr"
  return "auto"
}

function reorder(text: string, base: PhoneDirection, start = 0, end = text.length - 1): string {
  if (text.length === 0 || end < start) return ""
  const levels = bidi.getEmbeddingLevels(text, base === "auto" ? undefined : base)
  return bidi.getReorderedString(text, levels, start, end)
}

/**
 * Visual order for one logical line, with direction marks removed.
 * Strong left-to-right characters stay in logical order. Arabic runs are in reading order.
 */
export function visualPhoneText(line: string): string {
  const text = stripDirectionMarks(line)
  return reorder(text, phoneBaseDirection(line))
}

function coalesce(row: WidthUnit[]): WidthUnit[] {
  const visible: WidthUnit[] = []
  let leading = ""
  for (const unit of row) {
    if (unit.cols === 0) {
      if (visible.length === 0) leading += unit.text
      else {
        const last = visible[visible.length - 1]!
        visible[visible.length - 1] = { ...last, text: last.text + unit.text }
      }
      continue
    }
    visible.push({ ...unit, text: leading + unit.text })
    leading = ""
  }
  if (leading && visible.length > 0) {
    const last = visible[visible.length - 1]!
    visible[visible.length - 1] = { ...last, text: last.text + leading }
  }
  return visible
}

/** Wrap a line to the phone width, then apply the Unicode bidi algorithm to each row. */
export function layoutPhoneLine(line: string, width: number): PhoneLineLayout {
  const base = phoneBaseDirection(line)
  const align = base === "rtl" ? "right" : "left"
  const shown = stripDirectionMarks(line)
  const columns = displayColumns(shown)
  if (shown.length === 0) return { align, rows: [], columns }

  const rows = wrapUnits(walkWidth(shown), width).map((logical) => {
    const slice = logical.map((unit) => unit.text).join("")
    const levels = bidi.getEmbeddingLevels(slice, base === "auto" ? undefined : base)
    const visual = slice.length === 0 ? "" : bidi.getReorderedString(slice, levels)
    const units = coalesce(walkWidth(visual))
    const used = units.reduce((total, unit) => total + unit.cols, 0)
    let column = align === "right" ? Math.max(0, width - used) : 0
    return units.map((unit) => {
      const placed: PlacedUnit = { ...unit, column }
      column += unit.cols
      return placed
    })
  })
  return { align, rows, columns }
}
