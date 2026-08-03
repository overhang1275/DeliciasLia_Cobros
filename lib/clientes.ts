import { db } from "./db";
import { cambioPendienteVentas, fechaSaldoMasViejo, saldoVentas } from "./saldos";

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
      const saldo = saldoVentas(cliente.ventas);
      const cambioPendiente = cambioPendienteVentas(cliente.ventas);
      const deudaMasVieja = fechaSaldoMasViejo(cliente.ventas);
      return { ...cliente, cambioPendiente, deudaMasVieja, saldo };
    })
    .sort((a, b) => {
      if (a.saldo > 0 && b.saldo <= 0) return -1;
      if (a.saldo <= 0 && b.saldo > 0) return 1;
      if (a.deudaMasVieja && b.deudaMasVieja) return a.deudaMasVieja.getTime() - b.deudaMasVieja.getTime();
      return a.nombre.localeCompare(b.nombre);
    });
}
