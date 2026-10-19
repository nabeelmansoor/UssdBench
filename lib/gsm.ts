import { characterName } from "@/lib/names"

/** 3GPP TS 23.038 default alphabet, one septet each. ESC is not a user character. */
const BASIC = new Set<string>([
  "@", "£", "$", "¥", "è", "é", "ù", "ì", "ò", "Ç", "\n", "Ø", "ø", "\r", "Å", "å",
  "Δ", "_", "Φ", "Γ", "Λ", "Ω", "Π", "Ψ", "Σ", "Θ", "Ξ",
  "Æ", "æ", "ß", "É", " ", "!", '"', "#", "¤", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/",
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  ":", ";", "<", "=", ">", "?", "¡",
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "Ä", "Ö", "Ñ", "Ü", "§", "¿",
  ..."abcdefghijklmnopqrstuvwxyz",
  "ä", "ö", "ñ", "ü", "à",
])

/** Extension table. Escape plus the character, so two septets. Does not switch the string to UCS-2. */
const EXTENSION = new Set<string>([
  "\u000C",
  "^",
  "{",
  "}",
  "\\",
  "[",
  "~",
  "]",
  "|",
  "€",
])

export type GsmChar = {
  ch: string
  cp: number
  utf16Index: number
  name: string
}

export type TextAnalysis = {
  encoding: "gsm" | "ucs2"
  characters: number
  utf16Units: number
  septets: number
  octets: number
  firstNonGsm: GsmChar | null
  nonGsmCount: number
  nonGsmAllDirection: boolean
  extensionCount: number
  paddingRisk: boolean
}

export function isGsmBasic(ch: string): boolean {
  return BASIC.has(ch)
}

export function isGsmExtension(ch: string): boolean {
  return EXTENSION.has(ch)
}

export function isGsm(ch: string): boolean {
  return BASIC.has(ch) || EXTENSION.has(ch)
}

export function gsmSeptetBudget(octets: number): number {
  if (octets <= 0) return 0
  return Math.floor((octets * 8) / 7)
}

export function ucs2CharacterBudget(octets: number): number {
  if (octets <= 0) return 0
  return Math.floor(octets / 2)
}

export function octetsForSeptets(septets: number): number {
  if (septets <= 0) return 0
  return Math.ceil((septets * 7) / 8)
}

export function isDirectionMark(codePoint: number): boolean {
  return codePoint === 0x202a || codePoint === 0x202b || codePoint === 0x202c
}

export function analyze(text: string): TextAnalysis {
  let characters = 0
  let septets = 0
  let extensionCount = 0
  let nonGsmCount = 0
  let nonGsmAllDirection = true
  let firstNonGsm: GsmChar | null = null
  let utf16Index = 0

  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0
    characters += 1
    if (BASIC.has(ch)) {
      septets += 1
    } else if (EXTENSION.has(ch)) {
      septets += 2
      extensionCount += 1
    } else {
      nonGsmCount += 1
      if (!isDirectionMark(cp)) nonGsmAllDirection = false
      if (!firstNonGsm) {
        firstNonGsm = { ch, cp, utf16Index, name: characterName(cp) }
      }
    }
    utf16Index += ch.length
  }

  const encoding = nonGsmCount > 0 ? "ucs2" : "gsm"
  if (nonGsmCount === 0) nonGsmAllDirection = false

  return {
    encoding,
    characters,
    utf16Units: text.length,
    septets: encoding === "gsm" ? septets : 0,
    octets: encoding === "gsm" ? octetsForSeptets(septets) : text.length * 2,
    firstNonGsm,
    nonGsmCount,
    nonGsmAllDirection,
    extensionCount: encoding === "gsm" ? extensionCount : 0,
    paddingRisk: encoding === "gsm" && septets > 0 && septets % 8 === 7,
  }
}

export function textFitsBudget(text: string, budgetOctets: number): boolean {
  const info = analyze(text)
  if (info.encoding === "ucs2") return info.utf16Units <= ucs2CharacterBudget(budgetOctets)
  return info.septets <= gsmSeptetBudget(budgetOctets)
}
