"use client"

import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"

export type Section = "ussd" | "sms"

export type WizardStep = { label: string; optional?: boolean }

export function SectionShell({
  section,
  title,
  lede,
  children,
}: {
  section: Section
  title: string
  lede: string
  children: React.ReactNode
}) {
  return (
    <div data-section={section} className="pb-10">
      <header className="container-page pt-8 lg:pt-12">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-7 items-center rounded-md border-[1.5px] border-line bg-primary px-2 font-mono text-xs font-bold tracking-[0.12em] text-primary-foreground uppercase">
            {section === "ussd" ? "USSD" : "SMS"}
          </span>
          <p className="kicker">{section === "ussd" ? "Menu formatter" : "Message formatter"}</p>
        </div>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">{title}</h1>
        <div className="mt-4 h-1.5 w-16 bg-primary" aria-hidden="true" />
        <p className="mt-5 max-w-[64ch] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">{lede}</p>
      </header>
      {children}
    </div>
  )
}

export function StepIndicator({
  steps,
  current,
  onSelect,
}: {
  steps: WizardStep[]
  current: number
  onSelect: (index: number) => void
}) {
  return (
    <nav aria-label="Steps" className="container-page mt-8">
      <ol className="flex gap-2 overflow-x-auto pb-1 sm:gap-3">
        {steps.map((step, index) => {
          const state = index === current ? "current" : index < current ? "done" : "todo"
          return (
            <li key={step.label} className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={state === "current" ? "step" : undefined}
                className={cn(
                  "group flex items-center gap-2 rounded-md border-[1.5px] py-1.5 pr-3 pl-1.5 text-left text-sm font-semibold transition-[transform,box-shadow]",
                  state === "current"
                    ? "border-line bg-primary text-primary-foreground shadow-hard-sm"
                    : "border-line bg-card text-foreground hover:-translate-x-px hover:-translate-y-px hover:shadow-hard-sm",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-6 place-items-center rounded font-mono text-xs font-bold",
                    state === "current"
                      ? "bg-primary-foreground text-primary"
                      : state === "done"
                        ? "bg-accent text-accent-foreground"
                        : "border border-border bg-muted text-muted-foreground",
                  )}
                >
                  {state === "done" ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span className="flex flex-col leading-tight">
                  <span>{step.label}</span>
                  {step.optional ? (
                    <span
                      className={cn(
                        "font-mono text-[0.6rem] tracking-[0.1em] uppercase",
                        state === "current" ? "text-primary-foreground/80" : "text-muted-foreground",
                      )}
                    >
                      Optional
                    </span>
                  ) : null}
                </span>
                <span className="sr-only">
                  {state === "done" ? " (done)" : state === "current" ? " (current step)" : ""}
                </span>
              </button>
              {index < steps.length - 1 ? (
                <span aria-hidden="true" className="h-[1.5px] w-3 bg-line sm:w-5" />
              ) : null}
            </li>
          )
        })}
      </ol>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        Step {current + 1} of {steps.length} · {steps[current]?.label}
      </p>
    </nav>
  )
}

export function WizardNav({
  onBack,
  onNext,
  nextLabel,
  backLabel = "Back",
  extra,
}: {
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  backLabel?: string
  extra?: React.ReactNode
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t-[1.5px] border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {onBack ? (
          <Button type="button" variant="outline" className="h-11 w-full sm:w-auto" onClick={onBack}>
            <ArrowLeft aria-hidden="true" />
            {backLabel}
          </Button>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {extra}
        {onNext ? (
          <Button type="button" className="h-11 w-full sm:w-auto" onClick={onNext}>
            {nextLabel ?? "Next"}
            <ArrowRight aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}
