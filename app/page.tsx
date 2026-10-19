import type { Metadata } from "next";
import { HomeScreen } from "@/components/home-screen";
import { Explainer } from "@/components/tool-frame";

export const metadata: Metadata = {
  description:
    "Paste one USSD menu, fit it to 160 octets, clean hidden characters, and count SMS segments in the browser.",
};

export default function HomePage() {
  return (
    <>
      <HomeScreen />
      <Explainer wide>
        <h2>What 160 octets means</h2>
        <p>
          A MAP USSD string is specified at up to 160 octets. With the GSM 7-bit alphabet those octets pack to 182
          septets. That 182 is a packing result, not a promise that every network will accept 182 characters of menu
          text. One character outside the GSM alphabet switches the whole string to UCS-2, and the same 160 octets then
          hold 80 characters. A curly quote, an ellipsis, or a direction mark is enough to flip the page.
        </p>
        <h2>Vodafone Qatar</h2>
        <p>
          Vodafone Qatar is the named preset, and it uses that same 160-octet ceiling. Public pages describe *100# for
          balance, recharge, bill limit, and menu language, in English and Arabic. They do not publish a USSD menu
          octet cap, and they do not publish Next and Back wording, so this tool does not invent either. Next starts at
          99, a colon and a space, and Next. Back starts at 0, a colon and a space, and Back.
        </p>
        <p>
          The SMS Connect tariff does publish a single-message size: 160 characters when the message uses a Latin
          alphabet, and 70 when it uses a non-Latin alphabet such as Arabic. That tariff is about SMS. It is not copied
          into the USSD page budget.
        </p>
        <h2>SMS segments</h2>
        <p>
          An SMS user-data field is 140 octets. GSM 7-bit fits 160 septets in one segment and 153 in each part of a
          concatenated message. UCS-2 fits 70, then 67. A message of 161 septets is two segments, 153 and 8, not almost
          one. Characters in the extension table, including €, cost two septets and stay in GSM. A curly quote does not.
        </p>
        <h2>What stays on this device</h2>
        <p>
          The menu is kept in this browser tab for the visit. Formatting does not upload it. Ads are off. There is no
          account and no saved menu on a server.
        </p>
      </Explainer>
    </>
  );
}
