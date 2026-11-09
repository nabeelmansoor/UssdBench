export type Language = { code: string; name: string; rtl: boolean }

const RTL = new Set(["ar", "dv", "fa", "he", "ps", "sd", "ug", "ur", "yi"])

/** ISO 639-1 languages, by English name. */
const LIST =
  "ab:Abkhazian|aa:Afar|af:Afrikaans|ak:Akan|sq:Albanian|am:Amharic|ar:Arabic|an:Aragonese|hy:Armenian|as:Assamese|" +
  "av:Avaric|ae:Avestan|ay:Aymara|az:Azerbaijani|bm:Bambara|ba:Bashkir|eu:Basque|be:Belarusian|bn:Bengali|bi:Bislama|" +
  "bs:Bosnian|br:Breton|bg:Bulgarian|my:Burmese|ca:Catalan|ch:Chamorro|ce:Chechen|ny:Chichewa|zh:Chinese|" +
  "cu:Church Slavonic|cv:Chuvash|kw:Cornish|co:Corsican|cr:Cree|hr:Croatian|cs:Czech|da:Danish|dv:Divehi|nl:Dutch|" +
  "dz:Dzongkha|en:English|eo:Esperanto|et:Estonian|ee:Ewe|fo:Faroese|fj:Fijian|fi:Finnish|fr:French|ff:Fula|" +
  "gd:Gaelic|gl:Galician|lg:Ganda|ka:Georgian|de:German|el:Greek|gn:Guarani|gu:Gujarati|ht:Haitian Creole|ha:Hausa|" +
  "he:Hebrew|hz:Herero|hi:Hindi|ho:Hiri Motu|hu:Hungarian|is:Icelandic|io:Ido|ig:Igbo|id:Indonesian|ia:Interlingua|" +
  "ie:Interlingue|iu:Inuktitut|ik:Inupiaq|ga:Irish|it:Italian|ja:Japanese|jv:Javanese|kl:Kalaallisut|kn:Kannada|" +
  "kr:Kanuri|ks:Kashmiri|kk:Kazakh|km:Khmer|ki:Kikuyu|rw:Kinyarwanda|ky:Kyrgyz|kv:Komi|kg:Kongo|ko:Korean|" +
  "kj:Kuanyama|ku:Kurdish|lo:Lao|la:Latin|lv:Latvian|li:Limburgish|ln:Lingala|lt:Lithuanian|lu:Luba-Katanga|" +
  "lb:Luxembourgish|mk:Macedonian|mg:Malagasy|ms:Malay|ml:Malayalam|mt:Maltese|gv:Manx|mi:Maori|mr:Marathi|" +
  "mh:Marshallese|mn:Mongolian|na:Nauru|nv:Navajo|ng:Ndonga|ne:Nepali|nd:North Ndebele|se:Northern Sami|no:Norwegian|" +
  "nb:Norwegian Bokmål|nn:Norwegian Nynorsk|oc:Occitan|oj:Ojibwe|or:Odia|om:Oromo|os:Ossetian|pi:Pali|ps:Pashto|" +
  "fa:Persian|pl:Polish|pt:Portuguese|pa:Punjabi|qu:Quechua|ro:Romanian|rm:Romansh|rn:Rundi|ru:Russian|sm:Samoan|" +
  "sg:Sango|sa:Sanskrit|sc:Sardinian|sr:Serbian|sn:Shona|ii:Sichuan Yi|sd:Sindhi|si:Sinhala|sk:Slovak|sl:Slovenian|" +
  "so:Somali|nr:South Ndebele|st:Southern Sotho|es:Spanish|su:Sundanese|sw:Swahili|ss:Swati|sv:Swedish|tl:Tagalog|" +
  "ty:Tahitian|tg:Tajik|ta:Tamil|tt:Tatar|te:Telugu|th:Thai|bo:Tibetan|ti:Tigrinya|to:Tongan|ts:Tsonga|tn:Tswana|" +
  "tr:Turkish|tk:Turkmen|tw:Twi|uk:Ukrainian|ur:Urdu|ug:Uyghur|uz:Uzbek|ve:Venda|vi:Vietnamese|vo:Volapük|wa:Walloon|" +
  "cy:Welsh|fy:Western Frisian|wo:Wolof|xh:Xhosa|yi:Yiddish|yo:Yoruba|za:Zhuang|zu:Zulu"

export const LANGUAGES: Language[] = LIST.split("|").map((entry) => {
  const [code = "", name = ""] = entry.split(":")
  return { code, name, rtl: RTL.has(code) }
})

export const QUICK_LANGUAGES = ["en", "ar", "fr", "es", "ur", "hi"] as const

const BY_CODE = new Map(LANGUAGES.map((language) => [language.code, language]))

export function getLanguage(code: string): Language {
  return BY_CODE.get(code) ?? { code, name: code, rtl: false }
}

export function isKnownLanguage(code: string): boolean {
  return BY_CODE.has(code)
}

export function searchLanguages(query: string, exclude: readonly string[] = []): Language[] {
  const needle = query.trim().toLowerCase()
  return LANGUAGES.filter(
    (language) =>
      !exclude.includes(language.code) &&
      (needle === "" || language.name.toLowerCase().includes(needle) || language.code === needle),
  )
}

/** Next and Back labels that stay in the language's own narrowest encoding. */
const NAV_LABELS: Record<string, { next: string; back: string }> = {
  en: { next: "Next", back: "Back" },
  ar: { next: "التالي", back: "رجوع" },
  fr: { next: "Suivant", back: "Retour" },
  es: { next: "Siguiente", back: "Volver" },
  ur: { next: "اگلا", back: "واپس" },
  hi: { next: "अगला", back: "वापस" },
}

export function defaultNavLabels(code: string): { next: string; back: string } {
  return NAV_LABELS[code] ?? NAV_LABELS.en!
}
