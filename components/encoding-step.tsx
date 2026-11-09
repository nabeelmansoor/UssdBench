"use client"

import { Callout, Panel } from "@/components/tool-frame"
import { Button } from "@/components/ui/button"
import { ENCODING_LABEL, ENCODINGS, unencodable, type Encoding } from "@/lib/encoding"
import { getLanguage } from "@/lib/languages"
import { formatCodePoint } from "@/lib/names"
import { replaceSmartCharacters, type PreparedText } from "@/lib/smart-chars"

function detectionReason(raw: string, encoding: Encoding): string {
  if (raw.length === 0) return "No text yet, so GSM-7 is assumed."
  const folded = replaceSmartCharacters(raw, "gsm7").text
  if (encoding === "gsm7") return "Every character is in the GSM 7-bit alphabet."
  if (encoding === "latin1") {
    const first = unencodable(folded, "gsm7")[0]
    return first
      ? `${first.ch} (${formatCodePoint(first.cp)}) is outside GSM-7, and every character fits Latin-1.`
      : "Every character fits Latin-1."
  }
  const first = unencodable(folded, "latin1")[0]
  return first ? `${first.ch} (${formatCodePoint(first.cp)}) is outside GSM-7 and Latin-1.` : "Needs UCS-2."
}

export function EncodingStep({
  languages,
  prepared,
  detail,
  onEncoding,
}: {
  languages: { code: string; text: string; encoding: Encoding | null }[]
  prepared: Record<string, PreparedText>
  detail: (code: string, encoding: Encoding) => React.ReactNode
  onEncoding: (code: string, encoding: Encoding | null) => void
}) {
  return (
    <div className="grid gap-5">
      {languages.map((language) => {
        const info = prepared[language.code]!
        const name = getLanguage(language.code).name
        const overridden = language.encoding !== null && language.encoding !== info.autoEncoding
        return (
          <Panel
            key={language.code}
            title={name}
            note={
              <span className="font-mono text-xs">
                Detected {ENCODING_LABEL[info.autoEncoding]}
                {overridden ? ` · using ${ENCODING_LABEL[info.encoding]}` : ""}
              </span>
            }
          >
            <p className="text-sm leading-6 text-muted-foreground">{detectionReason(language.text, info.autoEncoding)}</p>
            <div className="segmented" role="group" aria-label={`${name} encoding`}>
              {ENCODINGS.map((encoding) => (
                <Button
                  key={encoding}
                  type="button"
                  className="h-11 min-w-28"
                  variant={info.encoding === encoding ? "default" : "outline"}
                  aria-pressed={info.encoding === encoding}
                  onClick={() => onEncoding(language.code, encoding === info.autoEncoding ? null : encoding)}
                >
                  {ENCODING_LABEL[encoding]}
                  {encoding === info.autoEncoding ? (
                    <span className="font-mono text-[0.6rem] tracking-wider uppercase opacity-75">auto</span>
                  ) : null}
                </Button>
              ))}
            </div>
            {info.unencodable.length > 0 ? (
              <Callout tone="danger">
                {ENCODING_LABEL[info.encoding]} cannot hold{" "}
                {info.unencodable
                  .slice(0, 6)
                  .map((ch) => `${ch} (${formatCodePoint(ch.codePointAt(0) ?? 0)})`)
                  .join(", ")}
                {info.unencodable.length > 6 ? ` and ${info.unencodable.length - 6} more` : ""}. A gateway would drop or
                garble {info.unencodable.length === 1 ? "it" : "them"}. Pick {ENCODING_LABEL[info.autoEncoding]} or edit
                the text.
              </Callout>
            ) : null}
            {overridden ? (
              <div>
                <Button type="button" variant="outline" className="h-10" onClick={() => onEncoding(language.code, null)}>
                  Use detected {ENCODING_LABEL[info.autoEncoding]}
                </Button>
              </div>
            ) : null}
            <div className="text-sm leading-6">{detail(language.code, info.encoding)}</div>
          </Panel>
        )
      })}
    </div>
  )
}
