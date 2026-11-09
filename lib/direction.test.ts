import { describe, expect, it } from "vitest"
import { effectiveDirection, showMarks, unwrapPage, wrapPage } from "@/lib/direction"

describe("page direction marks", () => {
  it("puts one RLE or LRE at the start of the page and PDF at the end", () => {
    expect(wrapPage("a\nb", "rtl")).toBe("\u202Ba\nb\u202C")
    expect(wrapPage("a\nb", "ltr")).toBe("\u202Aa\nb\u202C")
    expect(wrapPage("a\nb", "none")).toBe("a\nb")
    expect(showMarks(wrapPage("a\nb", "rtl"))).toBe("[RLE]a\nb[PDF]")
    expect(unwrapPage("\u202Ba\nb\u202C")).toEqual({ text: "a\nb", direction: "rtl" })
  })

  it("only applies to UCS-2", () => {
    expect(effectiveDirection("rtl", "ucs2")).toBe("rtl")
    expect(effectiveDirection("rtl", "gsm7")).toBe("none")
    expect(effectiveDirection("ltr", "latin1")).toBe("none")
  })
})
