"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { fiadoSchema } from "@/lib/validators/fiados";

export async function registrarFiado(formData: FormData) {
  const fiado = fiadoSchema.parse({
    clienteId: formData.get("clienteId"),
    productoId: formData.get("productoId"),
    piezas: formData.get("piezas"),
  });

  const producto = await db.producto.findUniqueOrThrow({ where: { id: fiado.productoId } });
  const precioUnitario = Number(producto.precioVenta);
  const costoUnitario = Number(producto.costo);
  const total = precioUnitario * fiado.piezas;
  const costoTotal = costoUnitario * fiado.piezas;

  await db.venta.create({
    data: {
      clienteId: fiado.clienteId,
      estado: "FIADA",
      subtotal: total,
      total,
      costoTotal,
      utilidadTotal: total - costoTotal,
      observaciones: `Fiado inicial: ${producto.nombre}`,
      detalles: {
        create: {
          productoId: producto.id,
          cantidad: fiado.piezas,
          precioUnitario,
          costoUnitario,
          subtotal: total
        }
      }
    }
  });

  revalidatePath("/");
  revalidatePath("/fiados");
  redirect("/fiados");
}
