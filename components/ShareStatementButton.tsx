"use client";

import { useState } from "react";

export function ShareStatementButton({ cliente }: { cliente: string }) {
  const [done, setDone] = useState(false);

  async function share() {
    const url = window.location.href;
    const text = `Estado de cuenta de ${cliente}: ${url}`;

    if (navigator.share) {
      await navigator.share({ text, title: "Estado de cuenta", url });
    } else {
      await navigator.clipboard.writeText(url);
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    }
  }

  return (
    <button className="ui-button-primary min-h-11 shrink-0 gap-2 px-4" onClick={share} type="button">
      <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.6 13.5 6.8 4" />
        <path d="m15.4 6.5-6.8 4" />
      </svg>
      {done ? "Copiado" : "Compartir"}
    </button>
  );
}
