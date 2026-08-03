import { EstadoPedido } from "@prisma/client";
import { db } from "./db";

export function obtenerPedidosPage(q: string, page: number, pageSize: number) {
  const where = {
    estado: EstadoPedido.PENDIENTE,
    ...(q ? { OR: [{ cliente: { nombre: { contains: q } } }, { producto: { nombre: { contains: q } } }, { notas: { contains: q } }] } : {})
  };

  return Promise.all([
    db.pedido.findMany({
      where,
      include: { cliente: true, producto: true },
      orderBy: [{ fechaEntrega: "asc" }, { fechaPedido: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    db.pedido.count({ where })
  ]);
}
