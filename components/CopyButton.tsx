"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button
      aria-label="Copiar"
      className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]"
      onClick={copy}
      title={copied ? "Copiado" : "Copiar"}
      type="button"
    >
      {copied ? (
        <span className="text-xs font-bold">OK</span>
      ) : (
        <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
          <rect height="14" rx="2" ry="2" width="14" x="8" y="8" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      )}
    </button>
  );
}
