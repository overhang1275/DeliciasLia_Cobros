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
    fecha: formData.get("fecha")
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

export async function liquidarDeudaCliente(formData: FormData) {
  const clienteId = Number(formData.get("clienteId"));
  const metodo = formData.get("metodo");

  if (!Number.isInteger(clienteId) || clienteId <= 0 || (metodo !== "EFECTIVO" && metodo !== "TRANSFERENCIA")) {
    redirect("/fiados");
  }

  const ventas = await db.venta.findMany({
    where: { clienteId, estado: { in: ["FIADA", "PARCIAL"] } },
    include: { pagos: true }
  });
  const operaciones = ventas.flatMap((venta) => {
    const pagado = venta.pagos.reduce((total, pago) => total + Number(pago.monto), 0);
    const pendiente = Number(venta.total) - pagado;
    if (pendiente <= 0) return [];
    return [
      db.pago.create({ data: { ventaId: venta.id, monto: pendiente, metodo } }),
      db.venta.update({ where: { id: venta.id }, data: { estado: "PAGADA" } })
    ];
  });

  if (operaciones.length > 0) await db.$transaction(operaciones);

  revalidatePath("/");
  revalidatePath("/fiados");
  revalidatePath("/clientes");
  redirect("/fiados");
}

export async function eliminarFiado(formData: FormData) {
  const ventaId = Number(formData.get("ventaId"));
  const confirmacion = formData.get("confirmacion");

  if (!Number.isInteger(ventaId) || ventaId <= 0 || confirmacion !== "CONFIRMAR") {
    redirect("/fiados");
  }

  const venta = await db.venta.findFirst({
    where: { id: ventaId, estado: { in: ["FIADA", "PARCIAL"] } },
    select: { id: true }
  });

  if (venta) {
    await db.$transaction([
      db.pago.deleteMany({ where: { ventaId: venta.id } }),
      db.detalleVenta.deleteMany({ where: { ventaId: venta.id } }),
      db.venta.delete({ where: { id: venta.id } })
    ]);
  }

  revalidatePath("/");
  revalidatePath("/fiados");
  revalidatePath("/clientes");
  revalidatePath("/reportes");
  redirect("/fiados");
}
