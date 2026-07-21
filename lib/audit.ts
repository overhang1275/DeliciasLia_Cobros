import { db } from "@/lib/db";

export const auditMoney = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });
export const auditTicketId = (id: number) => String(id).padStart(6, "0");

export async function registrarLog({ accion, detalle, entidad, entidadId }: { accion: string; detalle?: string; entidad: string; entidadId?: number }) {
  await db.auditLog.create({
    data: {
      accion,
      detalle,
      entidad,
      entidadId,
      usuario: "admin"
    }
  });
}
