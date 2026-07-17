import { z } from "zod";

export const productoSchema = z.object({
  nombre: z.string().trim().min(2, "Escribe el nombre del producto."),
  precioVenta: z.coerce.number().positive("El precio debe ser mayor a 0.")
});
