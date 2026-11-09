"use client"

import { CopyButton } from "@/components/copy-button"
import { PhonePreview } from "@/components/phone-preview"
import { useVisiblePage } from "@/components/use-visible-page"
import { UssdPageCard } from "@/components/ussd/page-card"
import { unwrapPage } from "@/lib/direction"
import { ENCODING_LABEL } from "@/lib/encoding"
import { getLanguage } from "@/lib/languages"
import { copyUssdPages } from "@/lib/ussd-pagination"
import type { UssdDerived } from "@/lib/workflow"

export function usePagedPhone(derived: UssdDerived, code: string) {
  const pages = derived.pagination.pages
  const resetKey = `${code}:${pages.length}`
  const tracker = useVisiblePage(pages.length, resetKey)
  const page = pages[tracker.visible]
  const unwrapped = page ? unwrapPage(page.text) : null
  const phone = (
    <PhonePreview
      empty={!page}
      lines={unwrapped ? unwrapped.text.split("\n") : []}
      direction={unwrapped && unwrapped.direction !== "none" ? unwrapped.direction : "auto"}
      meta={
        page
          ? `${getLanguage(code).name} · page ${tracker.visible + 1} of ${pages.length} · ${ENCODING_LABEL[derived.encoding]} · ${page.cost}/${page.limit}`
          : undefined
      }
    />
  )
  return { ...tracker, phone }
}

export function PagesList({
  derived,
  code,
  lineBreak,
  visible,
  setVisible,
  register,
}: {
  derived: UssdDerived
  code: string
  lineBreak: "lf" | "cr"
  visible: number
  setVisible: (index: number) => void
  register: (index: number) => (node: HTMLElement | null) => void
}) {
  const pages = derived.pagination.pages
  const language = getLanguage(code)
  if (pages.length === 0) {
    return (
      <p className="rounded-md border-[1.5px] border-dashed border-border p-4 text-sm leading-6 text-muted-foreground">
        There is no {language.name} text yet. Add it in step 1 to build pages.
      </p>
    )
  }
  return (
    <div className="grid gap-5">
      <p className="kicker">
        {pages.length} page{pages.length === 1 ? "" : "s"} · {language.name}
      </p>
      {pages.map((page, index) => (
        <UssdPageCard
          key={index}
          page={page}
          index={index}
          total={pages.length}
          encoding={derived.encoding}
          rtl={language.rtl}
          active={index === visible}
          lineBreak={lineBreak}
          register={register(index)}
          onShow={() => setVisible(index)}
        />
      ))}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <CopyButton text={copyUssdPages(pages, lineBreak)} label={`Copy all ${language.name} pages`} variant="default" />
        <p className="text-sm leading-6 text-muted-foreground">
          A blank line goes between pages. Direction marks are included.
        </p>
      </div>
    </div>
  )
}
