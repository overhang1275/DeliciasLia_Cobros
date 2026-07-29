"use client";

import { motion } from "motion/react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function PushSubscriptionButton({ clienteId }: { clienteId: number }) {
  const { error, subscribed, loading, supported, subscribe, unsubscribe } = usePushNotifications(clienteId);

  if (!supported) return null;

  return (
    <div className="flex min-h-14 items-center justify-between gap-4 rounded-2xl bg-[var(--app-bg)] px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-bold text-[var(--text-main)]">Notificaciones</p>
        <p className="ui-label">{error || (subscribed ? "Recordatorios activos" : "Activar recordatorios")}</p>
      </div>
      <motion.button
        aria-checked={subscribed}
        aria-label={subscribed ? "Desactivar notificaciones" : "Activar notificaciones"}
        className={`h-8 w-14 shrink-0 rounded-full p-1 transition-colors ${subscribed ? "bg-[var(--primary)]" : "bg-[var(--primary-soft)]"}`}
        disabled={loading}
        onClick={subscribed ? unsubscribe : subscribe}
        role="switch"
        type="button"
        whileTap={{ scale: 0.96 }}
      >
        <motion.span animate={{ x: subscribed ? 24 : 0 }} className="block size-6 rounded-full bg-white shadow-sm" transition={{ duration: 0.18, type: "spring" }} />
      </motion.button>
    </div>
  );
}
