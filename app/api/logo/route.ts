import { NextResponse } from "next/server";
import { getConfiguracion } from "@/lib/configuracion";

export const dynamic = "force-dynamic";

const fallback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#fff7ed"/>
  <circle cx="256" cy="228" r="118" fill="#f6a6bc"/>
  <path d="M145 306h222l-30 98H175z" fill="#4b2e2a"/>
  <path d="M183 221c25-47 121-50 146 0" fill="none" stroke="#fff" stroke-width="30" stroke-linecap="round"/>
</svg>`;

export async function GET() {
  const { logoDataUrl } = await getConfiguracion();
  const match = logoDataUrl?.match(/^data:([^;]+);base64,(.+)$/);

  if (match) {
    return new NextResponse(Buffer.from(match[2], "base64"), {
      headers: { "Cache-Control": "no-store", "Content-Type": match[1] }
    });
  }

  return new NextResponse(fallback, {
    headers: { "Cache-Control": "no-store", "Content-Type": "image/svg+xml" }
  });
}
