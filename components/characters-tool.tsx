"use client"

import type { ReactNode } from "react"
import { BufferEditor } from "@/components/buffer-controls"
import { CleanupActions } from "@/components/cleanup-actions"
import { CounterStrip } from "@/components/counter-strip"
import { Callout, Reading, ToolCanvas, ToolIntro } from "@/components/tool-frame"
import { Button } from "@/components/ui/button"
import { classifyChar, replaceAt, scanText, type Finding } from "@/lib/cleanup"
import { formatCodePoint } from "@/lib/names"
import { useSession } from "@/lib/session"

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

function MarkerText({ text }: { text: string }) {
  const nodes: ReactNode[] = []
  let index = 0
  let key = 0
  while (index < text.length) {
    if (text.startsWith("\r\n", index)) {
      nodes.push(<br key={key} />)
      key += 1
      index += 2
      continue
    }
    const current = text[index] ?? ""
    if (current === "\n" || current === "\r") {
      nodes.push(<br key={key} />)
      key += 1
      index += 1
      continue
    }
    const codePoint = text.codePointAt(index) ?? 0
    const ch = String.fromCodePoint(codePoint)
    const classified = classifyChar(ch, codePoint)
    const marked =
      classified?.standIn &&
      (classified.reason === "space" || classified.reason === "invisible" || classified.reason === "direction")
    if (marked && classified) {
      nodes.push(
        <span
          key={key}
          title={`${classified.name} ${formatCodePoint(codePoint)}`}
          className="mx-0.5 inline-flex items-center rounded bg-amber-200/90 px-1 align-baseline font-sans text-[0.65rem] font-semibold text-amber-950 dark:bg-amber-300/20 dark:text-amber-100"
        >
          {classified.standIn}
        </span>,
      )
    } else {
      nodes.push(<span key={key}>{ch}</span>)
    }
    key += 1
    index += ch.length
  }
  return <div className="font-mono text-sm leading-7 whitespace-pre-wrap break-words">{nodes}</div>
}

export function CharactersTool() {
  const { state, ready, update } = useSession()
  const scan = scanText(state.text)

  if (!ready) {
    return (
      <>
        <ToolIntro title="Characters" lede="See the characters a paste hides." />
        <ToolCanvas>
          <Reading />
        </ToolCanvas>
      </>
    )
  }

  return (
    <>
      <ToolIntro
        title="Characters"
        lede="See every special space, smart mark, fullwidth lookalike, and character outside GSM 7-bit."
      />
      <ToolCanvas>
        <CounterStrip />
        <BufferEditor id="characters-text" copyLabel="Copy real characters" />
        <CleanupActions />
        <div className="grid gap-4">
          {state.text.length === 0 ? (
            <p className="text-sm leading-6 text-muted-foreground">
              Paste a menu, or load the sample, to see the characters a gateway may reject.
            </p>
          ) : (
            <>
              {scan.firstUcs2 ? (
                <Callout id="ucs2-cause" tone="warning">
                  The first character that forces UCS-2 is {scan.firstUcs2.name} ({formatCodePoint(scan.firstUcs2.cp)}) on
                  line {scan.firstUcs2.line}. {scan.firstUcs2.reasonLabel}.
                </Callout>
              ) : (
                <Callout>
                  Nothing in this menu is outside GSM 7-bit, and there is no special space, smart punctuation, or
                  direction mark.
                </Callout>
              )}
              <div className="rounded-xl border border-border bg-card p-4">
                <h2 className="text-sm font-semibold">Marker view</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Special spaces, zero-width characters, and direction marks are labeled here. The phone preview hides
                  direction marks and shows their effect. Copy real characters copies the menu in the box, not these
                  labels.
                </p>
                <div className="mt-3">
                  <MarkerText text={state.text} />
                </div>
              </div>
              {scan.findings.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full min-w-[36rem] text-left text-sm">
                    <thead className="border-b border-border bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-medium">Char</th>
                        <th className="px-3 py-2 font-medium">Name</th>
                        <th className="px-3 py-2 font-medium">Line</th>
                        <th className="px-3 py-2 font-medium">Reason</th>
                        <th className="px-3 py-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {scan.findings.map((finding, index) => {
                        const action = rowAction(finding)
                        return (
                          <tr key={`${finding.utf16Index}-${index}`} className="align-top">
                            <td className="px-3 py-2 font-mono">
                              {finding.standIn ? (
                                <span className="rounded bg-amber-200/90 px-1 py-0.5 text-xs text-amber-950 dark:bg-amber-300/20 dark:text-amber-100">
                                  {finding.standIn}
                                </span>
                              ) : (
                                finding.ch
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <span className="font-medium">{finding.name}</span>
                              <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                                {formatCodePoint(finding.cp)}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-mono text-muted-foreground">{finding.line}</td>
                            <td className="px-3 py-2 leading-6 text-muted-foreground">
                              {finding.reasonLabel}.
                              {finding.note ? <span className="mt-1 block">{finding.note}</span> : null}
                            </td>
                            <td className="px-3 py-2">
                              {action ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-9"
                                  onClick={() =>
                                    update({
                                      text: replaceAt(
                                        state.text,
                                        finding.utf16Index,
                                        finding.ch.length,
                                        action.replacement,
                                      ),
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
        </div>
      </ToolCanvas>
    </>
  )
}
