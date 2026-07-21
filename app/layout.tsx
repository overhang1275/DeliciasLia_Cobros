import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { BottomNavigation } from "@/components/BottomNavigation";
import { RouteMotion } from "@/components/RouteMotion";
import { getConfiguracion } from "@/lib/configuracion";
import { isValidSessionToken, SESSION_COOKIE } from "@/lib/session";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { negocioNombre } = await getConfiguracion();

  return {
    title: negocioNombre,
    description: `Ventas, créditos, pedidos y cobros para ${negocioNombre}`,
    applicationName: negocioNombre,
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: negocioNombre
    },
    icons: {
      apple: "/api/logo",
      icon: "/api/logo",
      shortcut: "/api/logo"
    }
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const [cookieStore, config] = await Promise.all([cookies(), getConfiguracion()]);
  const hasSession = await isValidSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  const tema = ["system", "light", "dark"].includes(config.tema) ? config.tema : "system";

  return (
    <html lang="es" data-theme={tema}>
      <body>
        <RouteMotion>{children}</RouteMotion>
        {hasSession ? <BottomNavigation /> : null}
      </body>
    </html>
  );
}
