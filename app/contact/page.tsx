import type { Metadata } from "next";
import { PolicyArticle } from "@/components/tool-frame";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach Nabeel Mansoor, who maintains USSD Bench.",
};

export default function ContactPage() {
  return (
    <PolicyArticle title="Contact" lede="USSD Bench is built and maintained by Nabeel Mansoor.">
      <p>
        Write to <a href="mailto:nabeel.mansoor@gmail.com">nabeel.mansoor@gmail.com</a>. Useful notes include a
        character that was not replaced, an encoding that looks wrong for a language, a page count that does not match a
        handset, or Arabic that shows in the wrong direction.
      </p>
      <p>
        There is no contact form, because a form would need a server and USSD Bench does not send anything you write.
        Please leave live customer text out of the email.
      </p>
    </PolicyArticle>
  );
}
