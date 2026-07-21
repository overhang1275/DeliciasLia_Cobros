"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, X } from "@/components/AppIcon";

const messages: Record<string, string> = {
  cambio: "Cambio marcado como entregado.",
  cliente: "Cliente guardado correctamente.",
  "cliente-eliminado": "Cliente eliminado correctamente.",
  configuracion: "Configuración guardada correctamente.",
  credito: "Crédito guardado correctamente.",
  eliminado: "Crédito eliminado correctamente.",
  liquidado: "Deuda liquidada correctamente.",
  pago: "Pago registrado correctamente.",
  pedido: "Pedido guardado correctamente.",
  "pedido-cancelado": "Pedido cancelado correctamente.",
  producto: "Producto guardado correctamente.",
  venta: "Venta guardada correctamente."
};

export function AppToast() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const key = searchParams.get("guardado");
    const nextMessage = key ? messages[key] : "";
    if (!nextMessage) return;

    setMessage(nextMessage);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("guardado");
    const query = params.toString();
    window.history.replaceState(null, "", `${pathname}${query ? `?${query}` : ""}`);

    const timeout = window.setTimeout(() => setMessage(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [pathname, searchParams]);

  if (!message) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-[80] mx-auto max-w-md rounded-2xl border bg-white p-4 text-[var(--text-main)] shadow-lg sm:bottom-6" role="status">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-green-50 text-green-700" aria-hidden="true">
          <Check className="size-5" />
        </span>
        <p className="min-w-0 flex-1 text-sm font-bold">{message}</p>
        <button className="ui-icon-button size-9 rounded-full" type="button" aria-label="Cerrar aviso" title="Cerrar aviso" onClick={() => setMessage("")}>
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}
