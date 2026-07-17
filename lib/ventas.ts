import { db } from "@/lib/db";

type RegistrarVentaInput = {
  clienteId: number;
  productoId: number;
  piezas: number;
  estado: "PAGADA" | "FIADA";
  metodoPago?: "EFECTIVO" | "TRANSFERENCIA";
};

export async function registrarVenta({ clienteId, productoId, piezas, estado, metodoPago = "EFECTIVO" }: RegistrarVentaInput) {
  const producto = await db.producto.findUniqueOrThrow({ where: { id: productoId } });
  const precioUnitario = Number(producto.precioVenta);
  const costoUnitario = Number(producto.costo);
  const total = precioUnitario * piezas;
  const costoTotal = costoUnitario * piezas;

  return db.venta.create({
    data: {
      clienteId,
      estado,
      subtotal: total,
      total,
      costoTotal,
      utilidadTotal: total - costoTotal,
      observaciones: `${estado === "FIADA" ? "Fiado" : "Venta"}: ${producto.nombre}`,
      detalles: {
        create: {
          productoId: producto.id,
          cantidad: piezas,
          precioUnitario,
          costoUnitario,
          subtotal: total
        }
      },
      pagos:
        estado === "PAGADA"
          ? {
              create: {
                monto: total,
                metodo: metodoPago
              }
            }
          : undefined
    }
  });
}
