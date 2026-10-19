import { analyze, isGsmExtension, type GsmChar } from "@/lib/gsm"

export type SmsPart = {
  text: string
  septets: number
  units: number
  limit: number
}

export type SmsAnalysis = {
  encoding: "gsm" | "ucs2"
  characters: number
  utf16Units: number
  septets: number
  segments: number
  singleLimit: number
  concatLimit: number
  parts: SmsPart[]
  firstNonGsm: GsmChar | null
  extensionCount: number
}

export function segmentSms(text: string): SmsAnalysis {
  const info = analyze(text)
  const encoding = info.encoding
  const singleLimit = encoding === "gsm" ? 160 : 70
  const concatLimit = encoding === "gsm" ? 153 : 67

  if (text.length === 0) {
    return {
      encoding: "gsm",
      characters: 0,
      utf16Units: 0,
      septets: 0,
      segments: 0,
      singleLimit: 160,
      concatLimit: 153,
      parts: [],
      firstNonGsm: null,
      extensionCount: 0,
    }
  }

  const total = encoding === "gsm" ? info.septets : info.utf16Units
  const limit = total > singleLimit ? concatLimit : singleLimit
  const parts: SmsPart[] = []
  let current = ""
  let currentCost = 0

  const push = () => {
    parts.push({
      text: current,
      septets: encoding === "gsm" ? currentCost : 0,
      units: currentCost,
      limit,
    })
  }

  for (const ch of text) {
    const cost = encoding === "gsm" ? (isGsmExtension(ch) ? 2 : 1) : ch.length
    if (current.length > 0 && currentCost + cost > limit) {
      push()
      current = ch
      currentCost = cost
    } else {
      current += ch
      currentCost += cost
    }
  }
  if (current.length > 0) push()

  return {
    encoding,
    characters: info.characters,
    utf16Units: info.utf16Units,
    septets: encoding === "gsm" ? info.septets : 0,
    segments: parts.length,
    singleLimit,
    concatLimit,
    parts,
    firstNonGsm: info.firstNonGsm,
    extensionCount: info.extensionCount,
  }
}
