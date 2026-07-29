import { NextRequest, NextResponse } from "next/server";
import { enviarRecordatorioPago } from "@/lib/push";

export async function POST(request: NextRequest) {
  try {
    const { clienteId } = await request.json();
    if (!clienteId) return NextResponse.json({ error: "Falta clienteId" }, { status: 400 });

    const result = await enviarRecordatorioPago({ clienteId });
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("Error enviando notificación:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
