"use client";

import { useState, useEffect, useCallback } from "react";

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0)).buffer;
}

async function getVapidKey() {
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const res = await fetch("/api/push/public-key");
  if (!res.ok) return "";
  return ((await res.json()) as { publicKey?: string }).publicKey || "";
}

interface PushSubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export function usePushNotifications(clienteId?: number) {
  const [sub, setSub] = useState<PushSubscriptionJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setLoading(false);
      return;
    }

    setSupported(true);
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((s) => setSub(s ? s.toJSON() as unknown as PushSubscriptionJSON : null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const subscribe = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      if (Notification.permission !== "granted" && (await Notification.requestPermission()) !== "granted") {
        throw new Error("Permiso bloqueado en el navegador");
      }

      const vapidKey = await getVapidKey();
      if (!vapidKey) throw new Error("Falta VAPID key");

      const reg = await navigator.serviceWorker.ready;
      const s = await reg.pushManager.subscribe({
        applicationServerKey: urlBase64ToArrayBuffer(vapidKey),
        userVisibleOnly: true,
      });

      const json = s.toJSON() as unknown as PushSubscriptionJSON;
      const res = await fetch("/api/push/subscribe", {
        body: JSON.stringify({ ...json, clienteId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!res.ok) throw new Error("No se pudo guardar");

      setSub(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo activar");
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  const unsubscribe = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const s = await reg.pushManager.getSubscription();
      if (!s) return;

      await s.unsubscribe();
      await fetch("/api/push/unsubscribe", {
        body: JSON.stringify({ endpoint: s.endpoint }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      setSub(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo desactivar");
    } finally {
      setLoading(false);
    }
  }, []);

  return { error, subscribed: !!sub, sub, loading, supported, subscribe, unsubscribe };
}
