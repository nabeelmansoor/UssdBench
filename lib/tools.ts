export const TOOLS = [
  {
    href: "/ussd/paginate",
    label: "Paginate",
    title: "Paginate",
    description: "Split one screen into pages that fit the octet budget, with Next and Back or without them.",
    action: "Open paginate",
  },
  {
    href: "/ussd/align",
    label: "Align",
    title: "Align",
    description: "Set a feature-phone or smartphone width, pad lines, and force a line right to left or left to right.",
    action: "Open align",
  },
  {
    href: "/ussd/characters",
    label: "Characters",
    title: "Characters",
    description: "Find the no-break space, curly quote, or direction mark that a paste hid.",
    action: "Open characters",
  },
  {
    href: "/sms",
    label: "SMS",
    title: "SMS",
    description: "See GSM 7-bit or UCS-2, count septets, and mark where each segment ends.",
    action: "Open SMS",
  },
] as const
