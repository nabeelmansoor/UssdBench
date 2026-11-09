"use client"

import { useMemo } from "react"
import { CopyButton } from "@/components/copy-button"
import { EncodingStep } from "@/components/encoding-step"
import { InputStep } from "@/components/input-step"
import { EncodingBadge, LanguageTabs } from "@/components/language-tabs"
import { PhonePreview } from "@/components/phone-preview"
import { ToolWorkLayout } from "@/components/tool-work-layout"
import { Callout, Panel, Reading, ToolCanvas } from "@/components/tool-frame"
import { SectionShell, StepIndicator, WizardNav, type WizardStep } from "@/components/wizard"
import { ENCODING_LABEL, ENCODING_UNIT, type Encoding } from "@/lib/encoding"
import { isGsmExtension } from "@/lib/gsm"
import { getLanguage } from "@/lib/languages"
import { smsSample } from "@/lib/sample"
import { useSession } from "@/lib/session"
import { SMS_LIMITS } from "@/lib/sms-segments"
import { deriveSms, newSmsLanguage, type SmsDerived, type SmsLanguage } from "@/lib/workflow"

const STEPS: WizardStep[] = [{ label: "Input" }, { label: "Encoding" }, { label: "Segments" }]

function SegmentText({ text, encoding }: { text: string; encoding: Encoding }) {
  const nodes: React.ReactNode[] = []
  let key = 0
  for (const ch of text) {
    if (encoding === "gsm7" && isGsmExtension(ch)) {
      nodes.push(
        <mark
          key={key++}
          title="GSM extension character. Counts as two septets."
          className="rounded bg-warn px-0.5 text-warn-foreground"
        >
          {ch}
        </mark>,
      )
    } else nodes.push(<span key={key++}>{ch}</span>)
  }
  return <>{nodes}</>
}

function SegmentsStep({
  languages,
  active,
  derived,
  onActive,
}: {
  languages: SmsLanguage[]
  active: string
  derived: Record<string, SmsDerived>
  onActive: (code: string) => void
}) {
  const codes = languages.map((language) => language.code)
  const current = languages.find((language) => language.code === active) ?? languages[0]!
  const info = derived[current.code]!
  const language = getLanguage(current.code)
  const { segments, units, single, part } = info.segments
  const unit = ENCODING_UNIT[info.encoding]
  const phone = (
    <PhonePreview
      label="SMS"
      empty={info.prepared.text.length === 0}
      lines={info.prepared.text.split("\n")}
      meta={`${language.name} · ${ENCODING_LABEL[info.encoding]} · ${segments.length} segment${segments.length === 1 ? "" : "s"}`}
    />
  )

  return (
    <ToolWorkLayout
      main={
        <>
          <Panel title="All languages">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
                  <tr>
                    <th className="py-1.5 pr-3 font-semibold">Language</th>
                    <th className="py-1.5 pr-3 font-semibold">Encoding</th>
                    <th className="py-1.5 pr-3 font-semibold">Length</th>
                    <th className="py-1.5 pr-3 font-semibold">Segments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {languages.map((entry) => {
                    const row = derived[entry.code]!
                    return (
                      <tr key={entry.code}>
                        <td className="py-2 pr-3 font-medium">{getLanguage(entry.code).name}</td>
                        <td className="py-2 pr-3 font-mono">{ENCODING_LABEL[row.encoding]}</td>
                        <td className="py-2 pr-3 font-mono">
                          {row.segments.units} {ENCODING_UNIT[row.encoding]}
                        </td>
                        <td className="py-2 pr-3 font-mono font-bold">{row.segments.segments.length}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
          <LanguageTabs
            codes={codes}
            active={current.code}
            onSelect={onActive}
            badge={(code) => <EncodingBadge label={`${derived[code]?.segments.segments.length ?? 0} seg`} />}
          >
            {info.prepared.text.length === 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">
                0 {unit}, 0 segments. Add the {language.name} message in step 1.
              </p>
            ) : (
              <>
                <Callout tone={segments.length > 1 ? "warning" : "info"}>
                  {ENCODING_LABEL[info.encoding]}. {units} {unit} in {segments.length}{" "}
                  {segments.length === 1 ? "segment" : "segments"}. One segment holds {single} {unit}; each part of a
                  longer message holds {part}.
                </Callout>
                {info.prepared.unencodable.length > 0 ? (
                  <Callout tone="danger">
                    {ENCODING_LABEL[info.encoding]} cannot hold {info.prepared.unencodable.join(" ")}. Change the encoding
                    in step 2.
                  </Callout>
                ) : null}
                <div className="lg:hidden">{phone}</div>
                <div
                  dir={language.rtl ? "rtl" : "ltr"}
                  className="overflow-x-auto rounded-lg border-[1.5px] border-line bg-card p-4 font-mono text-sm leading-6 whitespace-pre-wrap"
                >
                  {segments.map((segment, index) => (
                    <div key={index}>
                      <SegmentText text={segment.text} encoding={info.encoding} />
                      <span
                        dir="ltr"
                        className={
                          index < segments.length - 1
                            ? "my-3 block border-t-2 border-dashed border-primary pt-2 font-sans text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                            : "mt-3 block font-sans text-xs text-muted-foreground"
                        }
                      >
                        {index < segments.length - 1 ? `End of segment ${index + 1}` : `Segment ${index + 1} of ${segments.length}`}{" "}
                        · {segment.units} of {segment.limit} {unit}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <CopyButton text={info.prepared.text} label={`Copy ${language.name} message`} variant="default" />
                </div>
              </>
            )}
          </LanguageTabs>
        </>
      }
      aside={<div className="hidden lg:block">{phone}</div>}
    />
  )
}

export function SmsWizard() {
  const { state, ready, updateSms } = useSession()
  const sms = state.sms
  const derived = useMemo(() => {
    const map: Record<string, SmsDerived> = {}
    for (const language of sms.languages) map[language.code] = deriveSms(language)
    return map
  }, [sms.languages])

  const shell = (children: React.ReactNode) => (
    <SectionShell
      section="sms"
      title="SMS formatter"
      lede="Write each language's message, keep its smart characters from changing the encoding, and count its segments."
    >
      {children}
    </SectionShell>
  )

  if (!ready) {
    return shell(
      <ToolCanvas>
        <Reading />
      </ToolCanvas>,
    )
  }

  const go = (next: number) => {
    updateSms({ step: Math.min(STEPS.length - 1, Math.max(0, next)) })
    window.scrollTo({ top: 0 })
  }
  const onLanguage = (code: string, patch: Partial<SmsLanguage>) =>
    updateSms((current) => ({
      languages: current.languages.map((language) => (language.code === code ? { ...language, ...patch } : language)),
    }))
  const onActive = (code: string) => updateSms({ active: code })
  const prepared = Object.fromEntries(Object.entries(derived).map(([code, entry]) => [code, entry.prepared]))

  let body: React.ReactNode
  if (sms.step === 0) {
    body = (
      <ToolCanvas wide>
        <InputStep
          languages={sms.languages}
          active={sms.active}
          prepared={prepared}
          textLabel="Message text"
          placeholder="Paste or type one SMS."
          sample={smsSample}
          onAdd={(code) =>
            updateSms((current) =>
              current.languages.some((language) => language.code === code)
                ? { active: code }
                : { languages: [...current.languages, newSmsLanguage(code)], active: code },
            )
          }
          onRemove={(code) =>
            updateSms((current) => {
              const languages = current.languages.filter((language) => language.code !== code)
              if (languages.length === 0) return {}
              return { languages, active: current.active === code ? languages[0]!.code : current.active }
            })
          }
          onActive={onActive}
          onText={(code, text) => onLanguage(code, { text })}
        />
        <WizardNav onNext={() => go(1)} nextLabel="Next: Encoding" />
      </ToolCanvas>
    )
  } else if (sms.step === 1) {
    body = (
      <ToolCanvas wide>
        <EncodingStep
          languages={sms.languages}
          prepared={prepared}
          onEncoding={(code, encoding) => onLanguage(code, { encoding })}
          detail={(code, encoding) => (
            <p className="text-muted-foreground">
              {getLanguage(code).name} segments hold {SMS_LIMITS[encoding].single} {ENCODING_UNIT[encoding]}, or{" "}
              {SMS_LIMITS[encoding].part} per part of a longer message.
            </p>
          )}
        />
        <WizardNav onBack={() => go(0)} onNext={() => go(2)} nextLabel="Next: Segments" />
      </ToolCanvas>
    )
  } else {
    body = (
      <>
        <SegmentsStep languages={sms.languages} active={sms.active} derived={derived} onActive={onActive} />
        <div className="container-page mt-8">
          <WizardNav onBack={() => go(1)} />
        </div>
      </>
    )
  }

  return shell(
    <>
      <StepIndicator steps={STEPS} current={sms.step} onSelect={go} />
      {body}
    </>,
  )
}
