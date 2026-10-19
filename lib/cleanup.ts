import { isDirectionMark, isGsm } from "@/lib/gsm"
import { characterName, formatCodePoint } from "@/lib/names"
import { codePointLength } from "@/lib/text"

export type CharReason = "space" | "invisible" | "smart" | "fullwidth" | "direction" | "ucs2"

export type ClassifiedChar = {
  cp: number
  ch: string
  name: string
  reason: CharReason
  reasonLabel: string
  replacement: string | null
  autoRemove: boolean
  note: string | null
  standIn: string | null
}

export type Finding = ClassifiedChar & {
  utf16Index: number
  line: number
}

export type CleanupMode = {
  spaces: boolean
  invisibles: boolean
  punctuation: boolean
  fullwidth: boolean
}

export type CleanupResult = {
  text: string
  replacements: number
  ellipsisCount: number
  beforeLength: number
  afterLength: number
}

const SAFE_INVISIBLE = new Set([0x200b, 0xfeff, 0x2060, 0x00ad])
const JOINERS = new Set([0x200c, 0x200d])

const PUNCTUATION: Record<number, string> = {
  0x2018: "'",
  0x2019: "'",
  0x201c: '"',
  0x201d: '"',
  0x2013: "-",
  0x2014: "-",
  0x2026: "...",
}

const STAND_INS: Record<number, string> = {
  0x00a0: "NBSP",
  0x00ad: "SHY",
  0x061c: "ALM",
  0x1680: "OGHAM",
  0x2000: "NQSP",
  0x2001: "MQSP",
  0x2002: "ENSP",
  0x2003: "EMSP",
  0x2004: "3/EM",
  0x2005: "4/EM",
  0x2006: "6/EM",
  0x2007: "FIGSP",
  0x2008: "PUNSP",
  0x2009: "THIN",
  0x200a: "HAIR",
  0x200b: "ZWSP",
  0x200c: "ZWNJ",
  0x200d: "ZWJ",
  0x200e: "LRM",
  0x200f: "RLM",
  0x202a: "LRE",
  0x202b: "RLE",
  0x202c: "PDF",
  0x202f: "NNBSP",
  0x205f: "MMSP",
  0x2060: "WJ",
  0x2066: "LRI",
  0x2067: "RLI",
  0x2068: "FSI",
  0x2069: "PDI",
  0x3000: "IDSP",
  0xfeff: "BOM",
}

const REASON_LABEL: Record<CharReason, string> = {
  space: "looks like a space",
  invisible: "invisible",
  smart: "smart punctuation",
  fullwidth: "fullwidth, two columns",
  direction: "direction mark",
  ucs2: "outside GSM 7-bit, so this page becomes UCS-2",
}

function fullwidthFold(codePoint: number): string | null {
  if (codePoint >= 0xff01 && codePoint <= 0xff5e) {
    return String.fromCodePoint(codePoint - 0xfee0)
  }
  if (codePoint === 0x3000) return " "
  return null
}

function noteFor(codePoint: number, reason: CharReason): string | null {
  if (codePoint === 0x200c) {
    return "Left in place unless you remove this occurrence. It is required in Arabic, Persian, and several other scripts."
  }
  if (codePoint === 0x200d) {
    return "Left in place unless you remove this occurrence. It joins emoji and is meaningful in some scripts."
  }
  if (reason === "direction") {
    return "Left in place. Cleanup does not remove a direction mark."
  }
  if (codePoint === 0x2026) {
    return "Replacing this with three dots makes the text two characters longer."
  }
  if (codePoint === 0x3000) {
    return "This space is two columns wide until it is replaced."
  }
  return null
}

export function classifyChar(ch: string, codePoint = ch.codePointAt(0) ?? 0): ClassifiedChar | null {
  let reason: CharReason | null = null
  let replacement: string | null = null
  let autoRemove = false

  if (isDirectionMark(codePoint)) {
    reason = "direction"
  } else if (codePoint !== 0x20 && /\p{Zs}/u.test(ch)) {
    reason = "space"
    replacement = " "
  } else if (SAFE_INVISIBLE.has(codePoint)) {
    reason = "invisible"
    replacement = ""
    autoRemove = true
  } else if (JOINERS.has(codePoint)) {
    reason = "invisible"
    replacement = ""
  } else if ((/\p{Cf}/u.test(ch) || /\p{Cc}/u.test(ch)) && !isGsm(ch)) {
    reason = "invisible"
    replacement = ""
  } else if (PUNCTUATION[codePoint] !== undefined) {
    reason = "smart"
    replacement = PUNCTUATION[codePoint]
  } else if (codePoint >= 0xff01 && codePoint <= 0xff5e) {
    reason = "fullwidth"
    replacement = fullwidthFold(codePoint)
  } else if (!isGsm(ch)) {
    reason = "ucs2"
  }

  if (!reason) return null

  return {
    cp: codePoint,
    ch,
    name: characterName(codePoint),
    reason,
    reasonLabel: REASON_LABEL[reason],
    replacement,
    autoRemove,
    note: noteFor(codePoint, reason),
    standIn: STAND_INS[codePoint] ?? (reason === "invisible" || reason === "direction" ? formatCodePoint(codePoint) : null),
  }
}

export function scanText(text: string): { findings: Finding[]; firstUcs2: Finding | null } {
  const findings: Finding[] = []
  let line = 1
  let index = 0

  while (index < text.length) {
    if (text.startsWith("\r\n", index)) {
      line += 1
      index += 2
      continue
    }
    const ch = text[index] ?? ""
    if (ch === "\n" || ch === "\r") {
      line += 1
      index += 1
      continue
    }
    const codePoint = text.codePointAt(index) ?? 0
    const glyph = String.fromCodePoint(codePoint)
    const classified = classifyChar(glyph, codePoint)
    if (classified) findings.push({ ...classified, utf16Index: index, line })
    index += glyph.length
  }

  return { findings, firstUcs2: findings[0] ?? null }
}

export function cleanupText(text: string, mode: CleanupMode): CleanupResult {
  let next = ""
  let replacements = 0
  let ellipsisCount = 0

  for (const ch of text) {
    const codePoint = ch.codePointAt(0) ?? 0
    const classified = classifyChar(ch, codePoint)
    if (!classified) {
      next += ch
      continue
    }
    if (classified.reason === "space" && mode.spaces && classified.replacement !== null) {
      next += classified.replacement
      replacements += 1
      continue
    }
    if (classified.reason === "invisible" && classified.autoRemove && mode.invisibles) {
      replacements += 1
      continue
    }
    if (classified.reason === "smart" && mode.punctuation && classified.replacement !== null) {
      next += classified.replacement
      replacements += 1
      if (codePoint === 0x2026) ellipsisCount += 1
      continue
    }
    if (mode.fullwidth) {
      const folded = fullwidthFold(codePoint)
      if (folded !== null && (classified.reason === "fullwidth" || codePoint === 0x3000)) {
        next += folded
        replacements += 1
        continue
      }
    }
    next += ch
  }

  return {
    text: next,
    replacements,
    ellipsisCount,
    beforeLength: codePointLength(text),
    afterLength: codePointLength(next),
  }
}

export function replaceAt(text: string, utf16Index: number, length: number, replacement: string): string {
  return text.slice(0, utf16Index) + replacement + text.slice(utf16Index + length)
}

export const SPACES_AND_INVISIBLES: CleanupMode = {
  spaces: true,
  invisibles: true,
  punctuation: false,
  fullwidth: false,
}

export const SPACES_INVISIBLES_AND_PUNCTUATION: CleanupMode = {
  spaces: true,
  invisibles: true,
  punctuation: true,
  fullwidth: false,
}

export const FULLWIDTH_ONLY: CleanupMode = {
  spaces: false,
  invisibles: false,
  punctuation: false,
  fullwidth: true,
}
