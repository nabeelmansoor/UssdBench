"use client"

import { EncodingBadge, LanguageTabs } from "@/components/language-tabs"
import { LanguagePicker } from "@/components/language-picker"
import { ReplacementSummary, SmartTextView } from "@/components/smart-text"
import { Panel } from "@/components/tool-frame"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ENCODING_LABEL } from "@/lib/encoding"
import { getLanguage } from "@/lib/languages"
import type { PreparedText } from "@/lib/smart-chars"

export function InputStep({
  languages,
  active,
  prepared,
  textLabel,
  placeholder,
  sample,
  onAdd,
  onRemove,
  onActive,
  onText,
}: {
  languages: { code: string; text: string }[]
  active: string
  prepared: Record<string, PreparedText>
  textLabel: string
  placeholder: string
  sample: (code: string) => string | null
  onAdd: (code: string) => void
  onRemove: (code: string) => void
  onActive: (code: string) => void
  onText: (code: string, text: string) => void
}) {
  const codes = languages.map((language) => language.code)
  const current = languages.find((language) => language.code === active) ?? languages[0]!
  const info = prepared[current.code]!
  const language = getLanguage(current.code)
  const sampleText = sample(current.code)
  const fieldId = `text-${current.code}`

  return (
    <>
      <Panel title="Languages" note={`${codes.length} selected`}>
        <p className="text-sm leading-6 text-muted-foreground">
          Each language is a separate menu with its own text, encoding, and pages.
        </p>
        <LanguagePicker selected={codes} onAdd={onAdd} onRemove={onRemove} />
      </Panel>

      <LanguageTabs
        codes={codes}
        active={current.code}
        onSelect={onActive}
        badge={(code) => {
          const entry = prepared[code]
          return entry && languages.find((item) => item.code === code)?.text ? (
            <EncodingBadge label={ENCODING_LABEL[entry.encoding]} />
          ) : null
        }}
      >
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="grid content-start gap-2">
            <Label htmlFor={fieldId} className="font-semibold">
              {textLabel} · {language.name}
            </Label>
            <Textarea
              id={fieldId}
              dir={language.rtl ? "rtl" : "ltr"}
              lang={current.code}
              value={current.text}
              onChange={(event) => onText(current.code, event.target.value)}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              placeholder={placeholder}
              className="field-sizing-fixed max-h-96 min-h-48 overflow-auto font-mono text-sm leading-6"
            />
            <div className="flex flex-wrap gap-2.5">
              {sampleText ? (
                <Button type="button" variant="outline" className="h-10" onClick={() => onText(current.code, sampleText)}>
                  Load {language.name} sample
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="h-10"
                disabled={current.text.length === 0}
                onClick={() => onText(current.code, "")}
              >
                Clear
              </Button>
            </div>
          </div>
          <div className="grid content-start gap-2">
            <p className="flex items-center justify-between gap-2 text-sm font-semibold">
              As sent
              <span className="font-mono text-xs font-medium text-muted-foreground">
                Highlighted = replaced
              </span>
            </p>
            {current.text.length > 0 ? (
              <SmartTextView segments={info.segments} rtl={language.rtl} />
            ) : (
              <p className="grid min-h-48 place-items-center rounded-md border-[1.5px] border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                Type or paste the {language.name} text.
              </p>
            )}
            {current.text.length > 0 ? <ReplacementSummary replacements={info.replacements} /> : null}
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          Curly quotes, en and em dashes, ellipses, no-break and other special spaces, and zero-width characters are
          replaced with their {ENCODING_LABEL[info.encoding]} equivalents. Your typed text is kept, so the replacement
          follows the encoding if you change it in the next step.
        </p>
      </LanguageTabs>
    </>
  )
}
