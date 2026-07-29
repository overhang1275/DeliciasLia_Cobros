import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { endpoint, keys, clienteId } = await request.json();

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    await db.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh: keys.p256dh, auth: keys.auth, clienteId: clienteId || null },
      create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, clienteId: clienteId || null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error guardando suscripción:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
