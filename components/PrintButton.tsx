"use client";

import { Printer } from "@/components/AppIcon";

export function PrintButton() {
  return (
    <button className="ui-button-compact gap-2 no-print" type="button" onClick={() => window.print()}>
      <Printer aria-hidden="true" className="size-4" />
      PDF
    </button>
  );
}
