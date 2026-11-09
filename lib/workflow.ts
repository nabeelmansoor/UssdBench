import { effectiveDirection, type ForcedDirection } from "@/lib/direction"
import { defaultCharsPerPage, type Encoding } from "@/lib/encoding"
import { defaultNavLabels, getLanguage } from "@/lib/languages"
import { prepareText, type PreparedText } from "@/lib/smart-chars"
import { segmentMessage, type SmsSegments } from "@/lib/sms-segments"
import { composeReply, isReplyKey } from "@/lib/text"
import { paginateUssd, type PaginationMode, type PaginationResult } from "@/lib/ussd-pagination"

export type UssdLanguage = {
  code: string
  text: string
  encoding: Encoding | null
  charsPerPage: number | null
  direction: ForcedDirection | null
  nextKey: string
  nextSep: string
  nextLabel: string
  backKey: string
  backSep: string
  backLabel: string
}

export type SmsLanguage = {
  code: string
  text: string
  encoding: Encoding | null
}

export type UssdSettings = { withLinks: boolean; mode: PaginationMode }

export function newUssdLanguage(code: string): UssdLanguage {
  const labels = defaultNavLabels(code)
  return {
    code,
    text: "",
    encoding: null,
    charsPerPage: null,
    direction: null,
    nextKey: "99",
    nextSep: ": ",
    nextLabel: labels.next,
    backKey: "0",
    backSep: ": ",
    backLabel: labels.back,
  }
}

export function newSmsLanguage(code: string): SmsLanguage {
  return { code, text: "", encoding: null }
}

/** Right for right-to-left scripts, otherwise no forced direction. */
export function defaultDirection(code: string): ForcedDirection {
  return getLanguage(code).rtl ? "rtl" : "none"
}

export type UssdDerived = {
  prepared: PreparedText
  encoding: Encoding
  charsPerPage: number
  chosenDirection: ForcedDirection
  direction: ForcedDirection
  nextLine: string
  backLine: string
  keysOk: boolean
  navUnencodable: string[]
  pagination: PaginationResult
}

export function deriveUssd(language: UssdLanguage, settings: UssdSettings): UssdDerived {
  const prepared = prepareText(language.text, language.encoding)
  const encoding = prepared.encoding
  const charsPerPage = language.charsPerPage ?? defaultCharsPerPage(encoding)
  const chosenDirection = language.direction ?? defaultDirection(language.code)
  const direction = effectiveDirection(chosenDirection, encoding)
  const nextLine = prepareText(composeReply(language.nextKey, language.nextSep, language.nextLabel), encoding).text
  const backLine = prepareText(composeReply(language.backKey, language.backSep, language.backLabel), encoding).text
  const keysOk = isReplyKey(language.nextKey) && isReplyKey(language.backKey)
  const useNav = settings.withLinks && keysOk
  const navUnencodable = useNav
    ? [...new Set([...prepareText(nextLine + backLine, encoding).unencodable])]
    : []
  const pagination = paginateUssd(prepared.text, {
    encoding,
    charsPerPage,
    mode: settings.mode,
    direction,
    nav: useNav ? { next: nextLine, back: backLine, nextKey: language.nextKey, backKey: language.backKey } : null,
  })
  return {
    prepared,
    encoding,
    charsPerPage,
    chosenDirection,
    direction,
    nextLine,
    backLine,
    keysOk,
    navUnencodable,
    pagination,
  }
}

export type SmsDerived = { prepared: PreparedText; encoding: Encoding; segments: SmsSegments }

export function deriveSms(language: SmsLanguage): SmsDerived {
  const prepared = prepareText(language.text, language.encoding)
  return { prepared, encoding: prepared.encoding, segments: segmentMessage(prepared.text, prepared.encoding) }
}
