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
        <p>
          Reply-key clashes, Vodafone Qatar presets, and carriage-return padding are covered in the collapsible help on
          the tool. The phone preview is a stand-in for line length, not a measured handset.
        </p>
      </Explainer>
    </>
  );
}
