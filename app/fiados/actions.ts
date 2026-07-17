"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { registrarVenta } from "@/lib/ventas";
import { fiadoSchema, pagoFiadoSchema } from "@/lib/validators/fiados";

export async function registrarFiado(formData: FormData) {
  const fiado = fiadoSchema.parse({
    clienteId: formData.get("clienteId"),
    productoId: formData.get("productoId"),
    piezas: formData.get("piezas"),
  });

  await registrarVenta({ ...fiado, estado: "FIADA" });

  revalidatePath("/");
  revalidatePath("/fiados");
  redirect("/fiados");
}

export async function registrarPagoFiado(formData: FormData) {
  const pago = pagoFiadoSchema.parse({
    ventaId: formData.get("ventaId"),
    monto: formData.get("monto"),
    metodo: formData.get("metodo")
  });

  const venta = await db.venta.findUniqueOrThrow({
    where: { id: pago.ventaId },
    include: { pagos: true }
  });
  const pagado = venta.pagos.reduce((total, item) => total + Number(item.monto), 0);
  const pendiente = Number(venta.total) - pagado;
  const monto = Math.min(pago.monto, pendiente);

  await db.$transaction([
    db.pago.create({ data: { ventaId: venta.id, monto, metodo: pago.metodo } }),
    db.venta.update({
      where: { id: venta.id },
      data: { estado: pendiente - monto <= 0 ? "PAGADA" : "PARCIAL" }
    })
  ]);

  revalidatePath("/");
  revalidatePath("/fiados");
  redirect("/fiados");
}
