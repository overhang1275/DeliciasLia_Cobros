import { z } from "zod";

export const ventaSchema = z.object({
  clienteId: z.coerce.number().int().positive("Selecciona un cliente."),
  productoId: z.coerce.number().int().positive("Selecciona un producto."),
  piezas: z.coerce.number().int().positive("Las piezas deben ser mayor a 0."),
  estado: z.enum(["PAGADA", "FIADA"]),
  metodoPago: z.enum(["EFECTIVO", "TRANSFERENCIA"]).default("EFECTIVO")
});
