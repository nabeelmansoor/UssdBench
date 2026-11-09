import { describe, expect, it } from "vitest"
import { canEncode, defaultCharsPerPage, detectEncoding, textCost, unencodable } from "@/lib/encoding"

describe("per-language encoding detection", () => {
  it("keeps English and GSM accents in GSM-7", () => {
    expect(detectEncoding("1. Balance\n2. Help")).toBe("gsm7")
    expect(detectEncoding("Café à 5€")).toBe("gsm7")
    expect(detectEncoding("Si continúa")).toBe("latin1")
  })

  it("uses Latin-1 for French and Spanish letters outside GSM", () => {
    expect(detectEncoding("Crédit épuisé, fenêtre")).toBe("latin1")
    expect(detectEncoding("¿Qué día? Señal ó")).toBe("latin1")
  })

  it("uses UCS-2 for Arabic, Urdu, Hindi, and anything above U+00FF", () => {
    expect(detectEncoding("رصيد")).toBe("ucs2")
    expect(detectEncoding("بیلنس")).toBe("ucs2")
    expect(detectEncoding("शेष राशि")).toBe("ucs2")
    expect(detectEncoding("fenêtre €")).toBe("ucs2")
  })

  it("reports characters a forced encoding cannot hold", () => {
    expect(canEncode("ê", "gsm7")).toBe(false)
    expect(canEncode("ê", "latin1")).toBe(true)
    expect(unencodable("aرb", "latin1").map((entry) => entry.cp)).toEqual([0x0631])
  })
})

describe("characters per page", () => {
  it("defaults to 182, 160, and 80", () => {
    expect(defaultCharsPerPage("gsm7")).toBe(182)
    expect(defaultCharsPerPage("latin1")).toBe(160)
    expect(defaultCharsPerPage("ucs2")).toBe(80)
  })

  it("counts in the encoding's own unit", () => {
    expect(textCost("a€", "gsm7")).toBe(3)
    expect(textCost("a€", "latin1")).toBe(2)
    expect(textCost("a😀", "ucs2")).toBe(3)
    expect(textCost("\u202Bab\u202C", "ucs2")).toBe(4)
  })
})
