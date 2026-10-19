import { isDirectionMark } from "@/lib/gsm"

export function splitLines(text: string): string[] {
  if (text === "") return []
  return text.split(/\r\n|\n|\r/)
}

export function codePointLength(text: string): number {
  return Array.from(text).length
}

export function stripDirectionMarks(text: string): string {
  return text.replace(/[\u202A\u202B\u202C]/g, "")
}

export function lineDirection(line: string): "rtl" | "ltr" | null {
  if (line.startsWith("\u202B") && line.endsWith("\u202C")) return "rtl"
  if (line.startsWith("\u202A") && line.endsWith("\u202C")) return "ltr"
  return null
}

export function applyDirection(line: string, direction: "rtl" | "ltr" | "clear"): string {
  const inner = stripDirectionMarks(line)
  if (direction === "clear") return inner
  const open = direction === "rtl" ? "\u202B" : "\u202A"
  const next = `${open}${inner}\u202C`
  return next === line ? line : next
}

export function countDirectionMarks(text: string): number {
  let count = 0
  for (const ch of text) {
    const codePoint = ch.codePointAt(0) ?? 0
    if (isDirectionMark(codePoint)) count += 1
  }
  return count
}

export function isMenuLine(line: string): boolean {
  const stripped = stripDirectionMarks(line).trimStart()
  return /^(?:\d+|[#*])(?:\s*[.):\-]\s*|\s+)\S/.test(stripped)
}

export function hasEmbeddingPair(line: string): boolean {
  return /[\u202A\u202B]/.test(line) && line.includes("\u202C")
}

export function optionKey(line: string): string | null {
  const stripped = stripDirectionMarks(line).trimStart()
  const match = /^(\d+|[#*])(?=\s|[.):\-])/.exec(stripped)
  return match?.[1] ?? null
}

export function isReplyKey(key: string): boolean {
  return /^(?:\d+|[#*])$/.test(key)
}

export function composeReply(key: string, separator: string, label: string): string {
  return `${key}${separator}${label}`.replace(/[\r\n]/g, "")
}
