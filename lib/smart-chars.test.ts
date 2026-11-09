import { describe, expect, it } from "vitest"
import { prepareText, replaceSmartCharacters } from "@/lib/smart-chars"

describe("smart-character replacement", () => {
  it("replaces macOS and iOS substitutions with plain equivalents", () => {
    const result = replaceSmartCharacters("\u201CHi\u201D \u2014 it\u2019s 5\u20136\u2026", "gsm7")
    expect(result.text).toBe('"Hi" - it\'s 5-6...')
    expect(result.replacements.map((entry) => entry.cp)).toEqual([0x201c, 0x201d, 0x2014, 0x2019, 0x2013, 0x2026])
  })

  it("turns special spaces into a normal space and drops invisibles", () => {
    expect(replaceSmartCharacters("1.\u00A0A\u202FB\u2009C\u200BD\uFEFF", "ucs2").text).toBe("1. A B CD")
  })

  it("keeps a guillemet where the encoding has one", () => {
    expect(replaceSmartCharacters("\u00ABOui\u00BB", "gsm7").text).toBe('"Oui"')
    const latin = replaceSmartCharacters("\u00ABOui\u00BB", "latin1")
    expect(latin.text).toBe("\u00ABOui\u00BB")
    expect(latin.replacements).toHaveLength(0)
  })

  it("leaves real letters and direction marks alone", () => {
    expect(replaceSmartCharacters("\u202Bرصيد\u202C é ê", "gsm7").text).toBe("\u202Bرصيد\u202C é ê")
  })

  it("returns segments that mark every replaced character", () => {
    const result = replaceSmartCharacters("a\u2019b\u200Bc", "gsm7")
    expect(result.segments).toEqual([
      { text: "a", replaced: null },
      { text: "'", replaced: { from: "\u2019", cp: 0x2019, name: "RIGHT SINGLE QUOTATION MARK" } },
      { text: "b", replaced: null },
      { text: "", replaced: { from: "\u200B", cp: 0x200b, name: "ZERO WIDTH SPACE" } },
      { text: "c", replaced: null },
    ])
    expect(result.replacements[0]?.index).toBe(1)
  })
})

describe("prepareText", () => {
  it("does not let a smart quote push English out of GSM-7", () => {
    const prepared = prepareText("This week\u2019s offers\u2026")
    expect(prepared.autoEncoding).toBe("gsm7")
    expect(prepared.text).toBe("This week's offers...")
  })

  it("detects each language separately", () => {
    expect(prepareText("Crédit \u00ABépuisé\u00BB").encoding).toBe("gsm7")
    expect(prepareText("Crédit \u00ABépuisé\u00BB").text).toBe('Crédit "épuisé"')
    expect(prepareText("Fenêtre \u00ABépuisée\u00BB").encoding).toBe("latin1")
    expect(prepareText("Fenêtre \u00ABépuisée\u00BB").text).toBe("Fenêtre \u00ABépuisée\u00BB")
    expect(prepareText("1.\u00A0الرصيد").encoding).toBe("ucs2")
    expect(prepareText("1.\u00A0الرصيد").text).toBe("1. الرصيد")
  })

  it("follows a manual override and lists what it cannot hold", () => {
    const forced = prepareText("Crédit \u00ABfenêtre\u00BB", "gsm7")
    expect(forced.autoEncoding).toBe("latin1")
    expect(forced.encoding).toBe("gsm7")
    expect(forced.text).toBe('Crédit "fenêtre"')
    expect(forced.unencodable).toEqual(["ê"])
  })
})
