"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditMoney, registrarLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { productoSchema } from "@/lib/validators/productos";

export async function crearProducto(formData: FormData) {
  const producto = productoSchema.parse({
    nombre: formData.get("nombre"),
    precioVenta: formData.get("precioVenta")
  });

  const creado = await db.producto.create({
    data: {
      nombre: producto.nombre,
      precioVenta: producto.precioVenta,
      costo: 0
    }
  });
  await registrarLog({ accion: "crear", entidad: "Producto", entidadId: creado.id, detalle: `Producto: ${creado.nombre} | Precio: ${auditMoney.format(Number(creado.precioVenta))}` });

  revalidatePath("/");
  revalidatePath("/productos");
  redirect("/productos?guardado=producto");
}
