import { describe, expect, it } from "vitest"
import { segmentMessage } from "@/lib/sms-segments"

describe("SMS segments per encoding", () => {
  it("uses 160 / 153 for GSM-7", () => {
    expect(segmentMessage("A".repeat(160), "gsm7").segments).toHaveLength(1)
    expect(segmentMessage("A".repeat(161), "gsm7").segments.map((part) => part.units)).toEqual([153, 8])
  })

  it("does not split a GSM extension character across segments", () => {
    const parts = segmentMessage(`${"A".repeat(152)}€B${"C".repeat(10)}`, "gsm7").segments
    expect(parts[0]?.units).toBe(152)
    expect(parts[1]?.text.startsWith("€")).toBe(true)
  })

  it("uses 140 / 134 for Latin-1 and 70 / 67 for UCS-2", () => {
    expect(segmentMessage("é".repeat(140), "latin1").segments).toHaveLength(1)
    expect(segmentMessage("é".repeat(141), "latin1").segments.map((part) => part.units)).toEqual([134, 7])
    expect(segmentMessage("ب".repeat(70), "ucs2").segments).toHaveLength(1)
    expect(segmentMessage("ب".repeat(71), "ucs2").segments.map((part) => part.units)).toEqual([67, 4])
  })

  it("shows zero segments for an empty message", () => {
    expect(segmentMessage("", "gsm7")).toMatchObject({ units: 0, segments: [] })
  })
})
