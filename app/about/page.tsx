import type { Metadata } from "next";
import Link from "next/link";
import { PolicyArticle } from "@/components/tool-frame";

export const metadata: Metadata = {
  title: "About",
  description: "What USSD Bench does: step-wise USSD and SMS formatters that run entirely in your browser.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PolicyArticle
      title="About"
      lede="USSD Bench is a USSD and SMS workbench for preparing menus and messages before they reach a gateway."
    >
      <p>
        Menu text that looks fine in an editor often fails on a handset. A curly quote from a phone or a Mac switches the
        whole string to UCS-2 and halves the room on a page. A long option runs past the page limit. An Arabic page shows
        in the wrong direction. USSD Bench catches those problems while you write, in every language you send.
      </p>
      <h2>Two step-by-step formatters</h2>
      <p>
        The <Link href="/ussd">USSD formatter</Link> is a five-step wizard. In <strong>Input</strong> you pick the
        languages and write one menu per language; smart characters such as curly quotes, dashes, ellipses, and special
        spaces are replaced automatically and highlighted. <strong>Encoding</strong> picks GSM-7, Latin-1, or UCS-2 for
        each language, and you can change it. <strong>Pagination</strong> splits each menu into pages by word or by line,
        within Characters per Page (182, 160, or 80 by default), with optional Next and Back lines in each
        language. <strong>Alignment</strong> forces a UCS-2 page right to left or left to right with one direction mark at
        the start of the page and PDF at the end. <strong>Character Review</strong> is optional and lists anything left
        that a gateway might reject.
      </p>
      <p>
        The <Link href="/sms">SMS formatter</Link> has the same languages, smart-character replacement, and per-language
        encoding, then counts segments for each message: 160 and 153 for GSM-7, 140 and 134 for Latin-1, and 70 and 67
        for UCS-2.
      </p>
      <p>
        Both show a phone preview with a smartphone or feature-phone screen and an editable column count. The preview is a
        stand-in for line length and direction, not a measurement of a particular handset.
      </p>
      <h2>What it does not do</h2>
      <p>
        USSD Bench works on one screen or one message at a time. It does not keep a menu tree, an account, or operator
        presets. It does not send USSD or SMS, price a message, or apply a national language shift table. Ads are off.
      </p>
    </PolicyArticle>
  );
}
