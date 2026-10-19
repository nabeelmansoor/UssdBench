import { describe, expect, it } from "vitest"
import { displayColumns } from "@/lib/width"

describe("display width", () => {
  it("gives RLE+PDF zero columns", () => {
    expect(displayColumns("\u202B\u202C")).toBe(0)
    expect(displayColumns("\u202BHello\u202C")).toBe(5)
  })

  it("counts wide and fullwidth characters as two, combining marks as zero, ambiguous as one", () => {
    expect(displayColumns("字")).toBe(2)
    expect(displayColumns("\uFF21")).toBe(2)
    expect(displayColumns("e\u0301")).toBe(1)
    expect(displayColumns("\u2014")).toBe(1)
    expect(displayColumns("ا")).toBe(1)
  })
})
