import { describe, expect, it } from "vitest"
import { deriveSms, deriveUssd, newSmsLanguage, newUssdLanguage } from "@/lib/workflow"

const SETTINGS = { withLinks: true, mode: "line" as const }

describe("per-language USSD workflow", () => {
  it("defaults characters per page from the detected encoding", () => {
    expect(deriveUssd({ ...newUssdLanguage("en"), text: "Hello\u2019s" }, SETTINGS).charsPerPage).toBe(182)
    expect(deriveUssd({ ...newUssdLanguage("fr"), text: "Fenêtre" }, SETTINGS).charsPerPage).toBe(160)
    expect(deriveUssd({ ...newUssdLanguage("ar"), text: "رصيد" }, SETTINGS).charsPerPage).toBe(80)
    expect(deriveUssd({ ...newUssdLanguage("ar"), text: "رصيد", charsPerPage: 70 }, SETTINGS).charsPerPage).toBe(70)
  })

  it("forces Arabic right to left and leaves a GSM-7 language unmarked", () => {
    const arabic = deriveUssd({ ...newUssdLanguage("ar"), text: "1. الرصيد" }, SETTINGS)
    expect(arabic.direction).toBe("rtl")
    expect(arabic.pagination.pages[0]?.text).toBe("\u202B1. الرصيد\u202C")

    const english = deriveUssd({ ...newUssdLanguage("en"), text: "1. Balance", direction: "rtl" }, SETTINGS)
    expect(english.chosenDirection).toBe("rtl")
    expect(english.direction).toBe("none")
    expect(english.pagination.pages[0]?.text).toBe("1. Balance")
  })

  it("uses each language's own Next and Back labels", () => {
    const arabic = deriveUssd(newUssdLanguage("ar"), SETTINGS)
    expect(arabic.nextLine).toBe("99: التالي")
    expect(arabic.backLine).toBe("0: رجوع")
  })
})

describe("per-language SMS workflow", () => {
  it("segments the replaced text in its own encoding", () => {
    const sms = deriveSms({ ...newSmsLanguage("en"), text: `${"A".repeat(158)}\u2019\u2026` })
    expect(sms.encoding).toBe("gsm7")
    expect(sms.segments.units).toBe(162)
    expect(sms.segments.segments).toHaveLength(2)
  })
})
