import { describe, expect, it } from "vitest"
import {
  analyze,
  gsmSeptetBudget,
  octetsForSeptets,
  ucs2CharacterBudget,
} from "@/lib/gsm"

describe("GSM budgets", () => {
  it("turns 160 octets into 182 GSM septets or 80 UCS-2 characters", () => {
    expect(gsmSeptetBudget(160)).toBe(182)
    expect(ucs2CharacterBudget(160)).toBe(80)
    expect(octetsForSeptets(182)).toBe(160)
    expect(octetsForSeptets(8)).toBe(7)
    expect(octetsForSeptets(7)).toBe(7)
  })
})

describe("septet packing", () => {
  it("flags a page whose septet count is one below a multiple of eight", () => {
    const seven = analyze("1234567")
    expect(seven.encoding).toBe("gsm")
    expect(seven.septets).toBe(7)
    expect(seven.septets % 8).toBe(7)
    expect(seven.paddingRisk).toBe(true)

    const eight = analyze("12345678")
    expect(eight.paddingRisk).toBe(false)
    expect(eight.septets % 8).toBe(0)
  })

  it("does not use the GSM pad once the page is UCS-2", () => {
    const page = analyze("123456\u2019")
    expect(page.encoding).toBe("ucs2")
    expect(page.utf16Units).toBe(7)
    expect(page.paddingRisk).toBe(false)
  })

  it("counts € as two septets without leaving GSM", () => {
    expect(analyze("€")).toMatchObject({ encoding: "gsm", characters: 1, septets: 2, extensionCount: 1 })
    expect(analyze("12€").septets).toBe(4)
    expect(analyze("\u000C").septets).toBe(2)
  })

  it("keeps GSM letters at one septet and sends ê to UCS-2", () => {
    expect(analyze("é")).toMatchObject({ encoding: "gsm", septets: 1 })
    expect(analyze("ê").encoding).toBe("ucs2")
    expect(analyze("ê").firstNonGsm?.cp).toBe(0x00ea)
  })

  it("counts a carriage return and a line feed as one septet each", () => {
    expect(analyze("a\nb").septets).toBe(3)
    expect(analyze("a\rb").septets).toBe(3)
  })
})

describe("direction marks", () => {
  it("counts RLE+PDF as two UCS-2 characters", () => {
    const marks = analyze("\u202B\u202C")
    expect(marks.encoding).toBe("ucs2")
    expect(marks.utf16Units).toBe(2)
    expect(marks.octets).toBe(4)
    expect(marks.nonGsmCount).toBe(2)
    expect(marks.nonGsmAllDirection).toBe(true)
    expect(marks.paddingRisk).toBe(false)
  })
})
