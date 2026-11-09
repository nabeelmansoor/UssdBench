"use client"

import { useMemo } from "react"
import { CopyButton } from "@/components/copy-button"
import { EncodingStep } from "@/components/encoding-step"
import { InputStep } from "@/components/input-step"
import { Reading, ToolCanvas } from "@/components/tool-frame"
import { AlignmentStep } from "@/components/ussd/alignment-step"
import { CharacterReviewStep } from "@/components/ussd/character-review-step"
import { PaginationStep, type LanguageUpdater } from "@/components/ussd/pagination-step"
import { SectionShell, StepIndicator, WizardNav } from "@/components/wizard"
import { defaultCharsPerPage, ENCODING_LABEL, ENCODING_UNIT } from "@/lib/encoding"
import { getLanguage } from "@/lib/languages"
import { ussdSample } from "@/lib/sample"
import { useSession } from "@/lib/session"
import { USSD_STEPS } from "@/lib/tools"
import { copyUssdPages } from "@/lib/ussd-pagination"
import { deriveUssd, newUssdLanguage, type UssdDerived } from "@/lib/workflow"

const STEPS = USSD_STEPS

export function UssdWizard() {
  const { state, ready, updateUssd } = useSession()
  const ussd = state.ussd
  const settings = useMemo(() => ({ withLinks: ussd.withLinks, mode: ussd.mode }), [ussd.withLinks, ussd.mode])
  const derived = useMemo(() => {
    const map: Record<string, UssdDerived> = {}
    for (const language of ussd.languages) map[language.code] = deriveUssd(language, settings)
    return map
  }, [ussd.languages, settings])

  const shell = (children: React.ReactNode) => (
    <SectionShell
      section="ussd"
      title="USSD formatter"
      lede="Write each language's menu, pick its encoding, split it into pages that fit, and force its direction."
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

  const step = ussd.step
  const go = (next: number) => {
    updateUssd({ step: Math.min(STEPS.length - 1, Math.max(0, next)) })
    window.scrollTo({ top: 0 })
  }
  const onLanguage: LanguageUpdater = (code, patch) =>
    updateUssd((current) => ({
      languages: current.languages.map((language) => (language.code === code ? { ...language, ...patch } : language)),
    }))
  const onActive = (code: string) => updateUssd({ active: code })
  const prepared = Object.fromEntries(Object.entries(derived).map(([code, entry]) => [code, entry.prepared]))
  const active = ussd.languages.find((language) => language.code === ussd.active) ?? ussd.languages[0]!

  let body: React.ReactNode
  if (step === 0) {
    body = (
      <ToolCanvas wide>
        <InputStep
          languages={ussd.languages}
          active={ussd.active}
          prepared={prepared}
          textLabel="Menu text"
          placeholder="Paste or type one USSD menu."
          sample={ussdSample}
          onAdd={(code) =>
            updateUssd((current) =>
              current.languages.some((language) => language.code === code)
                ? { active: code }
                : { languages: [...current.languages, newUssdLanguage(code)], active: code },
            )
          }
          onRemove={(code) =>
            updateUssd((current) => {
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
  } else if (step === 1) {
    body = (
      <ToolCanvas wide>
        <EncodingStep
          languages={ussd.languages}
          prepared={prepared}
          onEncoding={(code, encoding) => onLanguage(code, { encoding, charsPerPage: null })}
          detail={(code, encoding) => (
            <p className="text-muted-foreground">
              Pages for {getLanguage(code).name} default to {defaultCharsPerPage(encoding)} {ENCODING_UNIT[encoding]} (
              {ENCODING_LABEL[encoding]}).
            </p>
          )}
        />
        <WizardNav onBack={() => go(0)} onNext={() => go(2)} nextLabel="Next: Pagination" />
      </ToolCanvas>
    )
  } else if (step === 2) {
    body = (
      <>
        <PaginationStep
          ussd={ussd}
          derived={derived}
          onSettings={(patch) => updateUssd(patch)}
          onLanguage={onLanguage}
          onActive={onActive}
        />
        <div className="container-page mt-8">
          <WizardNav onBack={() => go(1)} onNext={() => go(3)} nextLabel="Next: Alignment" />
        </div>
      </>
    )
  } else if (step === 3) {
    const pages = derived[active.code]?.pagination.pages ?? []
    body = (
      <>
        <AlignmentStep ussd={ussd} derived={derived} onLanguage={onLanguage} onActive={onActive} />
        <div className="container-page mt-8">
          <WizardNav
            onBack={() => go(2)}
            onNext={() => go(4)}
            nextLabel="Next: Character Review"
            extra={
              <CopyButton
                text={copyUssdPages(pages, ussd.lineBreak)}
                label={`Skip review · copy ${getLanguage(active.code).name} pages`}
              />
            }
          />
        </div>
      </>
    )
  } else {
    body = (
      <>
        <CharacterReviewStep ussd={ussd} derived={derived} onLanguage={onLanguage} onActive={onActive} />
        <div className="container-page mt-8">
          <WizardNav onBack={() => go(3)} />
        </div>
      </>
    )
  }

  return shell(
    <>
      <StepIndicator steps={STEPS} current={step} onSelect={go} />
      {body}
    </>,
  )
}
