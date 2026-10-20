"use client"

import { analyze, gsmSeptetBudget, ucs2CharacterBudget } from "@/lib/gsm"
import { formatCodePoint } from "@/lib/names"
import { segmentSms } from "@/lib/sms"
import { useSession } from "@/lib/session"

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 grow flex-col gap-0.5 border-r border-b border-border px-3 py-2">
      <dt className="font-mono text-[0.65rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="font-mono text-sm leading-5 font-semibold text-foreground">{children}</dd>
    </div>
  )
}

export function CounterStrip() {
  const { state } = useSession()
  const info = analyze(state.text)
  const sms = segmentSms(state.text)
  const pageLimit =
    info.encoding === "ucs2"
      ? `${ucs2CharacterBudget(state.budgetOctets)} UCS-2 chars`
      : `${gsmSeptetBudget(state.budgetOctets)} GSM septets`
  const count = info.encoding === "ucs2" ? info.utf16Units : info.characters
  const segmentLabel = sms.segments === 1 ? "segment" : "segments"

  return (
    <div
      className="overflow-hidden rounded-lg border-[1.5px] border-line bg-card"
      aria-live="polite"
    >
      <dl className="-mr-px -mb-px flex flex-wrap">
        <Cell label="Characters">{count} characters</Cell>
        <Cell label="Encoding">
          {info.encoding === "ucs2" ? "UCS-2" : "GSM 7-bit"}
          {info.firstNonGsm ? ` · ${formatCodePoint(info.firstNonGsm.cp)}` : ""}
        </Cell>
        {info.encoding === "gsm" ? <Cell label="Septets">{info.septets} septets</Cell> : null}
        <Cell label="USSD octets">{info.octets} USSD octets</Cell>
        <Cell label="Page size limit">
          {pageLimit} · {state.budgetOctets} octets
        </Cell>
        <Cell label="SMS">
          {sms.segments} SMS {segmentLabel}
        </Cell>
      </dl>
    </div>
  )
}
