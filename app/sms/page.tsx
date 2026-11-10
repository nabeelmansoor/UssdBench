import type { Metadata } from "next";
import { SmsWizard } from "@/components/sms/sms-wizard";
import { Explainer } from "@/components/tool-frame";

export const metadata: Metadata = {
  title: "SMS formatter",
  description: "Format an SMS per language: smart-character cleanup, GSM-7, Latin-1 or UCS-2, and segment counts.",
  alternates: { canonical: "/sms" },
};

export default function SmsPage() {
  return (
    <>
      <SmsWizard />
      <Explainer>
        <h2>140 octets, three encodings</h2>
        <p>
          An SMS user-data field is 140 octets. GSM-7 packs 160 septets into one segment and 153 into each part of a
          concatenated message, because the usual 8-bit reference header takes 6 octets. Latin-1 is sent as 8-bit data:
          140 characters, then 134. UCS-2 holds 70 characters, then 67.
        </p>
        <h2>One curly quote, the whole message</h2>
        <p>
          A single character outside the GSM alphabet switches the entire message to a wider encoding. Curly quotes,
          dashes, ellipses, and special spaces from a phone or a Mac are replaced before counting, so they no longer do.
          Real letters are not transliterated. The extension table, including €, costs two septets and stays in GSM-7.
        </p>
      </Explainer>
    </>
  );
}
