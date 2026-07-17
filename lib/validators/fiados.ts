import { z } from "zod";

export const fiadoSchema = z.object({
  clienteId: z.coerce.number().int().positive("Selecciona un cliente."),
  productoId: z.coerce.number().int().positive("Selecciona un postre."),
  piezas: z.coerce.number().int().positive("Las piezas deben ser mayor a 0."),
});
