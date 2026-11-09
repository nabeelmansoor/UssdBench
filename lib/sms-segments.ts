import { charCost, textCost, type Encoding } from "@/lib/encoding"

/** Single-segment and per-part limits. Latin-1 is sent as 8-bit data: 140 octets, 134 with a concatenation header. */
export const SMS_LIMITS: Record<Encoding, { single: number; part: number }> = {
  gsm7: { single: 160, part: 153 },
  latin1: { single: 140, part: 134 },
  ucs2: { single: 70, part: 67 },
}

export type SmsSegment = { text: string; units: number; limit: number }

export type SmsSegments = {
  encoding: Encoding
  units: number
  segments: SmsSegment[]
  single: number
  part: number
}

export function segmentMessage(text: string, encoding: Encoding): SmsSegments {
  const { single, part } = SMS_LIMITS[encoding]
  const units = textCost(text, encoding)
  const segments: SmsSegment[] = []
  if (text.length === 0) return { encoding, units, segments, single, part }

  const limit = units > single ? part : single
  let current = ""
  let used = 0
  for (const ch of text) {
    const cost = charCost(ch, encoding)
    if (current.length > 0 && used + cost > limit) {
      segments.push({ text: current, units: used, limit })
      current = ""
      used = 0
    }
    current += ch
    used += cost
  }
  if (current.length > 0) segments.push({ text: current, units: used, limit })
  return { encoding, units, segments, single, part }
}
