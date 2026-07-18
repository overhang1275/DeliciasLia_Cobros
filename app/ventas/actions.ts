"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { registrarVenta } from "@/lib/ventas";
import { ventaSchema } from "@/lib/validators/ventas";

export async function crearVenta(formData: FormData) {
  const venta = ventaSchema.parse({
    clienteId: formData.get("clienteId"),
    productoId: formData.get("productoId"),
    piezas: formData.get("piezas"),
    estado: formData.get("estado"),
    metodoPago: formData.get("metodoPago"),
    cambioPendiente: formData.get("cambioPendiente"),
    montoRecibido: formData.get("montoRecibido")
  });
  if (venta.estado === "FIADA") redirect("/fiados");

  await registrarVenta(venta);
  revalidatePath("/");
  revalidatePath("/ventas");
  revalidatePath("/fiados");
  redirect("/ventas");
}

export async function darCambio(formData: FormData) {
  const ventaId = Number(formData.get("ventaId"));
  if (!Number.isInteger(ventaId) || ventaId <= 0) redirect("/ventas");

  await db.venta.update({
    where: { id: ventaId },
    data: { cambioPendiente: false, cambioMonto: 0 }
  });

  revalidatePath("/ventas");
  redirect("/ventas");
}
