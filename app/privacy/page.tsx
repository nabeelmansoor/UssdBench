import type { Metadata } from "next";
import { PolicyArticle } from "@/components/tool-frame";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Version 1 keeps the pasted USSD or SMS text in the browser and does not upload it.",
};

export default function PrivacyPage() {
  return (
    <PolicyArticle
      title="Privacy"
      lede="The menu text stays in the browser. Version 1 does not upload it."
    >
      <p>
        Everything the formatter does runs on your device. The pasted menu, the page budget, the column width, the Next
        and Back fields, and the light or dark theme are kept in this browser tab for the visit. Reloading the page
        keeps them. Closing the tab clears them. They are not sent to a server, and there is no account to attach them
        to.
      </p>
      <p>
        Copy places the text you asked for on the clipboard. That is the point of the session: you take the pages back
        to your own gateway code. The clipboard is still on your machine. The marker labels in the character list are
        not what the copy button writes. The button copies the real characters.
      </p>
      <p>
        Ads are off, so this version does not load an advertising script and does not name an ad provider. If a later
        version turns ads on, this page will name the provider. Overlay ads and sticky bars are not part of the tool
        pages.
      </p>
      <p>
        The site does not ask for a name, a phone number, or the contents of a live customer session. Do not paste a
        menu here if your own rules say that text cannot sit in a browser tab.
      </p>
    </PolicyArticle>
  );
}
