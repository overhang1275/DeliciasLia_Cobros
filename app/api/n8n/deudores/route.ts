import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { moneyFormatter } from "@/lib/formatters";
import { publicEstadoUrl } from "@/lib/public-url";
import { saldoVentas } from "@/lib/saldos";

export const dynamic = "force-dynamic";

const money = moneyFormatter;

function autorizado(request: NextRequest) {
  const key = process.env.N8N_API_KEY;
  return !!key && request.headers.get("authorization") === `Bearer ${key}`;
}

export async function GET(request: NextRequest) {
  if (!process.env.N8N_API_KEY) return NextResponse.json({ error: "N8N_API_KEY no configurada" }, { status: 503 });
  if (!autorizado(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const clientes = await db.cliente.findMany({
    where: { activo: true, ventas: { some: { estado: { in: ["FIADA", "PARCIAL"] } } } },
    include: {
      ventas: {
        where: { estado: { in: ["FIADA", "PARCIAL"] } },
        include: { pagos: true }
      }
    },
    orderBy: { nombre: "asc" }
  });

  const deudores = clientes
    .map((cliente) => {
      const saldo = saldoVentas(cliente.ventas);

      return {
        clienteId: cliente.id,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        saldo,
        saldoFormato: money.format(saldo),
        estadoCuentaUrl: cliente.estadoToken ? publicEstadoUrl(cliente.estadoToken) : null
      };
    })
    .filter((cliente) => cliente.saldo > 0);

  return NextResponse.json({
    count: deudores.length,
    total: deudores.reduce((sum, cliente) => sum + cliente.saldo, 0),
    totalFormato: money.format(deudores.reduce((sum, cliente) => sum + cliente.saldo, 0)),
    deudores
  });
}
