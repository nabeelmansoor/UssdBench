import type { Metadata } from "next";
import { AlignTool } from "@/components/align-tool";
import { Explainer } from "@/components/tool-frame";

export const metadata: Metadata = {
  title: "Align a USSD screen",
  description: "Pad a USSD menu to a column width and force right-to-left or left-to-right per line.",
};

export default function AlignPage() {
  return (
    <>
      <AlignTool />
      <Explainer>
        <h2>Columns, not code points</h2>
        <p>
          A fullwidth digit looks like an option number and takes two columns. A combining mark adds none. A direction
          mark adds none, and it still costs a character in the octet budget. Arabic letters are one column.
          Ambiguous-width characters are counted as one, which matches a handset that is not set to an East Asian
          width. There is no switch for the other choice in this version.
        </p>
        <h2>Width is a setting</h2>
        <p>
          There is no standard USSD line width. Feature phones commonly wrap somewhere in the high teens or low
          twenties. Smartphones often show more, and many of them scroll instead of wrapping the same way. The control
          starts in the feature-phone range, with the mark at 16. 16 is the start of that range. It is not a Vodafone
          Qatar standard, and neither is 20. Paginate uses the same width for its phone.
        </p>
        <h2>One direction pair per line</h2>
        <p>
          A menu in Qatar often mixes an English option key with an Arabic label. Handsets disagree about the
          direction, and a USSD string has no stylesheet. Right to left inserts RLE (U+202B) at the start of that line
          and PDF (U+202C) at the end. Left to right inserts LRE (U+202A) and the same PDF. Applying the same direction
          again does not stack a second pair.
        </p>
        <p>
          Per line is the wrap that survives a page break. One embedding around the whole screen would leave the
          opening mark on one page and the PDF on the next, and every following line would stay reversed. It would also
          pull a Latin option key and the Next line into the Arabic direction. A line that opens and closes itself is
          finished. The next line starts clean.
        </p>
        <p>
          RLE, LRE, and PDF are outside GSM 7-bit. Any one of them switches that whole page to UCS-2 and the
          80-character budget inside 160 octets. Each mark is one of those 80 characters and zero columns. A forced
          line costs two characters before its letters. Five forced lines cost ten. The phone hides the marks and paints
          the line in the forced direction. Emoji and flag sequences are marked as unsafe. This version does not invent
          a tidy width for them beyond two columns.
        </p>
      </Explainer>
    </>
  );
}
