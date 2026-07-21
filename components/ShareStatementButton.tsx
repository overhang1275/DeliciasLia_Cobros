"use client";

import { useState } from "react";
import { Share2 } from "@/components/AppIcon";

function whatsappPhone(phone?: string | null) {
  const digits = (phone || "").replace(/\D/g, "");
  return digits.length === 10 ? `52${digits}` : digits;
}

export function ShareStatementButton({ cliente, telefono }: { cliente: string; telefono?: string | null }) {
  const [done, setDone] = useState(false);

  async function share() {
    const url = window.location.href;
    const text = `Hola ${cliente}.\n\nTe dejo tu estado de cuenta:\n${url}\n\nCualquier duda, favor de mandar mensaje.`;
    const phone = whatsappPhone(telefono);

    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    } else {
      await navigator.clipboard.writeText(url);
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    }
  }

  return (
    <button className="ui-button-primary min-h-11 shrink-0 gap-2 px-4" onClick={share} type="button">
      <Share2 aria-hidden="true" className="size-4" />
      {done ? "Copiado" : "WhatsApp"}
    </button>
  );
}
