import type { Metadata } from "next";
import { PaginateTool } from "@/components/paginate-tool";
import { Explainer } from "@/components/tool-frame";

export const metadata: Metadata = {
  title: "Paginate a USSD menu",
  description: "Split one USSD screen into pages that fit an octet budget, with or without Next and Back.",
};

export default function PaginatePage() {
  return (
    <>
      <PaginateTool />
      <Explainer>
        <h2>Why a page is cut in the middle of a word</h2>
        <p>
          A gateway that receives more than its octet limit drops or cuts the reply. The cut is not obliged to land on
          a space. Pagination keeps an explicit line break, refuses to break a numbered option, and keeps a line that
          opens with a direction mark and closes with PDF on one page. Prose can move to the next page on a word
          boundary. A line that cannot fit even by itself is named, and the rest of the menu still paginates.
        </p>
        <h2>Next and Back spend the same budget</h2>
        <p>
          On a real session the handset answers with a reply such as 99. That line is part of the string, so the body
          is shortened until the navigation fits. The first page omits Back when there is nowhere to go back to. The
          last page omits Next. A single page that already fits adds neither line. If a menu line uses the same reply
          key, the page is marked. The check looks at the key only, so 99 clashes with 99 and not with 9 or 199.
        </p>
        <p>
          Some networks already append their own More and Back. Adding a second pair shortens the body and doubles the
          footer. Without links is the split for that case. Vodafone Qatar does not publish different wording, so the
          fields stay on 99, a colon and a space, and Next, and on 0, a colon and a space, and Back, until you change
          them. A key may be digits, #, or *.
        </p>
        <h2>The carriage-return pad</h2>
        <p>
          If a GSM page has a septet count one below a multiple of eight, the spare bits in the last octet can look
          like an @ unless the string is padded with a carriage return. That pad can show up as an extra blank line.
          The page is flagged. A page that has already switched to UCS-2 does not use this pad. Shortening the page is
          your decision.
        </p>
        <p>
          Copied pages use a line feed unless you choose a carriage return. Which one a gateway wants is an assumption,
          so the choice stays on the page. The phone beside the width control is a stand-in for judging the line
          length. It is not a measured Vodafone Qatar handset.
        </p>
      </Explainer>
    </>
  );
}
