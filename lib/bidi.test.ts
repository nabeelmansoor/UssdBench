import { describe, expect, it } from "vitest"
import { layoutPhoneLine, visualPhoneText } from "@/lib/bidi"

const ARABIC = "\u0631\u0635\u064A\u062F"
const ARABIC_READING_ORDER = "\u062F\u064A\u0635\u0631"

describe("phone bidi", () => {
  it("keeps a mixed line's Latin in order and the Arabic in reading order", () => {
    const mixed = `1. Balance ${ARABIC}`
    const visual = `1. Balance ${ARABIC_READING_ORDER}`
    expect(visualPhoneText(mixed)).toBe(visual)
    expect(visualPhoneText(`\u202A${mixed}\u202C`)).toBe(visual)

    const rtl = visualPhoneText(`\u202B${mixed}\u202C`)
    expect(rtl).toContain("Balance")
    expect(rtl).not.toContain("ecnelaB")
    expect(rtl).toContain(ARABIC_READING_ORDER)
    expect(rtl).not.toContain(ARABIC)
  })

  it("does not reverse Latin letters inside RLE, and right-aligns that line", () => {
    expect(visualPhoneText("\u202BMy account\u202C")).toBe("My account")
    expect(visualPhoneText("\u202BMy account\u202C")).not.toBe("tnuocca yM")

    const row = layoutPhoneLine("\u202BMy account\u202C", 16).rows[0] ?? []
    expect(row.map((unit) => unit.text).join("")).toBe("My account")
    expect(row[0]?.column).toBe(6)

    const padded = layoutPhoneLine("\u202BMy account      \u202C", 16).rows[0] ?? []
    expect(padded.map((unit) => unit.text).join("")).toBe("      My account")
    expect(layoutPhoneLine("\u202AMy account\u202C", 16).rows[0]?.[0]?.column).toBe(0)
  })

  it("wraps a long line into separate rows", () => {
    const line = "3. This week\u2019s offers and extra data bundles"
    const layout = layoutPhoneLine(line, 16)
    const texts = layout.rows.map((row) => row.map((unit) => unit.text).join(""))
    expect(texts.length).toBeGreaterThan(1)
    expect(texts.join("")).toBe(line)
    expect(new Set(texts).size).toBe(texts.length)
    for (const row of layout.rows) {
      expect(row.reduce((total, unit) => total + unit.cols, 0)).toBeLessThanOrEqual(16)
    }
  })
})
