"use client";

import { Printer } from "@/components/AppIcon";

export function PrintButton() {
  return (
    <button className="ui-button-secondary min-h-11 gap-2 px-4 no-print" type="button" onClick={() => window.print()}>
      <Printer aria-hidden="true" className="size-4" />
      PDF
    </button>
  );
}
