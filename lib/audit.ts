import { db } from "@/lib/db";
import { formatTicketId, moneyFormatter } from "@/lib/formatters";

export const auditMoney = moneyFormatter;
export const auditTicketId = formatTicketId;

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
