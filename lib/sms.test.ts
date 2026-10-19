import { describe, expect, it } from "vitest"
import { segmentSms } from "@/lib/sms"

describe("SMS segments", () => {
  it("shows zeros for an empty message", () => {
    expect(segmentSms("")).toMatchObject({
      encoding: "gsm",
      characters: 0,
      septets: 0,
      segments: 0,
      parts: [],
    })
  })

  it("flips the whole message to UCS-2 because of one curly quote", () => {
    expect(segmentSms("Hello")).toMatchObject({ encoding: "gsm", septets: 5, segments: 1 })
    const curly = segmentSms("Hello\u2019")
    expect(curly.encoding).toBe("ucs2")
    expect(curly.segments).toBe(1)
    expect(curly.utf16Units).toBe(6)
    expect(curly.firstNonGsm?.cp).toBe(0x2019)
    expect(curly.singleLimit).toBe(70)
    expect(curly.concatLimit).toBe(67)
  })

  it("splits 161 GSM septets into 153 + 8", () => {
    const sms = segmentSms("A".repeat(161))
    expect(sms.encoding).toBe("gsm")
    expect(sms.segments).toBe(2)
    expect(sms.parts.map((part) => part.septets)).toEqual([153, 8])
    expect(sms.parts.every((part) => part.limit === 153)).toBe(true)
  })

  it("keeps 160 septets in one segment", () => {
    const sms = segmentSms("A".repeat(160))
    expect(sms.segments).toBe(1)
    expect(sms.parts[0]?.limit).toBe(160)
    expect(sms.parts[0]?.septets).toBe(160)
  })

  it("counts € as two septets inside GSM segmentation", () => {
    expect(segmentSms("€")).toMatchObject({ encoding: "gsm", septets: 2, segments: 1 })
    const many = segmentSms("€".repeat(81))
    expect(many.encoding).toBe("gsm")
    expect(many.septets).toBe(162)
    expect(many.segments).toBe(2)
    expect(many.parts.map((part) => part.septets)).toEqual([152, 10])
  })

  it("uses 70 and then 67 for UCS-2", () => {
    expect(segmentSms("ê".repeat(70)).segments).toBe(1)
    expect(segmentSms("ê".repeat(71)).parts.map((part) => part.units)).toEqual([67, 4])
  })
})
