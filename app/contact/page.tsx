import type { Metadata } from "next";
import { PolicyArticle } from "@/components/tool-frame";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach the owner of the USSD and SMS text formatter.",
};

export default function ContactPage() {
  return (
    <PolicyArticle
      title="Contact"
      lede="The site is maintained by Nabeel Mansur Arif."
    >
      <p>
        Write to{" "}
        <a className="underline underline-offset-4" href="mailto:nabeel.mansurarif1@vodafone.qa">
          nabeel.mansurarif1@vodafone.qa
        </a>
        . A useful note is a character the scanner missed, a page count that does not match a handset, or a line that
        should have stayed in one piece.
      </p>
      <p>
        The formatter itself does not send the menu. Leave live customer text out of the email. Version 1 has no
        message form, because a form would mean a server, and this version does not upload the menu.
      </p>
    </PolicyArticle>
  );
}
