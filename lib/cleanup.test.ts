import { describe, expect, it } from "vitest"
import {
  cleanupText,
  FULLWIDTH_ONLY,
  replaceAt,
  scanText,
  SPACES_AND_INVISIBLES,
  SPACES_INVISIBLES_AND_PUNCTUATION,
} from "@/lib/cleanup"

describe("Apple-space cleanup", () => {
  it("replaces NBSP and U+202F with a normal space", () => {
    const result = cleanupText("a\u00A0b\u202Fc", SPACES_AND_INVISIBLES)
    expect(result.text).toBe("a b c")
  })

  it("removes safe invisibles and leaves joiners and direction marks", () => {
    expect(cleanupText("a\u200Bb\u200Cc", SPACES_INVISIBLES_AND_PUNCTUATION).text).toBe("ab\u200Cc")
    expect(cleanupText("\u202Bhi\u202C", SPACES_INVISIBLES_AND_PUNCTUATION).text).toBe("\u202Bhi\u202C")
    expect(cleanupText("رصيد", SPACES_INVISIBLES_AND_PUNCTUATION).text).toBe("رصيد")
    expect(cleanupText("é", SPACES_INVISIBLES_AND_PUNCTUATION).text).toBe("é")
  })

  it("replaces an ellipsis only when punctuation cleanup is included", () => {
    expect(cleanupText("Wait\u2026", SPACES_AND_INVISIBLES).text).toBe("Wait\u2026")
    const replaced = cleanupText("Wait\u2026", SPACES_INVISIBLES_AND_PUNCTUATION)
    expect(replaced.text).toBe("Wait...")
    expect(replaced.afterLength - replaced.beforeLength).toBe(2)
    expect(replaced.ellipsisCount).toBe(1)
  })

  it("folds a fullwidth digit and lists direction marks without removing them", () => {
    expect(cleanupText("\uFF11", FULLWIDTH_ONLY).text).toBe("1")
    const scan = scanText("\u202BHi\u202C")
    expect(scan.findings.map((finding) => finding.reason)).toEqual(["direction", "direction"])
    expect(scan.firstUcs2?.reason).toBe("direction")
  })

  it("lists a no-break space on its line and replaces one occurrence", () => {
    const scan = scanText("a\u00A0b")
    expect(scan.findings[0]).toMatchObject({
      cp: 0x00a0,
      reason: "space",
      reasonLabel: "looks like a space",
      line: 1,
    })
    expect(replaceAt("a\u00A0b\u00A0c", 1, 1, " ")).toBe("a b\u00A0c")
  })
})
