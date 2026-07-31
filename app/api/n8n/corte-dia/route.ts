import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appDateFormatter, todayRange } from "@/lib/timezone";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });
const date = appDateFormatter({ dateStyle: "full" });

function autorizado(request: NextRequest) {
  const key = process.env.N8N_API_KEY;
  return !!key && request.headers.get("authorization") === `Bearer ${key}`;
}

export async function GET(request: NextRequest) {
  if (!process.env.N8N_API_KEY) return NextResponse.json({ error: "N8N_API_KEY no configurada" }, { status: 503 });
  if (!autorizado(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const rangoHoy = todayRange();
  const [ventas, piezas, pagosPorMetodo, credito, cambiosPendientes] = await Promise.all([
    db.venta.findMany({
      where: { fecha: rangoHoy, estado: { not: "CANCELADA" } },
      select: { id: true, total: true, estado: true }
    }),
    db.detalleVenta.aggregate({
      where: { venta: { fecha: rangoHoy, estado: { not: "CANCELADA" } } },
      _sum: { cantidad: true }
    }),
    db.pago.groupBy({
      by: ["metodo"],
      where: { fecha: rangoHoy },
      _sum: { monto: true }
    }),
    db.venta.aggregate({
      where: { fecha: rangoHoy, estado: { in: ["FIADA", "PARCIAL"] } },
      _sum: { total: true }
    }),
    db.venta.aggregate({
      where: { cambioPendiente: true },
      _sum: { cambioMonto: true }
    })
  ]);

  const cobrado = pagosPorMetodo.reduce((sum, pago) => sum + Number(pago._sum.monto || 0), 0);
  const efectivo = pagosPorMetodo.find((pago) => pago.metodo === "EFECTIVO")?._sum.monto || 0;
  const transferencia = pagosPorMetodo.find((pago) => pago.metodo === "TRANSFERENCIA")?._sum.monto || 0;
  const creditoTotal = Number(credito._sum.total || 0);
  const cambiosTotal = Number(cambiosPendientes._sum.cambioMonto || 0);

  return NextResponse.json({
    fecha: date.format(new Date()),
    ventas: {
      cantidad: ventas.length,
      piezas: piezas._sum.cantidad || 0,
      total: ventas.reduce((sum, venta) => sum + Number(venta.total), 0),
      totalFormato: money.format(ventas.reduce((sum, venta) => sum + Number(venta.total), 0))
    },
    cobrado: {
      total: cobrado,
      totalFormato: money.format(cobrado),
      efectivo: Number(efectivo),
      efectivoFormato: money.format(Number(efectivo)),
      transferencia: Number(transferencia),
      transferenciaFormato: money.format(Number(transferencia))
    },
    credito: {
      total: creditoTotal,
      totalFormato: money.format(creditoTotal)
    },
    cambiosPendientes: {
      total: cambiosTotal,
      totalFormato: money.format(cambiosTotal)
    },
    mensaje: [
      `Corte de caja - ${date.format(new Date())}`,
      `Ventas: ${ventas.length}`,
      `Piezas vendidas: ${piezas._sum.cantidad || 0}`,
      `Cobrado: ${money.format(cobrado)}`,
      `Efectivo: ${money.format(Number(efectivo))}`,
      `Transferencia: ${money.format(Number(transferencia))}`,
      `Credito generado: ${money.format(creditoTotal)}`,
      `Cambios pendientes: ${money.format(cambiosTotal)}`
    ].join("\n")
  });
}
