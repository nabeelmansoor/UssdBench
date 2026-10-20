"use client"

import Link from "next/link"
import { BufferEditor } from "@/components/buffer-controls"
import { CleanupActions } from "@/components/cleanup-actions"
import { CounterStrip } from "@/components/counter-strip"
import { Callout, Reading, ToolCanvas, ToolIntro } from "@/components/tool-frame"
import { analyze, isGsmExtension } from "@/lib/gsm"
import {
  cleanupText,
  SPACES_INVISIBLES_AND_PUNCTUATION,
} from "@/lib/cleanup"
import { formatCodePoint } from "@/lib/names"
import { segmentSms } from "@/lib/sms"
import { useSession } from "@/lib/session"

function Highlighted({ text, encoding }: { text: string; encoding: "gsm" | "ucs2" }) {
  const first = encoding === "ucs2" ? analyze(text).firstNonGsm : null
  const nodes: React.ReactNode[] = []
  let index = 0
  let key = 0
  for (const ch of text) {
    const extension = encoding === "gsm" && isGsmExtension(ch)
    const cause = first !== null && index === first.utf16Index
    if (extension || cause) {
      nodes.push(
        <mark
          key={key}
          className={
            cause
              ? "rounded bg-amber-300/80 px-0.5 text-foreground dark:bg-amber-400/30"
              : "rounded bg-amber-200/80 px-0.5 text-foreground dark:bg-amber-300/20"
          }
          title={extension ? "GSM extension character. Counts as two septets." : "This character forces UCS-2."}
        >
          {ch}
        </mark>,
      )
    } else {
      nodes.push(<span key={key}>{ch}</span>)
    }
    key += 1
    index += ch.length
  }
  return <>{nodes}</>
}

export function SmsTool() {
  const { state, ready } = useSession()
  const sms = segmentSms(state.text)
  const cleaned = cleanupText(state.text, SPACES_INVISIBLES_AND_PUNCTUATION)
  const after = analyze(cleaned.text)

  if (!ready) {
    return (
      <>
        <ToolIntro title="SMS segments" lede="Count segments with the GSM alphabet and the extension table." />
        <ToolCanvas>
          <Reading />
        </ToolCanvas>
      </>
    )
  }

  const cause = sms.firstNonGsm
  const leftoverLetter = after.firstNonGsm ? /\p{L}/u.test(after.firstNonGsm.ch) : false
  const leftoverDirection = after.nonGsmAllDirection
  const leftoverFullwidth = after.firstNonGsm
    ? (after.firstNonGsm.cp >= 0xff01 && after.firstNonGsm.cp <= 0xff5e) || after.firstNonGsm.cp === 0x3000
    : false

  return (
    <>
      <ToolIntro
        title="SMS segments"
        lede="Count characters, septets, and segments. One character outside GSM 7-bit switches the whole message."
      />
      <ToolCanvas>
        <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm leading-6">
          <p className="font-medium text-foreground">What this tool does</p>
          <p className="mt-1 text-muted-foreground">
            Count how many SMS segments your message needs. One character outside the GSM 7-bit alphabet switches the
            whole message to UCS-2. Highlighted characters show extension septets (two septets each) or the first
            character that forces UCS-2.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>GSM 7-bit: 160 septets in one segment, 153 per part when concatenated.</li>
            <li>UCS-2: 70 characters in one segment, 67 per part when concatenated.</li>
          </ul>
        </div>
        <CounterStrip />
        <BufferEditor id="sms-text" label="Message text" />
        <CleanupActions />
        <div className="grid gap-4">
          {state.text.length === 0 ? (
            <p className="text-sm leading-6 text-muted-foreground">
              0 characters, 0 septets, 0 segments. Paste a message to count it.
            </p>
          ) : (
            <>
              <Callout tone={sms.encoding === "ucs2" ? "warning" : "info"}>
                {sms.encoding === "gsm" ? (
                  <p>
                    GSM 7-bit. {sms.characters} characters, {sms.septets} septets
                    {sms.extensionCount > 0 ? `, including ${sms.extensionCount} extension character${sms.extensionCount === 1 ? "" : "s"} at two septets each` : ""}.{" "}
                    {sms.segments} {sms.segments === 1 ? "segment" : "segments"}. One segment holds {sms.singleLimit}{" "}
                    septets. Each part of a longer message holds {sms.concatLimit}.
                  </p>
                ) : (
                  <p>
                    UCS-2. {sms.utf16Units} characters, {sms.segments} {sms.segments === 1 ? "segment" : "segments"}. One
                    segment holds {sms.singleLimit} characters. Each part of a longer message holds {sms.concatLimit}.
                    {cause ? (
                      <>
                        {" "}
                        The first character outside GSM 7-bit is {cause.name} ({formatCodePoint(cause.cp)}).{" "}
                        <Link href="/ussd/characters#ucs2-cause" className="underline underline-offset-4">
                          See it in the character list
                        </Link>
                        .
                      </>
                    ) : null}
                  </p>
                )}
              </Callout>
              {sms.encoding === "ucs2" && after.encoding === "gsm" ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  Replacing spaces and smart punctuation would put this message back in GSM 7-bit.
                </p>
              ) : null}
              {sms.encoding === "ucs2" && after.encoding === "ucs2" && after.firstNonGsm && (leftoverLetter || leftoverDirection) ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  Cleanup leaves this in place. {after.firstNonGsm.name} ({formatCodePoint(after.firstNonGsm.cp)}) is{" "}
                  {leftoverDirection ? "a direction mark" : "a letter"}, so the message stays UCS-2.
                </p>
              ) : null}
              {sms.encoding === "ucs2" && after.encoding === "ucs2" && leftoverFullwidth ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  Fullwidth lookalikes are still in the text. Folding them is separate from the punctuation cleanup.
                </p>
              ) : null}
              <div className="overflow-x-auto rounded-xl border border-border bg-card p-4 font-mono text-sm leading-6 whitespace-pre-wrap">
                {sms.parts.map((part, index) => (
                  <div key={index}>
                    <Highlighted text={part.text} encoding={sms.encoding} />
                    {index < sms.parts.length - 1 ? (
                      <span className="my-3 block border-t border-dashed border-primary/50 pt-2 font-sans text-xs tracking-wide text-muted-foreground uppercase">
                        End of segment {index + 1}
                        {sms.encoding === "gsm" ? ` · ${part.septets} of ${part.limit} septets` : ` · ${part.units} of ${part.limit} characters`}
                      </span>
                    ) : (
                      <span className="mt-3 block font-sans text-xs text-muted-foreground">
                        Segment {index + 1} of {sms.parts.length}
                        {sms.encoding === "gsm"
                          ? ` · ${part.septets} of ${part.limit} septets`
                          : ` · ${part.units} of ${part.limit} characters`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </ToolCanvas>
    </>
  )
}
