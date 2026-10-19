import { describe, expect, it } from "vitest"
import { analyze } from "@/lib/gsm"
import { copyPages, paginate, type PaginateOptions } from "@/lib/paginate"

function opts(overrides: Partial<PaginateOptions> = {}): PaginateOptions {
  return {
    budgetOctets: 160,
    withLinks: false,
    nextLine: "99: Next",
    backLine: "0: Back",
    nextKey: "99",
    backKey: "0",
    ...overrides,
  }
}

describe("pagination", () => {
  it("warns when a GSM page is one septet below a multiple of eight", () => {
    const pages = paginate("1234567", opts())
    expect(pages).toHaveLength(1)
    expect(pages[0]?.analysis.septets).toBe(7)
    expect(pages[0]?.paddingWarning).toBe(true)
    expect(pages[0]?.overflow).toBeNull()
  })

  it("does not warn on a UCS-2 page", () => {
    const pages = paginate("123456\u2019", opts())
    expect(pages[0]?.analysis.encoding).toBe("ucs2")
    expect(pages[0]?.paddingWarning).toBe(false)
    expect(pages[0]?.singleCharacterCause).toBe(true)
    expect(pages[0]?.ucs2Cause?.cp).toBe(0x2019)
  })

  it("does not split a numbered menu line", () => {
    const pages = paginate("Hello\n1. Buy airtime", opts({ budgetOctets: 14 }))
    expect(pages.map((page) => page.bodyLines)).toEqual([["Hello"], ["1. Buy airtime"]])
    expect(pages.every((page) => page.overflow === null)).toBe(true)
  })

  it("names a menu line that cannot fit even alone, and still paginates the rest", () => {
    const pages = paginate("1. Buy airtime\n2. Help", opts({ budgetOctets: 10 }))
    expect(pages[0]?.overflow).toMatchObject({
      line: "1. Buy airtime",
      lineNumber: 1,
      reason: "alone",
      encoding: "gsm",
    })
    expect(pages[1]?.bodyLines).toEqual(["2. Help"])
  })

  it("wraps prose on a word boundary", () => {
    const pages = paginate("alpha beta gamma", opts({ budgetOctets: 11 }))
    expect(pages.map((page) => page.text)).toEqual(["alpha beta", "gamma"])
  })

  it("keeps an embedding and its PDF on one page", () => {
    const line = "\u202BBuy airtime\u202C"
    const pages = paginate(`${line}\n2. Help`, opts({ budgetOctets: 30 }))
    expect(pages[0]?.bodyLines).toEqual([line])
    expect(pages[0]?.text.startsWith("\u202B")).toBe(true)
    expect(pages[0]?.text.endsWith("\u202C")).toBe(true)
    expect(pages[0]?.analysis.encoding).toBe("ucs2")
    expect(pages[1]?.bodyLines).toEqual(["2. Help"])
  })

  it("counts direction marks in an overflow against the UCS-2 budget", () => {
    const line = `\u202B1. ${"A".repeat(90)}\u202C`
    const pages = paginate(`${line}\nOK`, opts())
    expect(analyze(line).utf16Units).toBe(95)
    expect(pages[0]?.overflow).toMatchObject({
      units: 95,
      limit: 80,
      encoding: "ucs2",
      directionMarks: 2,
      lineNumber: 1,
      reason: "alone",
    })
    expect(pages[1]?.bodyLines).toEqual(["OK"])
  })

  it("lets navigation lines consume the same budget", () => {
    const lines = ["99. AB", ...Array.from({ length: 7 }, (_, index) => `${index + 2}. ABC`)].join("\n")
    const bare = paginate(lines, opts({ budgetOctets: 27, withLinks: false }))
    const linked = paginate(
      lines,
      opts({
        budgetOctets: 27,
        withLinks: true,
        nextLine: "99: Next",
        backLine: "0: Back",
        nextKey: "99",
        backKey: "0",
      }),
    )

    expect(bare).toHaveLength(2)
    expect(linked.length).toBeGreaterThan(bare.length)
    expect(linked[0]?.navLines).toEqual(["99: Next"])
    expect(linked[0]?.clashes).toEqual([{ key: "99", lineNumber: 1, which: "next" }])
    expect(linked.at(-1)?.navLines).toEqual(["0: Back"])
    expect(linked.slice(1, -1).every((page) => page.navLines.join("\n") === "0: Back\n99: Next")).toBe(true)
    for (const page of linked) {
      for (const line of page.bodyLines) expect(line).toMatch(/^\d+\. AB[C]?$/)
    }
  })

  it("omits navigation when the screen already fits", () => {
    const pages = paginate("1. Balance\n2. Help", opts({ withLinks: true }))
    expect(pages).toHaveLength(1)
    expect(pages[0]?.navLines).toEqual([])
  })

  it("copies pages with a blank line between them and the chosen break", () => {
    const pages = paginate("Hello\n1. Buy airtime", opts({ budgetOctets: 14 }))
    expect(copyPages(pages, "lf")).toBe("Hello\n\n1. Buy airtime")
    expect(copyPages(pages, "cr")).toBe("Hello\r\r1. Buy airtime")
  })
})
