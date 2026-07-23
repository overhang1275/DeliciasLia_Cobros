import { db } from "@/lib/db";
import { appDateFormatter, dateInputValue } from "@/lib/timezone";

export const dynamic = "force-dynamic";

const fecha = appDateFormatter({ dateStyle: "medium", timeStyle: "short" });
const acciones: Record<string, string> = {
  actualizar: "Actualizó",
  cancelar: "Canceló",
  crear: "Creó",
  editar: "Editó",
  eliminar: "Eliminó",
  liquidar: "Liquidó"
};

export async function GET() {
  const logs = await db.auditLog.findMany({ orderBy: { creadoEn: "desc" } });
  const body = logs.length
    ? logs
        .map((log) => `[${fecha.format(log.creadoEn)}] ${log.usuario || "Sistema"} - ${acciones[log.accion] || log.accion} ${log.entidad}${log.entidadId ? ` ID ${log.entidadId}` : ""}${log.detalle ? ` - ${log.detalle}` : ""}`)
        .join("\n")
    : "Sin registros de auditoría.";

  return new Response(body, {
    headers: {
      "Content-Disposition": `attachment; filename="audit-log-${dateInputValue()}.txt"`,
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
