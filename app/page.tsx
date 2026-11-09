import type { Metadata } from "next";
import { HomeScreen } from "@/components/home-screen";
import { Explainer } from "@/components/tool-frame";

export const metadata: Metadata = {
  description:
    "Format USSD menus and SMS per language: smart-character cleanup, GSM-7, Latin-1 or UCS-2, pages, direction, and segments.",
};

export default function HomePage() {
  return (
    <>
      <HomeScreen />
      <Explainer wide>
        <h2>What 160 octets means</h2>
        <p>
          A MAP USSD string is specified at up to 160 octets. With the GSM 7-bit alphabet those octets pack to 182
          septets. Latin-1 fits 160 characters and UCS-2 fits 80. That 182 is a packing result, not a promise that every
          network will accept 182 characters of menu text, so Characters per Page stays editable for each language.
        </p>
        <h2>One encoding per language</h2>
        <p>
          English usually stays in GSM-7, French or Spanish with ê or á needs Latin-1, and Arabic, Urdu, or Hindi needs
          UCS-2. Each language is detected on its own text, after the smart characters a phone or a Mac adds have been
          replaced, and you can override it.
        </p>
        <h2>What stays on this device</h2>
        <p>
          The text is kept in this browser tab for the visit. Formatting does not upload it. Ads are off. There is no
          account and no saved menu on a server.
        </p>
      </Explainer>
    </>
  );
}
