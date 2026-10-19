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
        <h2>There is no character named Apple space</h2>
        <p>
          The name is shorthand for what arrives from an iPhone, from Notes, Safari, Messages, or a page that was
          itself copied from one of those. Smart punctuation turns a straight quote into a curly quote and a double
          hyphen into an em dash. Some locales insert a narrow no-break space before punctuation. The text looks
          ordinary. A gateway that only accepts GSM 7-bit then rejects it, or the length changes, or a menu option
          stops matching because the space is not U+0020.
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
