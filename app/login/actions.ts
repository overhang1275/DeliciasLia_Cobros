"use server";

import { redirect } from "next/navigation";
import { clearSession, setSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function login(formData: FormData) {
  const usuario = String(formData.get("usuario") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/");
  const admin = await db.usuario.findUnique({ where: { usuario } });

  if (!admin?.activo || !(await verifyPassword(password, admin.passwordHash))) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  await setSession(admin.usuario);
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
