import { NextResponse } from "next/server";

export function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) return NextResponse.json({ error: "Falta VAPID key" }, { status: 500 });
  return NextResponse.json({ publicKey });
}
