"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

  revalidatePath("/");
  revalidatePath("/configuracion");
  revalidatePath("/clientes");
  redirect("/configuracion");
}
