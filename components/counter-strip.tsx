"use client"

import { analyze, gsmSeptetBudget, ucs2CharacterBudget } from "@/lib/gsm"
import { formatCodePoint } from "@/lib/names"
import { segmentSms } from "@/lib/sms"
import { useSession } from "@/lib/session"

export function CounterStrip() {
  const { state } = useSession()
  const info = analyze(state.text)
  const sms = segmentSms(state.text)
  const budget =
    info.encoding === "ucs2"
      ? `${ucs2CharacterBudget(state.budgetOctets)} UCS-2`
      : `${gsmSeptetBudget(state.budgetOctets)} GSM`
  const count = info.encoding === "ucs2" ? info.utf16Units : info.characters
  const segmentLabel = sms.segments === 1 ? "segment" : "segments"

  return (
    <p
      className="flex flex-wrap gap-x-3 gap-y-1 rounded-lg bg-muted px-3 py-2 font-mono text-xs leading-5 text-muted-foreground"
      aria-live="polite"
    >
      <span>{count} characters</span>
      <span>
        {info.encoding === "ucs2" ? "UCS-2" : "GSM 7-bit"}
        {info.firstNonGsm ? ` · ${formatCodePoint(info.firstNonGsm.cp)}` : ""}
      </span>
      {info.encoding === "gsm" ? <span>{info.septets} septets</span> : null}
      <span>{info.octets} USSD octets</span>
      <span>budget {budget}</span>
      <span>
        {sms.segments} SMS {segmentLabel}
      </span>
    </p>
  )
}
