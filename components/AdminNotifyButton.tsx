"use client";

import { useState } from "react";

export function AdminNotifyButton({ clienteId, disabled = false }: { clienteId: number; disabled?: boolean }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId }),
      });
      if (res.ok) setSent(true);
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  return (
    <button
      className="ui-button-compact disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled || sending || sent}
      onClick={handleSend}
      title={disabled ? "El cliente debe activar notificaciones primero" : "Enviar recordatorio"}
      type="button"
    >
      {disabled ? "Sin notificaciones activas" : sent ? "Enviado" : sending ? "Enviando..." : "Enviar recordatorio"}
    </button>
  );
}
