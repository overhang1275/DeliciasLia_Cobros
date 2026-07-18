import { db } from "@/lib/db";

type RegistrarVentaInput = {
  clienteId: number;
  productoId: number;
  piezas: number;
  estado: "PAGADA" | "FIADA";
  metodoPago?: "EFECTIVO" | "TRANSFERENCIA";
  cambioPendiente?: boolean;
  montoRecibido?: number;
  fecha?: Date;
};

export async function registrarVenta({ clienteId, productoId, piezas, estado, metodoPago = "EFECTIVO", cambioPendiente = false, montoRecibido = 0, fecha }: RegistrarVentaInput) {
  const producto = await db.producto.findUniqueOrThrow({ where: { id: productoId } });
  const precioUnitario = Number(producto.precioVenta);
  const costoUnitario = Number(producto.costo);
  const total = precioUnitario * piezas;
  const costoTotal = costoUnitario * piezas;
  const cambioMonto = estado === "PAGADA" && metodoPago === "EFECTIVO" && cambioPendiente ? Math.max(0, montoRecibido - total) : 0;

  return db.venta.create({
    data: {
      clienteId,
      fecha,
      estado,
      subtotal: total,
      total,
      costoTotal,
      utilidadTotal: total - costoTotal,
      cambioPendiente: cambioMonto > 0,
      cambioMonto,
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
