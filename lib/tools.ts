export type WizardStep = { label: string; optional?: boolean }

export const USSD_STEPS: WizardStep[] = [
  { label: "Input" },
  { label: "Encoding" },
  { label: "Pagination" },
  { label: "Alignment" },
  { label: "Character Review", optional: true },
]

export const SMS_STEPS: WizardStep[] = [{ label: "Input" }, { label: "Encoding" }, { label: "Segments" }]

export const TOOLS = [
  {
    href: "/ussd",
    key: "1",
    section: "ussd",
    group: "USSD",
    label: "USSD",
    title: "USSD formatter",
    description: "Input, encoding, pagination, alignment, and an optional character review, for every language.",
    action: "Open the USSD formatter",
    steps: USSD_STEPS,
  },
  {
    href: "/sms",
    key: "2",
    section: "sms",
    group: "SMS",
    label: "SMS",
    title: "SMS formatter",
    description: "Input, encoding, and segment counts with a preview, for every language.",
    action: "Open the SMS formatter",
    steps: SMS_STEPS,
  },
] as const

export const TAGLINE = "USSD and SMS workbench"
