"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditMoney, auditTicketId, registrarLog } from "@/lib/audit";
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

  const [cliente, producto] = await Promise.all([
    db.cliente.findUnique({ where: { id: fiado.clienteId }, select: { nombre: true } }),
    db.producto.findUnique({ where: { id: fiado.productoId }, select: { nombre: true } })
  ]);
  const creada = await registrarVenta({ ...fiado, estado: "FIADA" });
  await registrarLog({
    accion: "crear",
    entidad: "Crédito",
    entidadId: creada.id,
    detalle: `Cliente: ${cliente?.nombre || fiado.clienteId} | Ticket ID ${auditTicketId(creada.id)} | Producto: ${producto?.nombre || fiado.productoId} x ${fiado.piezas} | Total crédito: ${auditMoney.format(Number(creada.total))}`
  });

  revalidatePath("/");
  revalidatePath("/fiados");
  redirect("/fiados?guardado=credito");
}

export async function registrarPagoFiado(formData: FormData) {
  const pago = pagoFiadoSchema.parse({
    ventaId: formData.get("ventaId"),
    monto: formData.get("monto"),
    metodo: formData.get("metodo")
  });

  const venta = await db.venta.findUniqueOrThrow({
    where: { id: pago.ventaId },
    include: { cliente: true, detalles: { include: { producto: true } }, pagos: true }
  });
  const pagado = venta.pagos.reduce((total, item) => total + Number(item.monto), 0);
  const pendiente = Number(venta.total) - pagado;
  const monto = Math.min(pago.monto, pendiente);

  const [pagoCreado] = await db.$transaction([
    db.pago.create({ data: { ventaId: venta.id, monto, metodo: pago.metodo } }),
    db.venta.update({
      where: { id: venta.id },
      data: { estado: pendiente - monto <= 0 ? "PAGADA" : "PARCIAL" }
    })
  ]);
  await registrarLog({
    accion: "crear",
    entidad: "Pago",
    entidadId: pagoCreado.id,
    detalle: `Cliente: ${venta.cliente.nombre} | Ref. pago ID ${auditTicketId(pagoCreado.id)} | Ticket ID ${auditTicketId(venta.id)} | Producto: ${venta.detalles[0]?.producto.nombre || "Venta"} | Pago: ${auditMoney.format(monto)} | Método: ${pago.metodo} | Pendiente antes: ${auditMoney.format(pendiente)} | Pendiente después: ${auditMoney.format(Math.max(0, pendiente - monto))}`
  });

  revalidatePath("/");
  revalidatePath("/fiados");
  redirect("/fiados?guardado=pago");
}

export async function liquidarDeudaCliente(formData: FormData) {
  const clienteId = Number(formData.get("clienteId"));
  const metodo = formData.get("metodo");

  if (!Number.isInteger(clienteId) || clienteId <= 0 || (metodo !== "EFECTIVO" && metodo !== "TRANSFERENCIA")) {
    redirect("/fiados");
  }

  const ventas = await db.venta.findMany({
    where: { clienteId, estado: { in: ["FIADA", "PARCIAL"] } },
    include: { cliente: true, pagos: true }
  });
  let totalLiquidado = 0;
  const operaciones = ventas.flatMap((venta) => {
    const pagado = venta.pagos.reduce((total, pago) => total + Number(pago.monto), 0);
    const pendiente = Number(venta.total) - pagado;
    if (pendiente <= 0) return [];
    totalLiquidado += pendiente;
    return [
      db.pago.create({ data: { ventaId: venta.id, monto: pendiente, metodo } }),
      db.venta.update({ where: { id: venta.id }, data: { estado: "PAGADA" } })
    ];
  });

  if (operaciones.length > 0) {
    await db.$transaction(operaciones);
    await registrarLog({
      accion: "liquidar",
      entidad: "Cliente",
      entidadId: clienteId,
      detalle: `Cliente: ${ventas[0]?.cliente.nombre || clienteId} | Créditos liquidados: ${operaciones.length / 2} | Total pagado: ${auditMoney.format(totalLiquidado)} | Método: ${metodo}`
    });
  }

  revalidatePath("/");
  revalidatePath("/fiados");
  revalidatePath("/clientes");
  redirect("/fiados?guardado=liquidado");
}

export async function eliminarFiado(formData: FormData) {
  const ventaId = Number(formData.get("ventaId"));
  const confirmacion = formData.get("confirmacion");

  if (!Number.isInteger(ventaId) || ventaId <= 0 || confirmacion !== "CONFIRMAR") {
    redirect("/fiados");
  }

  const venta = await db.venta.findFirst({
    where: { id: ventaId, estado: { in: ["FIADA", "PARCIAL"] } },
    include: { cliente: true, detalles: { include: { producto: true } } }
  });

  if (venta) {
    await db.$transaction([
      db.pago.deleteMany({ where: { ventaId: venta.id } }),
      db.detalleVenta.deleteMany({ where: { ventaId: venta.id } }),
      db.venta.delete({ where: { id: venta.id } })
    ]);
    await registrarLog({
      accion: "eliminar",
      entidad: "Crédito",
      entidadId: venta.id,
      detalle: `Cliente: ${venta.cliente.nombre} | Ticket ID ${auditTicketId(venta.id)} | Producto: ${venta.detalles[0]?.producto.nombre || "Venta"} | Total eliminado: ${auditMoney.format(Number(venta.total))}`
    });
  }

  revalidatePath("/");
  revalidatePath("/fiados");
  revalidatePath("/clientes");
  revalidatePath("/reportes");
  redirect("/fiados?guardado=eliminado");
}
