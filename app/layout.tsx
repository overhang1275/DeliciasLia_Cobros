import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Delicias Lia",
  description: "Ventas, fiados e inventario para Delicias Lia",
  applicationName: "Delicias Lia",
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/api/logo",
    icon: "/api/logo",
    shortcut: "/api/logo"
  }
};

export const viewport: Viewport = {
  themeColor: "#f6a6bc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
