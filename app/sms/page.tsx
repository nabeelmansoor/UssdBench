import type { Metadata } from "next";
import { SmsTool } from "@/components/sms-tool";
import { Explainer } from "@/components/tool-frame";

export const metadata: Metadata = {
  title: "SMS segments",
  description: "Count GSM 7-bit and UCS-2 SMS segments, including extension characters such as the euro sign.",
};

export default function SmsPage() {
  return (
    <>
      <SmsTool />
      <Explainer>
        <h2>140 octets, two encodings</h2>
        <p>
          An SMS user-data field is 140 octets. GSM 7-bit packs 160 septets into one segment. A concatenated message
          spends 6 octets on the usual 8-bit reference header, so each part holds 153 septets. UCS-2 holds 70 characters,
          then 67. Vodafone Qatar’s published single-message sizes, 160 for a Latin alphabet and 70 for a non-Latin
          alphabet, match that single-segment pair. This page does not add a different segmentation rule.
        </p>
        <h2>One curly quote, the whole message</h2>
        <p>
          A single character outside the GSM alphabet switches the entire message to UCS-2. The page names that
          character. A direction mark is a valid reason for the switch. The extension table is different: form feed, ^,
          {"{ } \\ [ ~ ] |"}, and € cost two septets and do not by themselves leave GSM. Many accented letters are
          already in the basic alphabet. ê, a curly quote, and an ellipsis are not.
        </p>
        <p>
          A message of 161 GSM septets is two segments, 153 and 8. The boundary
          is drawn in the text, and an extension character is marked because it looks like one character and costs two.
          Empty text shows zeros and asks for a paste. It is not an error.
        </p>
        <h2>Cleanup does not translate the message</h2>
        <p>
          The same space and punctuation cleanup used on the character page writes back into the shared text, and the
          segment count updates. If the message is still UCS-2 because of a real letter, such as Arabic or ê, or
          because a direction mark is still there, the cleanup leaves that character in place. National language shift
          tables, Latin-1, and the 152/66 concatenation header are route settings for later. This page shows 160/153 and
          70/67 only.
        </p>
      </Explainer>
    </>
  );
}
