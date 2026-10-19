import { describe, expect, it } from "vitest"
import { alignLine, setLineDirection } from "@/lib/align"
import { applyDirection } from "@/lib/text"
import { displayColumns } from "@/lib/width"

describe("alignment and direction", () => {
  it("puts the extra center column on the right", () => {
    expect(alignLine("AB", 5, "center").text).toBe(" AB  ")
    expect(alignLine("AB", 5, "left").text).toBe("AB   ")
    expect(alignLine("AB", 5, "right").text).toBe("   AB")
  })

  it("leaves a line that is already wider than the screen unchanged", () => {
    const line = alignLine("ABCDE", 4, "center")
    expect(line.overflow).toBe(true)
    expect(line.text).toBe("ABCDE")
  })

  it("does not stack a second direction pair", () => {
    const once = applyDirection("Hello", "rtl")
    expect(once).toBe("\u202BHello\u202C")
    expect(applyDirection(once, "rtl")).toBe(once)
    expect(applyDirection(once, "ltr")).toBe("\u202AHello\u202C")
    expect(Array.from(applyDirection(once, "rtl")).filter((ch) => ch === "\u202B")).toHaveLength(1)
    expect(displayColumns(once)).toBe(5)

    const written = setLineDirection("Hello\nNext", 0, "rtl")
    expect(written).toBe("\u202BHello\u202C\nNext")
    expect(setLineDirection(written, 0, "rtl")).toBe(written)
  })

  it("pads inside the direction marks", () => {
    const aligned = alignLine("\u202BHi\u202C", 6, "left")
    expect(aligned.text).toBe("\u202BHi    \u202C")
    expect(displayColumns(aligned.text)).toBe(6)
    expect(aligned.overflow).toBe(false)
  })
})
