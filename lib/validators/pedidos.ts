import { z } from "zod";
import { parseDateInput } from "@/lib/timezone";

export const pedidoSchema = z.object({
  clienteId: z.coerce.number().int().positive("Selecciona un cliente."),
  productoId: z.coerce.number().int().positive("Selecciona un producto."),
  piezas: z.coerce.number().int().positive("Las piezas deben ser mayor a 0."),
  fechaEntrega: z.preprocess((value) => parseDateInput(value), z.date()),
  notas: z.string().trim().optional()
});
