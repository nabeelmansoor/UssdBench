import type { Metadata } from "next";
import { PolicyArticle } from "@/components/tool-frame";

export const metadata: Metadata = {
  title: "About",
  description: "Who USSD Bench is for, and what version 1 does not do.",
};

export default function AboutPage() {
  return (
    <PolicyArticle
      title="About"
      lede="USSD Bench is for people who already have a gateway and one screen in progress."
    >
      <p>
        USSD menu authors jump between one site to split a long screen, another to count characters, and a third to
        hunt the invisible character that made a menu fail after a paste from an iPhone. SMS senders do the same for
        segment counts. This site is one place for that sitting.
      </p>
      <p>
        The primary audience is people who write USSD menus and the reply text a gateway sends back to the handset.
        They paste a screen, fit it to a page budget, keep lines readable on a small display, and remove characters
        that look ordinary and then break the session. The secondary audience is people who send SMS and need the
        encoding, the segment count, and the character that made a GSM message into a Unicode message.
      </p>
      <p>
        Version 1 is one screen at a time. You leave with pages you can copy into your own application, and with a list
        of the problems in the paste. It does not upload the menu. It does not keep an account, a menu tree, or a
        library of other operator presets. It does not price a message, add a STOP footer, or apply a national language
        shift table. Ads are off.
      </p>
      <p>
        The sample menu is English. Mixed Arabic is something you type or paste, then force with a direction mark on
        the line that needs it. The default network label is Vodafone Qatar, on the 160-octet USSD ceiling, because
        that operator does not publish a different menu cap.
      </p>
    </PolicyArticle>
  );
}
