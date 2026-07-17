import { z } from "zod";

export const clienteSchema = z.object({
  nombre: z.string().trim().min(2, "Escribe el nombre del cliente."),
  telefono: z.string().trim().optional(),
  notas: z.string().trim().optional()
});
