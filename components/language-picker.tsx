"use client"

import { useId, useState } from "react"
import { Plus, Search, X } from "lucide-react"
import { cn } from "cn"
import { Input } from "@/components/ui/input"
import { getLanguage, QUICK_LANGUAGES, searchLanguages } from "@/lib/languages"

export function LanguagePicker({
  selected,
  onAdd,
  onRemove,
}: {
  selected: string[]
  onAdd: (code: string) => void
  onRemove: (code: string) => void
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const listId = useId()
  const matches = searchLanguages(query, [...selected, ...QUICK_LANGUAGES]).slice(0, 8)
  const others = selected.filter((code) => !(QUICK_LANGUAGES as readonly string[]).includes(code))

  const toggle = (code: string) => {
    if (selected.includes(code)) {
      if (selected.length > 1) onRemove(code)
    } else onAdd(code)
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Common languages">
        {QUICK_LANGUAGES.map((code) => {
          const on = selected.includes(code)
          const last = on && selected.length === 1
          return (
            <button
              key={code}
              type="button"
              aria-pressed={on}
              disabled={last}
              title={last ? "At least one language stays selected." : undefined}
              onClick={() => toggle(code)}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-md border-[1.5px] border-line px-3 text-sm font-semibold transition-[transform,box-shadow] disabled:cursor-not-allowed",
                on
                  ? "bg-primary text-primary-foreground shadow-hard-sm"
                  : "bg-card text-foreground hover:-translate-x-px hover:-translate-y-px hover:shadow-hard-sm",
              )}
            >
              <span className="font-mono text-[0.7rem] uppercase opacity-80">{code}</span>
              {getLanguage(code).name}
              {on ? <X className="size-3.5" aria-hidden="true" /> : <Plus className="size-3.5" aria-hidden="true" />}
            </button>
          )
        })}
      </div>

      {others.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Other selected languages">
          {others.map((code) => (
            <li key={code}>
              <span className="inline-flex h-9 items-center gap-2 rounded-md border-[1.5px] border-line bg-primary pr-1 pl-3 text-sm font-semibold text-primary-foreground">
                {getLanguage(code).name}
                <button
                  type="button"
                  onClick={() => toggle(code)}
                  className="grid size-6 place-items-center rounded hover:bg-primary-foreground/20"
                  aria-label={`Remove ${getLanguage(code).name}`}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="relative max-w-md">
        <label htmlFor={`${listId}-search`} className="mb-1.5 block text-sm font-semibold">
          Another language
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id={`${listId}-search`}
            role="combobox"
            aria-expanded={open && matches.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            autoComplete="off"
            placeholder="Search all languages"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && matches[0]) {
                event.preventDefault()
                onAdd(matches[0].code)
                setQuery("")
              }
              if (event.key === "Escape") setOpen(false)
            }}
            className="h-10 pl-9"
          />
        </div>
        {open && matches.length > 0 ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border-[1.5px] border-line bg-popover py-1 shadow-hard"
          >
            {matches.map((language) => (
              <li key={language.code} role="option" aria-selected={false}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onAdd(language.code)
                    setQuery("")
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <span className="font-medium">{language.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {language.code}
                    {language.rtl ? " · RTL" : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
