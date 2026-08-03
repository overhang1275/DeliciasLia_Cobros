import { db } from "./db";

export function listarClientesActivos() {
  return db.cliente.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } });
}

export async function listarClientesConEstado(q: string) {
  const where = {
    activo: true,
    ...(q ? { OR: [{ nombre: { contains: q } }, { telefono: { contains: q } }] } : {})
  };

  const clientes = await db.cliente.findMany({
    where,
    orderBy: [{ nombre: "asc" }],
    include: {
      _count: { select: { ventas: true } },
      ventas: {
        where: {
          OR: [{ estado: { in: ["FIADA", "PARCIAL"] } }, { cambioPendiente: true }]
        },
        include: { pagos: true }
      }
    }
  });

  return clientes
    .map((cliente) => {
      const saldo = cliente.ventas.reduce((total, venta) => {
        const pagado = venta.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
        return total + Math.max(0, Number(venta.total) - pagado);
      }, 0);
      const cambioPendiente = cliente.ventas.reduce((total, venta) => total + (venta.cambioPendiente ? Number(venta.cambioMonto) : 0), 0);
      const deudaMasVieja = cliente.ventas
        .filter((venta) => Number(venta.total) - venta.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0) > 0)
        .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())[0]?.fecha;
      return { ...cliente, cambioPendiente, deudaMasVieja, saldo };
    })
    .sort((a, b) => {
      if (a.saldo > 0 && b.saldo <= 0) return -1;
      if (a.saldo <= 0 && b.saldo > 0) return 1;
      if (a.deudaMasVieja && b.deudaMasVieja) return a.deudaMasVieja.getTime() - b.deudaMasVieja.getTime();
      return a.nombre.localeCompare(b.nombre);
    });
}
