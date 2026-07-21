"use client";

import { Toast } from "@base-ui/react/toast";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const toastMessages: Record<string, string> = {
  cambio: "Cambio marcado como entregado.",
  cliente: "Cliente guardado.",
  configuracion: "Configuración guardada.",
  producto: "Producto guardado.",
  venta: "Venta guardada."
};

export function AppToasts() {
  return (
    <Toast.Provider>
      <ToastFromUrl />
      <Toast.Portal>
        <Toast.Viewport className="fixed inset-x-4 bottom-24 z-[80] mx-auto grid max-w-md gap-2 sm:bottom-6">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function ToastFromUrl() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toastManager = Toast.useToastManager();

  useEffect(() => {
    const key = searchParams.get("toast");
    const description = key ? toastMessages[key] : "";
    if (!description) return;

    toastManager.add({ description, title: "Listo" });

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("toast");
    window.history.replaceState(null, "", `${pathname}${nextParams.size ? `?${nextParams}` : ""}`);
  }, [pathname, searchParams, toastManager]);

  return null;
}

function ToastList() {
  const { toasts } = Toast.useToastManager();

  return toasts.map((toast) => (
    <Toast.Root className="rounded-2xl border bg-white p-4 text-[var(--text-main)] shadow-lg" key={toast.id} toast={toast}>
      <Toast.Content className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <Toast.Title className="font-bold text-[var(--brand)]" />
          <Toast.Description className="text-sm text-[var(--text-muted)]" />
        </div>
        <Toast.Close className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-bold text-[var(--primary)]">Cerrar</Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ));
}
