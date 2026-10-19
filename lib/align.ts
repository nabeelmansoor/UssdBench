import { splitLines, applyDirection, lineDirection, stripDirectionMarks } from "@/lib/text"
import { displayColumns } from "@/lib/width"

export type AlignMode = "left" | "center" | "right"

export type AlignedLine = {
  lineNumber: number
  source: string
  text: string
  columns: number
  overflow: boolean
  direction: "rtl" | "ltr" | null
}

export function alignLine(line: string, width: number, mode: AlignMode): AlignedLine {
  const direction = lineDirection(line)
  const inner = stripDirectionMarks(line)
  const columns = displayColumns(inner)
  if (columns > width) {
    return { lineNumber: 1, source: line, text: line, columns, overflow: true, direction }
  }
  const deficit = width - columns
  let left = 0
  let right = 0
  if (mode === "right") left = deficit
  else if (mode === "center") {
    left = Math.floor(deficit / 2)
    right = deficit - left
  } else right = deficit
  const padded = `${" ".repeat(left)}${inner}${" ".repeat(right)}`
  const text =
    direction === "rtl" ? `\u202B${padded}\u202C` : direction === "ltr" ? `\u202A${padded}\u202C` : padded
  return { lineNumber: 1, source: line, text, columns, overflow: false, direction }
}

export function alignText(text: string, width: number, mode: AlignMode): AlignedLine[] {
  return splitLines(text).map((line, index) => ({
    ...alignLine(line, width, mode),
    lineNumber: index + 1,
  }))
}

export function alignedCopy(lines: AlignedLine[], lineBreak: "lf" | "cr"): string {
  const br = lineBreak === "cr" ? "\r" : "\n"
  return lines.map((line) => line.text).join(br)
}

export function setLineDirection(text: string, lineIndex: number, direction: "rtl" | "ltr" | "clear"): string {
  const lines = splitLines(text)
  const current = lines[lineIndex]
  if (current === undefined) return text
  lines[lineIndex] = applyDirection(current, direction)
  return lines.join("\n")
}
