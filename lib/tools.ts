export const TOOLS = [
  {
    href: "/ussd",
    key: "1",
    group: "USSD",
    label: "USSD",
    title: "USSD formatter",
    description: "Input, encoding, pagination, alignment, and an optional character review, for every language.",
    action: "Open the USSD formatter",
  },
  {
    href: "/sms",
    key: "2",
    group: "SMS",
    label: "SMS",
    title: "SMS formatter",
    description: "Input, encoding, and segment counts with a preview, for every language.",
    action: "Open the SMS formatter",
  },
] as const
