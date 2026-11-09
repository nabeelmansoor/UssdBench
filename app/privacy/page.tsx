import type { Metadata } from "next";
import { PolicyArticle } from "@/components/tool-frame";

export const metadata: Metadata = {
  title: "Privacy",
  description: "USSD Bench runs in your browser. The menus and messages you write are not sent anywhere.",
};

export default function PrivacyPage() {
  return (
    <PolicyArticle
      title="Privacy"
      lede="Everything happens in your browser. Nothing you write is sent to a server."
    >
      <p>
        The USSD and SMS formatters run entirely on your device. Character replacement, encoding detection, pagination,
        direction marks, segment counts, and the phone preview are all computed in the page. No text is uploaded, logged,
        or shared.
      </p>
      <p>
        Your languages, menu and message text, the encoding and page settings, the Next and Back labels, the current
        wizard step, the phone settings, and the theme are kept in this browser tab&apos;s session storage, so a reload
        keeps your work. Closing the tab clears it. There is no account and nothing is saved on a server.
      </p>
      <p>
        Copy buttons put the text you asked for on your clipboard, so you can take the pages or the message back to your
        own gateway. The clipboard stays on your machine.
      </p>
      <p>
        The site does not use cookies for tracking, does not load advertising scripts, and does not ask for your name or
        phone number. Fonts are served with the site itself. If your own rules say that live customer text cannot sit in
        a browser tab, do not paste it here.
      </p>
    </PolicyArticle>
  );
}
