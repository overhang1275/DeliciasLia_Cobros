"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registrarLog } from "@/lib/audit";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function guardarConfiguracion(formData: FormData) {
  const logo = formData.get("logo");
  const tema = String(formData.get("tema") || "system");
  const temaGuardado = ["system", "light", "dark"].includes(tema) ? tema : "system";
  let logoDataUrl: string | undefined;

  if (logo instanceof File && logo.size > 0) {
    const bytes = Buffer.from(await logo.arrayBuffer());
    logoDataUrl = `data:${logo.type};base64,${bytes.toString("base64")}`;
  }

  await db.configuracion.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      negocioNombre: String(formData.get("negocioNombre") || "Delicias Lia"),
      tema: temaGuardado,
      banco: String(formData.get("banco") || ""),
      titular: String(formData.get("titular") || ""),
      clabe: String(formData.get("clabe") || ""),
      cuenta: String(formData.get("cuenta") || ""),
      logoDataUrl
    },
    update: {
      negocioNombre: String(formData.get("negocioNombre") || "Delicias Lia"),
      tema: temaGuardado,
      banco: String(formData.get("banco") || ""),
      titular: String(formData.get("titular") || ""),
      clabe: String(formData.get("clabe") || ""),
      cuenta: String(formData.get("cuenta") || ""),
      ...(logoDataUrl ? { logoDataUrl } : {})
    }
  });
  await registrarLog({ accion: "editar", entidad: "Configuración", entidadId: 1, detalle: "Configuración del sistema" });

  revalidatePath("/");
  revalidatePath("/configuracion");
  revalidatePath("/clientes");
  redirect("/configuracion?guardado=configuracion");
}

export async function cambiarPasswordAdmin(formData: FormData) {
  const actual = String(formData.get("passwordActual") || "");
  const nueva = String(formData.get("passwordNueva") || "");
  const confirmar = String(formData.get("passwordConfirmar") || "");

  if (nueva.length < 8) redirect("/configuracion?password=min");
  if (nueva !== confirmar) redirect("/configuracion?password=match");

  const admin = await db.usuario.findUnique({ where: { usuario: "admin" } });

  if (!admin?.activo || !(await verifyPassword(actual, admin.passwordHash))) {
    redirect("/configuracion?password=actual");
  }

  await db.usuario.update({
    where: { usuario: "admin" },
    data: { passwordHash: await hashPassword(nueva) }
  });
  await registrarLog({ accion: "editar", entidad: "Seguridad", detalle: "Contraseña de admin actualizada" });

  revalidatePath("/configuracion");
  redirect("/configuracion?password=ok");
}
