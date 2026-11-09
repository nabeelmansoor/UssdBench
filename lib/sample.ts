/** English sample. Contains NBSP, a curly apostrophe, and a line longer than a feature-phone row. */
export const SAMPLE_TEXT = [
  "My account",
  "1.\u00A0Balance",
  "2. Recharge",
  "3. This week\u2019s offers and extra data bundles",
  "4. Help",
].join("\n")

const USSD_SAMPLES: Record<string, string> = {
  en: SAMPLE_TEXT,
  ar: [
    "حسابي",
    "1.\u00A0الرصيد",
    "2. إعادة الشحن",
    "3. عروض هذا الأسبوع وباقات البيانات الإضافية",
    "4. المساعدة",
    "5. لغة القائمة",
  ].join("\n"),
  fr: [
    "Mon compte",
    "1. Solde",
    "2. Recharger",
    "3. Offres de la semaine \u2013 forfaits « data » et appels",
    "4. Aide",
  ].join("\n"),
}

const SMS_SAMPLES: Record<string, string> = {
  en: "Your data bundle ends tomorrow. Reply \u201CYES\u201D to renew 10GB for another month \u2014 or dial *100# for more offers\u2026",
  ar: "تنتهي باقة البيانات غدًا. أرسل \u201Cنعم\u201D لتجديد 10 جيجابايت لشهر آخر، أو اطلب *100# لعروض أخرى\u2026",
  fr: "Votre forfait data expire demain. Répondez \u00ABOUI\u00BB pour renouveler 10 Go \u2014 ou composez *100#\u2026",
}

export function ussdSample(code: string): string | null {
  return USSD_SAMPLES[code] ?? null
}

export function smsSample(code: string): string | null {
  return SMS_SAMPLES[code] ?? null
}
