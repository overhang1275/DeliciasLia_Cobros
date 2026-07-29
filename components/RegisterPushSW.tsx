"use client";

import { useEffect } from "react";

export function RegisterPushSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    navigator.serviceWorker
      .register("/push-sw.js", { scope: "/" })
      .catch(() => {
        // SW no disponible, ignorar
      });
  }, []);

  return null;
}
