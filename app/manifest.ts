import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Delicias Lia",
    short_name: "Delicias Lia",
    description: "Ventas, fiados e inventario",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf3",
    theme_color: "#f6a6bc",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
