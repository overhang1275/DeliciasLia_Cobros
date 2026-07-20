"use client";

export function PrintButton() {
  return (
    <button className="ui-button-secondary min-h-11 px-4 no-print" type="button" onClick={() => window.print()}>
      📄 PDF
    </button>
  );
}
