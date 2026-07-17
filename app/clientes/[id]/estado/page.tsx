import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EstadoClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clienteId = Number(id);
  const cliente = Number.isInteger(clienteId)
    ? await db.cliente.findUnique({ where: { id: clienteId }, select: { estadoToken: true } })
    : null;

  if (!cliente?.estadoToken) notFound();

  redirect(`/estado/${cliente.estadoToken}`);
}
