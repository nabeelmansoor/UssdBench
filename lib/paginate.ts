import { analyze, gsmSeptetBudget, textFitsBudget, ucs2CharacterBudget, type TextAnalysis } from "@/lib/gsm"
import {
  countDirectionMarks,
  hasEmbeddingPair,
  isMenuLine,
  optionKey,
  splitLines,
} from "@/lib/text"

export type PaginateOptions = {
  budgetOctets: number
  withLinks: boolean
  nextLine: string
  backLine: string
  nextKey: string
  backKey: string
}

export type PageOverflow = {
  line: string
  lineNumber: number
  units: number
  limit: number
  encoding: "gsm" | "ucs2"
  directionMarks: number
  reason: "alone" | "nav"
}

export type PageClash = {
  key: string
  lineNumber: number
  which: "next" | "back"
}

export type Ucs2Cause = {
  ch: string
  cp: number
  name: string
  lineNumber: number | null
}

export type PageModel = {
  bodyLines: string[]
  navLines: string[]
  lineNumbers: number[]
  text: string
  analysis: TextAnalysis
  clashes: PageClash[]
  paddingWarning: boolean
  ucs2Cause: Ucs2Cause | null
  singleCharacterCause: boolean
  overflow: PageOverflow | null
}

type Item = { text: string; number: number; atomic: boolean }
type Placed = { text: string; number: number }
type Cursor = { items: Item[]; index: number; pending: Item | null }

function fits(body: string[], nav: string[], budgetOctets: number): boolean {
  const lines = [...body, ...nav]
  if (lines.length === 0) return true
  return textFitsBudget(lines.join("\n"), budgetOctets)
}

function takeWords(line: string, canFit: (candidate: string) => boolean): { taken: string | null; rest: string | null } {
  const tokens = line.match(/\S+|\s+/g)
  if (!tokens) return { taken: null, rest: null }
  let bestEnd = -1
  let acc = ""
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index] ?? ""
    const next = acc + token
    const candidate = next.trimEnd()
    if (candidate.length > 0 && canFit(candidate)) {
      acc = next
      if (/\S/.test(token)) bestEnd = index
    } else {
      break
    }
  }
  if (bestEnd < 0) return { taken: null, rest: line }
  const taken = tokens.slice(0, bestEnd + 1).join("").trimEnd()
  const rest = tokens.slice(bestEnd + 1).join("").trimStart()
  return { taken, rest: rest.length > 0 ? rest : null }
}

function cloneCursor(cursor: Cursor): Cursor {
  return {
    items: cursor.items,
    index: cursor.index,
    pending: cursor.pending ? { ...cursor.pending } : null,
  }
}

function isDone(cursor: Cursor): boolean {
  return cursor.pending === null && cursor.index >= cursor.items.length
}

function packAsMuch(
  start: Cursor,
  nav: string[],
  budgetOctets: number,
): { placed: Placed[]; cursor: Cursor; blocked: Item | null } {
  const cursor = cloneCursor(start)
  const placed: Placed[] = []
  const fitsBody = (extra: string) => fits(placed.map((line) => line.text).concat(extra), nav, budgetOctets)

  while (true) {
    const fromPending = cursor.pending !== null
    const item = cursor.pending ?? (cursor.index < cursor.items.length ? cursor.items[cursor.index] : null)
    if (!item) return { placed, cursor, blocked: null }

    const accept = (rest: string | null) => {
      const pending = rest === null ? null : { ...item, text: rest, atomic: false }
      if (!fromPending) cursor.index += 1
      cursor.pending = pending
    }

    if (item.atomic) {
      if (fitsBody(item.text)) {
        placed.push({ text: item.text, number: item.number })
        accept(null)
        continue
      }
      return { placed, cursor, blocked: placed.length === 0 ? item : null }
    }

    if (fitsBody(item.text)) {
      placed.push({ text: item.text, number: item.number })
      accept(null)
      continue
    }

    const taken = takeWords(item.text, fitsBody)
    if (taken.taken) {
      placed.push({ text: taken.taken, number: item.number })
      accept(taken.rest)
      if (taken.rest) return { placed, cursor, blocked: null }
      continue
    }

    return { placed, cursor, blocked: placed.length === 0 ? item : null }
  }
}

function measureLine(line: string, budgetOctets: number): Pick<PageOverflow, "units" | "limit" | "encoding" | "directionMarks"> {
  const info = analyze(line)
  return {
    encoding: info.encoding,
    units: info.encoding === "gsm" ? info.septets : info.utf16Units,
    limit: info.encoding === "gsm" ? gsmSeptetBudget(budgetOctets) : ucs2CharacterBudget(budgetOctets),
    directionMarks: countDirectionMarks(line),
  }
}

function locateCause(placed: Placed[], navLines: string[]): Ucs2Cause | null {
  for (const line of placed) {
    const found = analyze(line.text).firstNonGsm
    if (found) return { ch: found.ch, cp: found.cp, name: found.name, lineNumber: line.number }
  }
  for (const line of navLines) {
    const found = analyze(line).firstNonGsm
    if (found) return { ch: found.ch, cp: found.cp, name: found.name, lineNumber: null }
  }
  return null
}

function collectClashes(
  placed: Placed[],
  includeNext: boolean,
  includeBack: boolean,
  options: PaginateOptions,
): PageClash[] {
  const clashes: PageClash[] = []
  for (const line of placed) {
    const key = optionKey(line.text)
    if (!key) continue
    if (includeNext && key === options.nextKey) {
      clashes.push({ key, lineNumber: line.number, which: "next" })
    }
    if (includeBack && key === options.backKey) {
      clashes.push({ key, lineNumber: line.number, which: "back" })
    }
  }
  return clashes
}

function makePage(
  placed: Placed[],
  navLines: string[],
  includeNext: boolean,
  includeBack: boolean,
  options: PaginateOptions,
): PageModel {
  const bodyLines = placed.map((line) => line.text)
  const text = [...bodyLines, ...navLines].join("\n")
  const analysis = analyze(text)
  return {
    bodyLines,
    navLines,
    lineNumbers: placed.map((line) => line.number),
    text,
    analysis,
    clashes: collectClashes(placed, includeNext, includeBack, options),
    paddingWarning: analysis.paddingRisk,
    ucs2Cause: locateCause(placed, navLines),
    singleCharacterCause: analysis.nonGsmCount === 1,
    overflow: null,
  }
}

function lineFitsAlone(item: Item, budgetOctets: number): boolean {
  if (item.atomic) return fits([item.text], [], budgetOctets)
  if (fits([item.text], [], budgetOctets)) return true
  return takeWords(item.text, (candidate) => fits([candidate], [], budgetOctets)).taken !== null
}

function makeOverflow(item: Item, nav: string[], budgetOctets: number): PageModel {
  const measured = measureLine(item.text, budgetOctets)
  const reason = lineFitsAlone(item, budgetOctets) && nav.length > 0 ? "nav" : "alone"
  const analysis = analyze(item.text)
  return {
    bodyLines: [item.text],
    navLines: [],
    lineNumbers: [item.number],
    text: item.text,
    analysis,
    clashes: [],
    paddingWarning: false,
    ucs2Cause: analysis.firstNonGsm
      ? { ch: analysis.firstNonGsm.ch, cp: analysis.firstNonGsm.cp, name: analysis.firstNonGsm.name, lineNumber: item.number }
      : null,
    singleCharacterCause: analysis.nonGsmCount === 1,
    overflow: {
      line: item.text,
      lineNumber: item.number,
      ...measured,
      reason,
    },
  }
}

function skipItem(cursor: Cursor): Cursor {
  const next = cloneCursor(cursor)
  if (next.pending) {
    next.pending = null
    return next
  }
  if (next.index < next.items.length) next.index += 1
  return next
}

export function paginate(text: string, options: PaginateOptions): PageModel[] {
  if (text === "") return []

  const pages: PageModel[] = []
  let withLinks = options.withLinks
  if (withLinks) {
    const nextFits = options.nextLine.length > 0 && fits([], [options.nextLine], options.budgetOctets)
    const backFits = options.backLine.length > 0 && fits([], [options.backLine], options.budgetOctets)
    const bothFit =
      nextFits &&
      backFits &&
      fits([], [options.backLine, options.nextLine], options.budgetOctets)
    if (!bothFit) {
      const line = !nextFits ? options.nextLine : !backFits ? options.backLine : `${options.backLine}\n${options.nextLine}`
      const measured = measureLine(line, options.budgetOctets)
      const analysis = analyze(line)
      pages.push({
        bodyLines: [],
        navLines: [],
        lineNumbers: [],
        text: line,
        analysis,
        clashes: [],
        paddingWarning: false,
        ucs2Cause: null,
        singleCharacterCause: false,
        overflow: {
          line,
          lineNumber: 0,
          ...measured,
          reason: "nav",
        },
      })
      withLinks = false
    }
  }

  const items: Item[] = splitLines(text).map((line, index) => ({
    text: line,
    number: index + 1,
    atomic: line.length === 0 || hasEmbeddingPair(line) || isMenuLine(line),
  }))
  let cursor: Cursor = { items, index: 0, pending: null }
  let guard = 0

  while (!isDone(cursor)) {
    guard += 1
    if (guard > 10000) break
    const isFirst = pages.every((page) => page.overflow !== null)
    const back = withLinks && !isFirst ? [options.backLine] : []
    const lastPack = packAsMuch(cursor, back, options.budgetOctets)
    if (!lastPack.blocked && isDone(lastPack.cursor) && lastPack.placed.length > 0) {
      pages.push(makePage(lastPack.placed, back, false, back.length > 0, options))
      break
    }

    const moreNav = withLinks ? [...back, options.nextLine] : back
    const partial = packAsMuch(cursor, moreNav, options.budgetOctets)
    if (partial.placed.length === 0) {
      const blocked = partial.blocked ?? cursor.pending ?? items[cursor.index]
      if (!blocked) break
      pages.push(makeOverflow(blocked, moreNav, options.budgetOctets))
      cursor = skipItem(cursor)
      continue
    }
    pages.push(makePage(partial.placed, moreNav, withLinks, back.length > 0, options))
    cursor = partial.cursor
  }

  return pages
}

export function copyPage(page: PageModel, lineBreak: "lf" | "cr"): string {
  const br = lineBreak === "cr" ? "\r" : "\n"
  return [...page.bodyLines, ...page.navLines].join(br)
}

export function copyPages(pages: PageModel[], lineBreak: "lf" | "cr"): string {
  const br = lineBreak === "cr" ? "\r" : "\n"
  return pages
    .filter((page) => page.overflow === null)
    .map((page) => copyPage(page, lineBreak))
    .join(br + br)
}
