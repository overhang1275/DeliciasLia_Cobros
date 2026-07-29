import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: "Falta endpoint" }, { status: 400 });
    }

    await db.pushSubscription.deleteMany({ where: { endpoint } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando suscripción:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
