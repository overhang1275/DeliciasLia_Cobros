import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { BottomNavigation } from "@/components/BottomNavigation";
import { getConfiguracion } from "@/lib/configuracion";
import { isValidSessionToken, SESSION_COOKIE } from "@/lib/session";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { negocioNombre } = await getConfiguracion();

  return {
    title: negocioNombre,
    description: `Ventas, saldos pendientes, pedidos y cobros para ${negocioNombre}`,
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
  themeColor: "#f6a6bc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const hasSession = await isValidSessionToken((await cookies()).get(SESSION_COOKIE)?.value);

  return (
    <html lang="es">
      <body>
        {children}
        {hasSession ? <BottomNavigation /> : null}
      </body>
    </html>
  );
}
