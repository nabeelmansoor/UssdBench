import { describe, expect, it } from "vitest"
import { textCost } from "@/lib/encoding"
import { copyUssdPages, paginateUssd, type PaginationOptions } from "@/lib/ussd-pagination"

function opts(overrides: Partial<PaginationOptions> = {}): PaginationOptions {
  return { encoding: "gsm7", charsPerPage: 182, mode: "word", nav: null, direction: "none", ...overrides }
}

const NAV = { next: "99: Next", back: "0: Back", nextKey: "99", backKey: "0" }

describe("word pagination", () => {
  it("keeps a menu that fits on one page without navigation", () => {
    const result = paginateUssd("1. Balance\n2. Help", opts({ nav: NAV }))
    expect(result.pages).toHaveLength(1)
    expect(result.pages[0]?.navLines).toEqual([])
  })

  it("breaks between words, mid-line when needed", () => {
    const result = paginateUssd("alpha beta gamma\ndelta", opts({ charsPerPage: 11 }))
    expect(result.pages.map((page) => page.text)).toEqual(["alpha beta", "gamma\ndelta"])
    expect(result.pages[0]?.continues).toBe(true)
    expect(result.pages[1]?.continues).toBe(false)
  })

  it("cuts a single word longer than a page between characters", () => {
    const result = paginateUssd("abcdefghij", opts({ charsPerPage: 4 }))
    expect(result.pages.map((page) => page.text)).toEqual(["abcd", "efgh", "ij"])
    expect(result.pages[0]?.splitWord).toBe(true)
  })
})

describe("line pagination", () => {
  it("moves a whole line to the next page instead of splitting it", () => {
    const result = paginateUssd("1. Balance\n2. Recharge now", opts({ mode: "line", charsPerPage: 20 }))
    expect(result.pages.map((page) => page.bodyLines)).toEqual([["1. Balance"], ["2. Recharge now"]])
  })

  it("splits a single line longer than a page at a word", () => {
    const result = paginateUssd(
      "Menu\n3. This weeks offers and extra data bundles\n4. Help",
      opts({ mode: "line", charsPerPage: 24 }),
    )
    expect(result.pages.map((page) => page.bodyLines)).toEqual([
      ["Menu"],
      ["3. This weeks offers and"],
      ["extra data bundles"],
      ["4. Help"],
    ])
    expect(result.pages[1]?.continues).toBe(true)
    expect(result.pages.every((page) => !page.splitWord)).toBe(true)
  })
})

describe("navigation lines", () => {
  it("reserves Next on the first page, Back and Next in the middle, Back on the last", () => {
    const text = Array.from({ length: 9 }, (_, index) => `${index + 1}. Option`).join("\n")
    const result = paginateUssd(text, opts({ mode: "line", charsPerPage: 40, nav: NAV }))
    expect(result.pages.length).toBeGreaterThan(2)
    expect(result.pages[0]?.navLines).toEqual(["99: Next"])
    expect(result.pages.at(-1)?.navLines).toEqual(["0: Back"])
    for (const page of result.pages.slice(1, -1)) expect(page.navLines).toEqual(["0: Back", "99: Next"])
    for (const page of result.pages) expect(page.cost).toBeLessThanOrEqual(40)
  })

  it("drops navigation that cannot fit and says so", () => {
    const result = paginateUssd("a b c d e f", opts({ charsPerPage: 10, nav: NAV }))
    expect(result.navDropped).toBe(true)
    expect(result.error).toMatch(/do not fit/)
    expect(result.pages.every((page) => page.navLines.length === 0)).toBe(true)
  })

  it("flags a menu key that matches a reply key", () => {
    const text = "99. Old offer\n" + Array.from({ length: 6 }, (_, index) => `${index + 1}. Item`).join("\n")
    const result = paginateUssd(text, opts({ mode: "line", charsPerPage: 30, nav: NAV }))
    expect(result.pages[0]?.clashes).toEqual([{ key: "99", which: "next", line: "99. Old offer" }])
  })
})

describe("direction marks in pagination", () => {
  const ARABIC_79 = "ب".repeat(79)

  it("counts RLE and PDF against the page", () => {
    expect(paginateUssd(ARABIC_79, opts({ encoding: "ucs2", charsPerPage: 80 })).pages).toHaveLength(1)
    const marked = paginateUssd(ARABIC_79, opts({ encoding: "ucs2", charsPerPage: 80, direction: "rtl" }))
    expect(marked.pages).toHaveLength(2)
    for (const page of marked.pages) {
      expect(page.cost).toBeLessThanOrEqual(80)
      expect(page.cost).toBe(textCost(page.text, "ucs2"))
      expect(page.directionMarks).toBe(2)
    }
    expect(marked.pages[0]?.cost).toBe(80)
  })

  it("wraps each whole page once, including navigation, and never single lines", () => {
    const text = Array.from({ length: 8 }, (_, index) => `${index + 1}. خيار رقم`).join("\n")
    const result = paginateUssd(
      text,
      opts({ encoding: "ucs2", charsPerPage: 50, mode: "line", direction: "rtl", nav: { ...NAV, back: "0: رجوع", next: "99: التالي" } }),
    )
    expect(result.pages.length).toBeGreaterThan(1)
    for (const page of result.pages) {
      expect(page.text.startsWith("\u202B")).toBe(true)
      expect(page.text.endsWith("\u202C")).toBe(true)
      expect(page.text.match(/[\u202A\u202B]/g)).toHaveLength(1)
      expect(page.text.match(/\u202C/g)).toHaveLength(1)
      expect(page.cost).toBeLessThanOrEqual(50)
    }
    expect(result.pages[0]?.text.endsWith("99: التالي\u202C")).toBe(true)
  })

  it("uses LRE for a forced left page", () => {
    const result = paginateUssd("शेष राशि", opts({ encoding: "ucs2", charsPerPage: 80, direction: "ltr" }))
    expect(result.pages[0]?.text).toBe("\u202Aशेष राशि\u202C")
  })

  it("keeps marks on copied pages", () => {
    const result = paginateUssd(ARABIC_79, opts({ encoding: "ucs2", charsPerPage: 80, direction: "rtl" }))
    const copied = copyUssdPages(result.pages, "lf")
    expect(copied.match(/\u202B/g)).toHaveLength(2)
  })
})
