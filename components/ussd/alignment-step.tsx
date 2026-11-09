"use client"

import { AlignLeft, AlignRight, Ban } from "lucide-react"
import { EncodingBadge, LanguageTabs } from "@/components/language-tabs"
import { ToolWorkLayout } from "@/components/tool-work-layout"
import { Callout, Panel } from "@/components/tool-frame"
import { Button } from "@/components/ui/button"
import { PagesList, usePagedPhone } from "@/components/ussd/pages-view"
import type { LanguageUpdater } from "@/components/ussd/pagination-step"
import type { ForcedDirection } from "@/lib/direction"
import { ENCODING_LABEL } from "@/lib/encoding"
import { getLanguage } from "@/lib/languages"
import type { UssdState } from "@/lib/session"
import type { UssdDerived } from "@/lib/workflow"

const OPTIONS: { value: ForcedDirection; label: string; mark: string; Icon: typeof AlignLeft }[] = [
  { value: "rtl", label: "Right", mark: "RLE U+202B", Icon: AlignRight },
  { value: "ltr", label: "Left", mark: "LRE U+202A", Icon: AlignLeft },
  { value: "none", label: "None", mark: "no marks", Icon: Ban },
]

export function AlignmentStep({
  ussd,
  derived,
  onLanguage,
  onActive,
}: {
  ussd: UssdState
  derived: Record<string, UssdDerived>
  onLanguage: LanguageUpdater
  onActive: (code: string) => void
}) {
  const codes = ussd.languages.map((language) => language.code)
  const current = ussd.languages.find((language) => language.code === ussd.active) ?? ussd.languages[0]!
  const info = derived[current.code]!
  const language = getLanguage(current.code)
  const tracker = usePagedPhone(info, current.code)
  const applies = info.encoding === "ucs2"

  return (
    <ToolWorkLayout
      main={
        <>
          <Panel title="How alignment works">
            <p className="text-sm leading-6">
              Alignment forces the direction of each page. <strong>Right</strong> puts RLE (U+202B) at the start of every
              page, <strong>Left</strong> puts LRE (U+202A) there, and PDF (U+202C) closes every page. Lines inside a page
              are not marked. Both marks count against Characters per Page, so pages are rebuilt when you change this.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Direction marks only exist in UCS-2. GSM-7 and Latin-1 languages are sent without them.
            </p>
          </Panel>
          <LanguageTabs
            codes={codes}
            active={current.code}
            onSelect={onActive}
            badge={(code) => {
              const entry = derived[code]
              if (!entry) return null
              if (entry.encoding !== "ucs2") return <EncodingBadge label="n/a" />
              return <EncodingBadge label={entry.direction === "rtl" ? "RLE" : entry.direction === "ltr" ? "LRE" : "none"} />
            }}
          >
            <fieldset disabled={!applies} aria-describedby={`align-note-${current.code}`} className="grid gap-3 disabled:opacity-60">
              <legend className="mb-1 text-sm font-semibold">{language.name} direction</legend>
              <div className="segmented" role="group" aria-label={`${language.name} direction`}>
                {OPTIONS.map(({ value, label, mark, Icon }) => {
                  const on = applies && info.direction === value
                  return (
                    <Button
                      key={value}
                      type="button"
                      className="h-14 min-w-28 flex-col gap-0"
                      variant={on ? "default" : "outline"}
                      aria-pressed={on}
                      onClick={() => onLanguage(current.code, { direction: value })}
                    >
                      <span className="flex items-center gap-1.5">
                        <Icon aria-hidden="true" />
                        {label}
                      </span>
                      <span className="font-mono text-[0.6rem] tracking-wider uppercase opacity-75">{mark}</span>
                    </Button>
                  )
                })}
              </div>
            </fieldset>
            {applies ? (
              <p id={`align-note-${current.code}`} className="text-sm leading-6 text-muted-foreground">
                {info.direction === "none"
                  ? `${language.name} pages are sent without direction marks.`
                  : `Each ${language.name} page costs 2 of its ${info.charsPerPage} characters for the marks.`}
              </p>
            ) : (
              <Callout tone="warning">
                <span id={`align-note-${current.code}`}>
                  Alignment is off for {language.name} because it is {ENCODING_LABEL[info.encoding]}. RLE, LRE, and PDF are
                  outside {ENCODING_LABEL[info.encoding]}, so adding them would switch every page to UCS-2. Change the
                  encoding in step 2 to use it.
                </span>
              </Callout>
            )}
            <div className="lg:hidden">{tracker.phone}</div>
            <PagesList
              derived={info}
              code={current.code}
              lineBreak={ussd.lineBreak}
              visible={tracker.visible}
              setVisible={tracker.setVisible}
              register={tracker.register}
            />
          </LanguageTabs>
        </>
      }
      aside={<div className="hidden lg:block">{tracker.phone}</div>}
    />
  )
}
