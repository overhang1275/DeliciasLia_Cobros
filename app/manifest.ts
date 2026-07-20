import type { MetadataRoute } from "next";
import { getConfiguracion } from "@/lib/configuracion";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { negocioNombre } = await getConfiguracion();

  return {
    name: negocioNombre,
    short_name: negocioNombre,
    description: `Ventas, fiados, pedidos y cobros para ${negocioNombre}`,
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf3",
    theme_color: "#f6a6bc",
    icons: [
      {
        src: "/api/logo",
        sizes: "192x192",
        purpose: "any"
      },
      {
        src: "/api/logo",
        sizes: "512x512",
        purpose: "any"
      },
      {
        src: "/api/logo",
        sizes: "512x512",
        purpose: "maskable"
      }
    ]
  };
}
