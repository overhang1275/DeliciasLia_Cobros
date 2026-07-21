"use client";

import { useState } from "react";
import { Check, Copy } from "@/components/AppIcon";

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
      {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
    </button>
  );
}
