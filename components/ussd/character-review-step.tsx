"use client"

import type { ReactNode } from "react"
import { CopyButton } from "@/components/copy-button"
import { EncodingBadge, LanguageTabs } from "@/components/language-tabs"
import { Callout, Panel, ToolCanvas } from "@/components/tool-frame"
import { Button } from "@/components/ui/button"
import type { LanguageUpdater } from "@/components/ussd/pagination-step"
import { classifyChar, replaceAt, scanText, type Finding } from "@/lib/cleanup"
import { canEncode, ENCODING_LABEL, type Encoding } from "@/lib/encoding"
import { getLanguage } from "@/lib/languages"
import { formatCodePoint } from "@/lib/names"
import type { UssdState } from "@/lib/session"
import { copyUssdPages } from "@/lib/ussd-pagination"
import type { UssdDerived } from "@/lib/workflow"

function rowAction(finding: Finding): { label: string; replacement: string } | null {
  if (finding.reason === "direction") return { label: "Remove this mark", replacement: "" }
  if (finding.replacement === "") return { label: "Remove this occurrence", replacement: "" }
  if (finding.replacement) {
    return {
      label: finding.replacement === " " ? "Replace with a space" : `Replace with ${finding.replacement}`,
      replacement: finding.replacement,
    }
  }
  return null
}

function reasonFor(finding: Finding, encoding: Encoding): string {
  if (finding.reason !== "ucs2") return `${finding.reasonLabel}.`
  return canEncode(finding.ch, encoding)
    ? `Outside GSM 7-bit, and fine in ${ENCODING_LABEL[encoding]}.`
    : `Not in ${ENCODING_LABEL[encoding]}. A gateway may drop or garble it.`
}

function isExpectedLetter(finding: Finding, encoding: Encoding): boolean {
  return finding.reason === "ucs2" && /[\p{L}\p{M}\p{N}]/u.test(finding.ch) && canEncode(finding.ch, encoding)
}

function MarkerText({ text, rtl }: { text: string; rtl: boolean }) {
  const nodes: ReactNode[] = []
  let key = 0
  for (const ch of text) {
    if (ch === "\n") {
      nodes.push(<br key={key++} />)
      continue
    }
    const classified = classifyChar(ch)
    const marked =
      classified?.standIn &&
      (classified.reason === "space" || classified.reason === "invisible" || classified.reason === "direction")
    nodes.push(
      marked && classified ? (
        <span
          key={key++}
          title={`${classified.name} ${formatCodePoint(classified.cp)}`}
          className="mx-0.5 inline-flex items-center rounded border border-warn-border bg-warn px-1 align-baseline font-mono text-[0.65rem] font-bold text-warn-foreground"
        >
          {classified.standIn}
        </span>
      ) : (
        <span key={key++}>{ch}</span>
      ),
    )
  }
  return (
    <div dir={rtl ? "rtl" : "ltr"} className="font-mono text-sm leading-7 whitespace-pre-wrap break-words">
      {nodes}
    </div>
  )
}

export function CharacterReviewStep({
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
  const text = info.prepared.text
  const scan = scanText(text)
  const listed = scan.findings.filter((finding) => !isExpectedLetter(finding, info.encoding))
  const expected = scan.findings.length - listed.length

  return (
    <ToolCanvas>
      <Callout>
        This review is optional. It lists what is left after smart characters were replaced: joiners, fullwidth
        lookalikes, direction marks you pasted, and anything {ENCODING_LABEL[info.encoding]} cannot hold. The marks
        added in Alignment are not part of the text and are not listed.
      </Callout>
      <LanguageTabs
        codes={codes}
        active={current.code}
        onSelect={onActive}
        badge={(code) => {
          const entry = derived[code]
          if (!entry) return null
          const count = scanText(entry.prepared.text).findings.filter((finding) => !isExpectedLetter(finding, entry.encoding)).length
          return <EncodingBadge label={String(count)} tone={count > 0 ? "warn" : "plain"} />
        }}
      >
        {text.length === 0 ? (
          <p className="text-sm leading-6 text-muted-foreground">There is no {language.name} text to review.</p>
        ) : (
          <>
            {listed.length === 0 ? (
              <Callout>
                Nothing to review in {language.name}. Every character fits {ENCODING_LABEL[info.encoding]} and nothing is
                hidden.
              </Callout>
            ) : null}
            {expected > 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">
                {expected} letter{expected === 1 ? "" : "s"} outside GSM 7-bit {expected === 1 ? "is" : "are"} expected
                for {language.name} in {ENCODING_LABEL[info.encoding]} and {expected === 1 ? "is" : "are"} not listed.
              </p>
            ) : null}
            <Panel title="Marker view">
              <p className="text-sm leading-6 text-muted-foreground">
                Special spaces, zero-width characters, and direction marks in the text are labeled here.
              </p>
              <div className="rounded-md border border-border bg-muted p-3">
                <MarkerText text={text} rtl={language.rtl} />
              </div>
            </Panel>
            {listed.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border-[1.5px] border-line bg-card">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <thead className="border-b-[1.5px] border-line bg-secondary font-mono text-xs tracking-[0.08em] text-secondary-foreground uppercase">
                    <tr>
                      <th className="px-3 py-1.5 font-semibold">Char</th>
                      <th className="px-3 py-1.5 font-semibold">Name</th>
                      <th className="px-3 py-1.5 font-semibold">Line</th>
                      <th className="px-3 py-1.5 font-semibold">Reason</th>
                      <th className="px-3 py-1.5 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {listed.map((finding, index) => {
                      const action = rowAction(finding)
                      return (
                        <tr key={`${finding.utf16Index}-${index}`} className="align-top odd:bg-card even:bg-muted/50">
                          <td className="px-3 py-1.5 font-mono">
                            {finding.standIn ? (
                              <span className="rounded border border-warn-border bg-warn px-1 py-0.5 text-xs font-bold text-warn-foreground">
                                {finding.standIn}
                              </span>
                            ) : (
                              finding.ch
                            )}
                          </td>
                          <td className="px-3 py-1.5">
                            <span className="font-medium">{finding.name}</span>
                            <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                              {formatCodePoint(finding.cp)}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 font-mono text-muted-foreground">{finding.line}</td>
                          <td className="px-3 py-1.5 leading-6 text-muted-foreground">
                            {reasonFor(finding, info.encoding)}
                            {finding.note ? <span className="mt-1 block">{finding.note}</span> : null}
                          </td>
                          <td className="px-3 py-1.5">
                            {action ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9"
                                onClick={() =>
                                  onLanguage(current.code, {
                                    text: replaceAt(text, finding.utf16Index, finding.ch.length, action.replacement),
                                  })
                                }
                              >
                                {action.label}
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">Keep</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </>
        )}
      </LanguageTabs>
      <Panel title="Finished pages">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {ussd.languages.map((entry) => {
            const pages = derived[entry.code]?.pagination.pages ?? []
            return (
              <CopyButton
                key={entry.code}
                text={copyUssdPages(pages, ussd.lineBreak)}
                label={`Copy ${getLanguage(entry.code).name} · ${pages.length} page${pages.length === 1 ? "" : "s"}`}
              />
            )
          })}
        </div>
      </Panel>
    </ToolCanvas>
  )
}
