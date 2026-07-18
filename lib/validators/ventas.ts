import { z } from "zod";

export const ventaSchema = z.object({
  clienteId: z.coerce.number().int().positive("Selecciona un cliente."),
  productoId: z.coerce.number().int().positive("Selecciona un producto."),
  piezas: z.coerce.number().int().positive("Las piezas deben ser mayor a 0."),
  estado: z.enum(["PAGADA", "FIADA"]),
  metodoPago: z.enum(["EFECTIVO", "TRANSFERENCIA"]).default("EFECTIVO"),
  cambioPendiente: z.preprocess((value) => value === "on", z.boolean()),
  montoRecibido: z.preprocess((value) => (value === "" || value == null ? 0 : value), z.coerce.number().min(0))
}).superRefine((venta, ctx) => {
  if (venta.cambioPendiente && venta.montoRecibido <= 0) {
    ctx.addIssue({ code: "custom", message: "Escribe con cuanto te pagaron.", path: ["montoRecibido"] });
  }
}).transform((venta) => ({ ...venta, montoRecibido: venta.cambioPendiente ? venta.montoRecibido : 0 }));
