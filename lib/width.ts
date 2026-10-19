import { eastAsianWidth } from "get-east-asian-width"

export type WidthUnit = {
  text: string
  cols: number
  emoji: boolean
}

const EMOJI_SEQUENCE =
  /^(?:\p{Regional_Indicator}{2}|[#*0-9]\uFE0F?\u20E3|\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:[\u{1F3FB}-\u{1F3FF}])?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:[\u{1F3FB}-\u{1F3FF}])?)*)/u

function columnWidth(codePoint: number, ch: string): number {
  if (/\p{M}/u.test(ch) || /\p{Cf}/u.test(ch) || /\p{Cc}/u.test(ch)) return 0
  return eastAsianWidth(codePoint)
}

export function walkWidth(text: string): WidthUnit[] {
  const units: WidthUnit[] = []
  let index = 0
  while (index < text.length) {
    const slice = text.slice(index)
    const emoji = EMOJI_SEQUENCE.exec(slice)
    if (emoji && emoji[0].length > 0) {
      units.push({ text: emoji[0], cols: 2, emoji: true })
      index += emoji[0].length
      continue
    }
    const codePoint = text.codePointAt(index) ?? 0
    const ch = String.fromCodePoint(codePoint)
    if (/^\p{Regional_Indicator}/u.test(ch)) {
      units.push({ text: ch, cols: 1, emoji: true })
      index += ch.length
      continue
    }
    units.push({ text: ch, cols: columnWidth(codePoint, ch), emoji: false })
    index += ch.length
  }
  return units
}

export function displayColumns(text: string): number {
  return walkWidth(text).reduce((total, unit) => total + unit.cols, 0)
}

export function hasUnsafeEmoji(text: string): boolean {
  return walkWidth(text).some((unit) => unit.emoji)
}

export function wrapUnits(units: WidthUnit[], width: number): WidthUnit[][] {
  const columns = Math.max(1, width)
  const rows: WidthUnit[][] = []
  let row: WidthUnit[] = []
  let used = 0

  const flush = () => {
    if (row.length === 0) return
    rows.push(row)
    row = []
    used = 0
  }

  for (const unit of units) {
    if (unit.cols === 0) {
      row.push(unit)
      continue
    }
    if (used > 0 && used + unit.cols > columns) flush()
    row.push(unit)
    used += unit.cols
    if (unit.cols > columns) flush()
  }
  flush()
  return rows.length > 0 ? rows : [[]]
}
