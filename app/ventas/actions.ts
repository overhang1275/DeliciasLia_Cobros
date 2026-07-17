"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registrarVenta } from "@/lib/ventas";
import { ventaSchema } from "@/lib/validators/ventas";

export async function crearVenta(formData: FormData) {
  const venta = ventaSchema.parse({
    clienteId: formData.get("clienteId"),
    productoId: formData.get("productoId"),
    piezas: formData.get("piezas"),
    estado: formData.get("estado"),
    metodoPago: formData.get("metodoPago")
  });

  await registrarVenta(venta);
  revalidatePath("/");
  revalidatePath("/ventas");
  revalidatePath("/fiados");
  redirect("/ventas");
}
