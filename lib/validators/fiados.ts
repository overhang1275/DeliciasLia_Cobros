import { z } from "zod";
import { parseDateInput } from "@/lib/timezone";

export const fiadoSchema = z.object({
  clienteId: z.coerce.number().int().positive("Selecciona un cliente."),
  productoId: z.coerce.number().int().positive("Selecciona un producto."),
  piezas: z.coerce.number().int().positive("Las piezas deben ser mayor a 0."),
  fecha: z.preprocess((value) => parseDateInput(value), z.date())
});

export const pagoFiadoSchema = z.object({
  ventaId: z.coerce.number().int().positive("Selecciona una venta."),
  monto: z.coerce.number().positive("El pago debe ser mayor a 0."),
  metodo: z.enum(["EFECTIVO", "TRANSFERENCIA"]),
  cambioPendiente: z.preprocess((value) => value === "on", z.boolean()),
  montoRecibido: z.preprocess((value) => (value === "" || value == null ? 0 : value), z.coerce.number().min(0))
}).superRefine((pago, ctx) => {
  if (pago.cambioPendiente && pago.montoRecibido <= 0) {
    ctx.addIssue({ code: "custom", message: "Escribe con cuanto te pagaron.", path: ["montoRecibido"] });
  }
}).transform((pago) => ({ ...pago, montoRecibido: pago.cambioPendiente ? pago.montoRecibido : 0 }));
