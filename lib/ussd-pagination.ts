import { directionMarkCost, wrapPage, type ForcedDirection } from "@/lib/direction"
import { textCost, type Encoding } from "@/lib/encoding"
import { optionKey } from "@/lib/text"

export type PaginationMode = "word" | "line"

export type NavLines = {
  next: string
  back: string
  nextKey: string
  backKey: string
}

export type PaginationOptions = {
  encoding: Encoding
  charsPerPage: number
  mode: PaginationMode
  nav: NavLines | null
  /** Already resolved for the encoding: "none" unless the language is UCS-2. */
  direction: ForcedDirection
}

export type PageClash = { key: string; which: "next" | "back"; line: string }

export type UssdPage = {
  bodyLines: string[]
  navLines: string[]
  /** What is sent: body, navigation, and the direction marks around the whole page. */
  text: string
  cost: number
  limit: number
  directionMarks: number
  /** The last body line continues on the next page. */
  continues: boolean
  /** A word longer than a page was cut between characters. */
  splitWord: boolean
  paddingRisk: boolean
  clashes: PageClash[]
}

export type PaginationResult = {
  pages: UssdPage[]
  error: string | null
  navDropped: boolean
}

type Take = { body: string[]; rest: string; continues: boolean; splitWord: boolean }

export function composePage(body: string[], nav: string[], direction: ForcedDirection): string {
  return wrapPage([...body, ...nav].join("\n"), direction)
}

function pageCost(body: string[], nav: string[], options: PaginationOptions): number {
  return textCost(composePage(body, nav, options.direction), options.encoding)
}

function hardSplit(text: string, canFit: (candidate: string) => boolean): { taken: string; rest: string } {
  let taken = ""
  for (const ch of text) {
    if (!canFit(taken + ch)) break
    taken += ch
  }
  return { taken, rest: text.slice(taken.length) }
}

/** The longest prefix that ends on a word boundary and fits. Falls back to a character cut. */
function takeWords(text: string, canFit: (candidate: string) => boolean): Take {
  let best = -1
  const boundaries: number[] = []
  const pattern = /\s+/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > 0) boundaries.push(match.index)
  }
  boundaries.push(text.length)

  for (const end of boundaries) {
    if (!canFit(text.slice(0, end))) break
    best = end
  }

  if (best < 0) {
    const cut = hardSplit(text, canFit)
    return { body: cut.taken.split("\n"), rest: cut.rest, continues: cut.taken.length > 0, splitWord: true }
  }

  const gap = /^\s*/.exec(text.slice(best))?.[0] ?? ""
  const rest = text.slice(best + gap.length)
  return {
    body: text.slice(0, best).split("\n"),
    rest,
    continues: rest.length > 0 && !gap.includes("\n"),
    splitWord: false,
  }
}

function takeLines(text: string, canFitLines: (lines: string[]) => boolean): Take {
  const lines = text.split("\n")
  let count = 0
  while (count < lines.length && canFitLines(lines.slice(0, count + 1))) count += 1
  if (count > 0) {
    return { body: lines.slice(0, count), rest: lines.slice(count).join("\n"), continues: false, splitWord: false }
  }
  const [first = "", ...others] = lines
  const split = takeWords(first, (candidate) => canFitLines([candidate]))
  const restLines = split.rest.length > 0 ? [split.rest, ...others] : others
  return { ...split, rest: restLines.join("\n"), continues: split.rest.length > 0 }
}

function clashesFor(body: string[], nav: string[], options: PaginationOptions): PageClash[] {
  if (!options.nav || nav.length === 0) return []
  const clashes: PageClash[] = []
  const hasNext = nav.includes(options.nav.next)
  const hasBack = nav.includes(options.nav.back)
  for (const line of body) {
    const key = optionKey(line)
    if (!key) continue
    if (hasNext && key === options.nav.nextKey) clashes.push({ key, which: "next", line })
    if (hasBack && key === options.nav.backKey) clashes.push({ key, which: "back", line })
  }
  return clashes
}

function makePage(take: Pick<Take, "body" | "continues" | "splitWord">, nav: string[], options: PaginationOptions): UssdPage {
  const text = composePage(take.body, nav, options.direction)
  const cost = textCost(text, options.encoding)
  return {
    bodyLines: take.body,
    navLines: nav,
    text,
    cost,
    limit: options.charsPerPage,
    directionMarks: directionMarkCost(options.direction),
    continues: take.continues,
    splitWord: take.splitWord,
    paddingRisk: options.encoding === "gsm7" && cost % 8 === 7,
    clashes: clashesFor(take.body, nav, options),
  }
}

/**
 * Splits one menu into USSD pages. Every page, including its Next/Back lines and its direction
 * marks, stays within charsPerPage in the encoding's unit.
 */
export function paginateUssd(input: string, options: PaginationOptions): PaginationResult {
  let rest = input.replace(/\r\n?/g, "\n")
  const pages: UssdPage[] = []
  const limit = options.charsPerPage
  if (rest.trim() === "") return { pages, error: null, navDropped: false }

  if (limit <= directionMarkCost(options.direction)) {
    return { pages, error: `${limit} characters per page leaves no room for text.`, navDropped: false }
  }

  let nav = options.nav
  let navDropped = false
  let error: string | null = null
  if (nav && pageCost([], [nav.back, nav.next], options) > limit) {
    nav = null
    navDropped = true
    error = "The Next and Back lines do not fit on one page together, so pages are built without them."
  }
  const resolved = { ...options, nav }

  for (let guard = 0; guard < 10000; guard += 1) {
    rest = rest.replace(/^\n+/, "")
    if (rest.length === 0) break
    const back = nav && pages.length > 0 ? [nav.back] : []
    const lines = rest.split("\n")
    if (pageCost(lines, back, resolved) <= limit) {
      pages.push(makePage({ body: lines, continues: false, splitWord: false }, back, resolved))
      break
    }

    const navLines = nav ? [...back, nav.next] : back
    const canFitLines = (body: string[]) => pageCost(body, navLines, resolved) <= limit
    const take =
      options.mode === "line"
        ? takeLines(rest, canFitLines)
        : takeWords(rest, (candidate) => canFitLines(candidate.split("\n")))

    if (take.body.join("").length === 0) {
      error = `Nothing fits in ${limit} characters once the navigation and direction marks are counted.`
      break
    }
    pages.push(makePage(take, navLines, resolved))
    rest = take.rest
  }

  return { pages, error, navDropped }
}

export function copyUssdPage(page: UssdPage, lineBreak: "lf" | "cr"): string {
  return lineBreak === "cr" ? page.text.replaceAll("\n", "\r") : page.text
}

export function copyUssdPages(pages: UssdPage[], lineBreak: "lf" | "cr"): string {
  const br = lineBreak === "cr" ? "\r" : "\n"
  return pages.map((page) => copyUssdPage(page, lineBreak)).join(br + br)
}
