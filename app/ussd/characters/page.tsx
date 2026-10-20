import type { Metadata } from "next";
import { CharactersTool } from "@/components/characters-tool";
import { Explainer } from "@/components/tool-frame";

export const metadata: Metadata = {
  title: "Check USSD characters",
  description: "Find no-break spaces, curly quotes, fullwidth lookalikes, and other characters outside GSM 7-bit.",
};

export default function CharactersPage() {
  return (
    <>
      <CharactersTool />
      <Explainer>
        <h2>Apple space and smart punctuation</h2>
        <p>
          No Unicode character is literally called Apple space — developers use that name for special spaces and smart
          punctuation pasted from iOS. Notes, Safari, and Messages often turn straight quotes into curly quotes, hyphens
          into em dashes, and ordinary spaces into no-break or narrow spaces. The text looks fine on screen. A gateway
          that only accepts GSM 7-bit may reject it, the octet count changes, or a menu option stops matching because
          the space is not U+0020.
        </p>
        <h2>What the one-step cleanup will and will not touch</h2>
        <p>
          Replacing spaces and safe invisibles turns the space separators into a normal space and drops zero-width
          space, the byte order mark, a word joiner, and a soft hyphen. The punctuation action also offers a straight
          quote, a hyphen, and three dots for an ellipsis. The ellipsis grows the text by two characters, and that new
          length is shown before you apply it. You can skip the punctuation and fix spaces only.
        </p>
        <p>
          Real letters are not transliterated. Arabic stays Arabic. Accented letters that are already in the GSM
          alphabet, such as é, stay as they are. ê is not in that alphabet, so it stays and the string stays UCS-2.
          Direction marks are listed as direction marks and are not removed. A zero-width non-joiner or joiner stays
          until you remove that one occurrence. A blanket delete would corrupt Arabic, Persian, and emoji that were
          pasted on purpose.
        </p>
        <h2>Fullwidth lookalikes</h2>
        <p>
          A fullwidth digit is a different character, two columns wide, and outside GSM. The list offers the ordinary
          ASCII character. Folding updates the shared text, so the column counts on Align and the page sizes on
          Paginate change with it.
        </p>
      </Explainer>
    </>
  );
}
