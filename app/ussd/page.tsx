import type { Metadata } from "next";
import { Explainer } from "@/components/tool-frame";
import { UssdWizard } from "@/components/ussd/ussd-wizard";

export const metadata: Metadata = {
  title: "USSD formatter",
  description:
    "Format a USSD menu per language: smart-character cleanup, GSM-7, Latin-1 or UCS-2, pages that fit, and forced direction.",
};

export default function UssdPage() {
  return (
    <>
      <UssdWizard />
      <Explainer>
        <h2>Characters per Page</h2>
        <p>
          A MAP USSD string is specified at up to 160 octets. GSM-7 packs those octets into 182 septets, Latin-1 spends
          one octet per character for 160, and UCS-2 spends two for 80. Each language starts from the default for its
          own encoding. An extension character such as € costs two septets in GSM-7.
        </p>
        <h2>Word or line</h2>
        <p>
          By word fills each page and breaks between words, even in the middle of a line. By line keeps every line whole
          and moves it to the next page when it does not fit. A single line that is longer than a whole page is split at
          a word. Next and Back lines are part of the page and use the same budget.
        </p>
        <h2>Direction marks are per page</h2>
        <p>
          Right puts RLE (U+202B) at the start of every page and Left puts LRE (U+202A) there. PDF (U+202C) closes every
          page. The marks are not added per line. They only exist in UCS-2, so alignment is off for a GSM-7 or Latin-1
          language. Each mark is one of the 80 UCS-2 characters, and pagination counts both.
        </p>
      </Explainer>
    </>
  );
}
