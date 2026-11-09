import { describe, expect, it } from "vitest"
import { layoutPhoneLine, paragraphDirection } from "@/lib/bidi"
import { wrapWords } from "@/lib/width"

const BALANCE = "\u0627\u0644\u0631\u0635\u064A\u062F"

describe("phone layout", () => {
  it("keeps Arabic in logical order so the browser can shape and join it", () => {
    const layout = layoutPhoneLine(`1. ${BALANCE}`, 32, "rtl")
    expect(layout.dir).toBe("rtl")
    expect(layout.rows.map((row) => row.text)).toEqual([`1. ${BALANCE}`])
  })

  it("strips the page marks and takes the direction from them", () => {
    expect(layoutPhoneLine(`\u202B${BALANCE}\u202C`, 32)).toMatchObject({ dir: "rtl", rows: [{ text: BALANCE }] })
    expect(layoutPhoneLine("\u202AMy account\u202C", 32)).toMatchObject({ dir: "ltr", rows: [{ text: "My account" }] })
  })

  it("uses the first strong character when there are no marks", () => {
    expect(paragraphDirection(`${BALANCE} 1`)).toBe("rtl")
    expect(paragraphDirection(`1. Balance ${BALANCE}`)).toBe("ltr")
    expect(layoutPhoneLine(`99: ${BALANCE}`, 32).dir).toBe("rtl")
  })

  it("wraps at words and only cuts a word that is wider than the row", () => {
    expect(wrapWords("3. This week's offers and extra data bundles", 16)).toEqual([
      "3. This week's",
      "offers and extra",
      "data bundles",
    ])
    expect(wrapWords("abcdefghij xy", 4)).toEqual(["abcd", "efgh", "ij", "xy"])
    const arabic = layoutPhoneLine("3. عروض هذا الأسبوع وباقات البيانات", 20, "rtl").rows.map((row) => row.text)
    expect(arabic).toEqual(["3. عروض هذا الأسبوع", "وباقات البيانات"])
    for (const row of arabic) expect(row.length).toBeLessThanOrEqual(20)
  })
})
