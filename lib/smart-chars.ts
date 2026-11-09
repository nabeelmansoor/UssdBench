import { canEncode, detectEncoding, type Encoding } from "@/lib/encoding"
import { characterName } from "@/lib/names"

type Rule = Record<Encoding, string>

const same = (value: string): Rule => ({ gsm7: value, latin1: value, ucs2: value })

/**
 * macOS and iOS smart substitutions and the special spaces a paste brings along.
 * Each maps to the closest character the target encoding can hold. Guillemets stay where the encoding has them.
 */
const RULES: Record<number, Rule> = {
  0x2018: same("'"),
  0x2019: same("'"),
  0x201a: same("'"),
  0x201b: same("'"),
  0x2032: same("'"),
  0x201c: same('"'),
  0x201d: same('"'),
  0x201e: same('"'),
  0x201f: same('"'),
  0x2033: same('"'),
  0x00ab: { gsm7: '"', latin1: "\u00AB", ucs2: "\u00AB" },
  0x00bb: { gsm7: '"', latin1: "\u00BB", ucs2: "\u00BB" },
  0x2039: { gsm7: "'", latin1: "'", ucs2: "\u2039" },
  0x203a: { gsm7: "'", latin1: "'", ucs2: "\u203A" },
  0x2010: same("-"),
  0x2011: same("-"),
  0x2012: same("-"),
  0x2013: same("-"),
  0x2014: same("-"),
  0x2015: same("-"),
  0x2212: same("-"),
  0x2026: same("..."),
  0x00a0: same(" "),
  0x1680: same(" "),
  0x2000: same(" "),
  0x2001: same(" "),
  0x2002: same(" "),
  0x2003: same(" "),
  0x2004: same(" "),
  0x2005: same(" "),
  0x2006: same(" "),
  0x2007: same(" "),
  0x2008: same(" "),
  0x2009: same(" "),
  0x200a: same(" "),
  0x202f: same(" "),
  0x205f: same(" "),
  0x3000: same(" "),
  0x200b: same(""),
  0x2060: same(""),
  0xfeff: same(""),
  0x00ad: same(""),
}

export function isSmartCharacter(ch: string): boolean {
  return RULES[ch.codePointAt(0) ?? 0] !== undefined
}

export type SmartReplacement = {
  from: string
  to: string
  cp: number
  name: string
  /** UTF-16 index of the replacement in the output text. */
  index: number
}

export type SmartSegment = {
  text: string
  replaced: Omit<SmartReplacement, "index" | "to"> | null
}

export type SmartResult = {
  text: string
  replacements: SmartReplacement[]
  segments: SmartSegment[]
}

export function replaceSmartCharacters(text: string, target: Encoding): SmartResult {
  let out = ""
  let plain = ""
  const replacements: SmartReplacement[] = []
  const segments: SmartSegment[] = []

  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0
    const rule = RULES[cp]
    const to = rule?.[target]
    if (to === undefined || to === ch) {
      plain += ch
      out += ch
      continue
    }
    if (plain) segments.push({ text: plain, replaced: null })
    plain = ""
    const name = characterName(cp)
    replacements.push({ from: ch, to, cp, name, index: out.length })
    segments.push({ text: to, replaced: { from: ch, cp, name } })
    out += to
  }
  if (plain) segments.push({ text: plain, replaced: null })
  return { text: out, replacements, segments }
}

export type PreparedText = SmartResult & {
  autoEncoding: Encoding
  encoding: Encoding
  /** Characters still in the text that the chosen encoding cannot hold. */
  unencodable: string[]
}

/**
 * Picks the encoding from the text once smart characters are folded to GSM-7, then replaces
 * the smart characters for the chosen encoding (the override when there is one).
 */
export function prepareText(raw: string, override: Encoding | null = null): PreparedText {
  const autoEncoding = detectEncoding(replaceSmartCharacters(raw, "gsm7").text)
  const encoding = override ?? autoEncoding
  const result = replaceSmartCharacters(raw, encoding)
  const missing = new Set<string>()
  for (const ch of result.text) {
    if (!canEncode(ch, encoding)) missing.add(ch)
  }
  return { ...result, autoEncoding, encoding, unencodable: [...missing] }
}
