import { EstadoVenta } from "@prisma/client";
import { db } from "./db";

export async function obtenerCreditosPage(q: string, page: number, pageSize: number) {
  const where = {
    estado: { in: [EstadoVenta.FIADA, EstadoVenta.PARCIAL] },
    ...(q
      ? {
          OR: [
            { cliente: { nombre: { contains: q } } },
            { detalles: { some: { producto: { nombre: { contains: q } } } } },
            { observaciones: { contains: q } }
          ]
        }
      : {})
  };

  const [ventasFiadas, total] = await Promise.all([
    db.venta.findMany({
      where,
      include: { cliente: true, detalles: { include: { producto: true } }, pagos: true },
      orderBy: { fecha: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    db.venta.count({ where })
  ]);

  const pendientes = ventasFiadas
    .map((venta) => {
      const pagado = venta.pagos.reduce((total, pago) => total + Number(pago.monto), 0);
      return { ...venta, pendiente: Number(venta.total) - pagado };
    })
    .filter((venta) => venta.pendiente > 0);
  const clienteIds = [...new Set(pendientes.map((venta) => venta.clienteId))];
  const ventasPendientesPorCliente =
    clienteIds.length > 0
      ? await db.venta.findMany({
          where: { clienteId: { in: clienteIds }, estado: { in: [EstadoVenta.FIADA, EstadoVenta.PARCIAL] } },
          include: { pagos: true }
        })
      : [];
  const totalPorCliente = new Map<number, number>();
  for (const venta of ventasPendientesPorCliente) {
    const pagado = venta.pagos.reduce((total, pago) => total + Number(pago.monto), 0);
    const pendiente = Math.max(0, Number(venta.total) - pagado);
    totalPorCliente.set(venta.clienteId, (totalPorCliente.get(venta.clienteId) || 0) + pendiente);
  }

  return { pendientes, total, totalPorCliente };
}
