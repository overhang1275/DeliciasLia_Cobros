import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });
const date = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" });
const ticketId = (id: number) => String(id).padStart(6, "0");

export default async function HistorialClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clienteId = Number(id);
  const cliente = Number.isInteger(clienteId)
    ? await db.cliente.findUnique({
        where: { id: clienteId },
        include: {
          ventas: {
            where: { estado: { not: "CANCELADA" } },
            include: { detalles: { include: { producto: true } }, pagos: true },
            orderBy: { fecha: "desc" }
          },
          pedidos: {
            include: { producto: true },
            orderBy: { fechaEntrega: "desc" }
          }
        }
      })
    : null;

  if (!cliente) notFound();

  const pagos = await db.pago.findMany({
    where: { venta: { clienteId: cliente.id } },
    include: { venta: { include: { detalles: { include: { producto: true } } } } },
    orderBy: { fecha: "desc" }
  });
  const totalComprado = cliente.ventas.reduce((sum, venta) => sum + Number(venta.total), 0);
  const totalPagado = pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
  const creditoPendiente = cliente.ventas.reduce((sum, venta) => {
    const pagado = venta.pagos.reduce((subtotal, pago) => subtotal + Number(pago.monto), 0);
    return sum + Math.max(0, Number(venta.total) - pagado);
  }, 0);
  const cambiosPendientes = cliente.ventas.reduce((sum, venta) => sum + (venta.cambioPendiente ? Number(venta.cambioMonto) : 0), 0);
  const pedidosPendientes = cliente.pedidos.filter((pedido) => pedido.estado === "PENDIENTE").length;
  const movimientos = [
    ...cliente.ventas.map((venta) => ({
      id: `venta-${venta.id}`,
      ventaId: venta.id,
      fecha: venta.fecha,
      icono: venta.estado === "PAGADA" ? "🧾" : "📒",
      titulo: `${venta.estado === "PAGADA" ? "Venta" : "Crédito"} ticket ID ${ticketId(venta.id)}`,
      detalle: venta.detalles[0] ? `${venta.detalles[0].producto.nombre} x ${venta.detalles[0].cantidad}` : venta.observaciones || "Venta",
      monto: Number(venta.total),
      pendiente: Math.max(0, Number(venta.total) - venta.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0)),
      mostrarNegativo: false,
      tono: venta.estado === "PAGADA" ? "text-[var(--primary)]" : "text-red-700"
    })),
    ...pagos.map((pago) => ({
      id: `pago-${pago.id}`,
      ventaId: pago.ventaId,
      fecha: pago.fecha,
      icono: "✅",
      titulo: `Pago ID ${ticketId(pago.id)} - ticket ID ${ticketId(pago.ventaId)}`,
      detalle: `${pago.metodo.toLowerCase()} · ${pago.venta.detalles[0]?.producto.nombre || pago.venta.observaciones || "Pago"}`,
      monto: -Number(pago.monto),
      pendiente: 0,
      mostrarNegativo: false,
      tono: "text-green-700"
    })),
    ...cliente.pedidos.map((pedido) => ({
      id: `pedido-${pedido.id}`,
      fecha: pedido.fechaEntrega,
      ventaId: 0,
      icono: "🗓️",
      titulo: `Pedido ${pedido.estado.toLowerCase()}`,
      detalle: `${pedido.producto.nombre} x ${pedido.piezas}`,
      monto: 0,
      pendiente: 0,
      mostrarNegativo: false,
      tono: pedido.estado === "PENDIENTE" ? "text-[var(--primary)]" : "text-[var(--text-muted)]"
    })),
    ...cliente.ventas
      .filter((venta) => venta.cambioPendiente && Number(venta.cambioMonto) > 0)
      .map((venta) => ({
        id: `cambio-${venta.id}`,
        ventaId: venta.id,
        fecha: venta.fecha,
        icono: "💸",
        titulo: `Cambio pendiente ticket ID ${ticketId(venta.id)}`,
        detalle: "Cambio por entregar al cliente",
        monto: Number(venta.cambioMonto),
        pendiente: 0,
        mostrarNegativo: true,
        tono: "text-red-700"
      }))
  ].sort((a, b) => b.fecha.getTime() - a.fecha.getTime() || a.id.localeCompare(b.id));

  return (
    <main className="app-page">
      <header className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-3xl" aria-hidden="true">
          📈
        </span>
        <div className="min-w-0 flex-1">
          <p className="ui-label">Historial de cliente</p>
          <h1 className="truncate text-3xl font-bold text-[var(--brand)]">{cliente.nombre}</h1>
        </div>
        <Link className="grid size-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-xl text-[var(--primary)]" href="/clientes" aria-label="Volver" title="Volver">
          <span aria-hidden="true">⬅️</span>
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-3" aria-label="Resumen">
        {[
          ["🧾", "Comprado", money.format(totalComprado), ""],
          ["✅", "Pagado", money.format(totalPagado), ""],
          ["📒", "Crédito", money.format(creditoPendiente), ""],
          ["💸", "Cambios", cambiosPendientes > 0 ? `-${money.format(cambiosPendientes)}` : money.format(0), "text-red-700"],
          ["🗓️", "Pedidos", String(pedidosPendientes), ""]
        ].map(([icono, label, value, tone]) => (
          <article className="rounded-[1.75rem] bg-white p-4 shadow-sm" key={label}>
            <span className="text-2xl" aria-hidden="true">{icono}</span>
            <p className="ui-label">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${tone || "text-[var(--brand)]"}`}>{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-3" aria-label="Movimientos">
        <h2 className="text-xl font-bold text-[var(--brand)]">📋 Movimientos</h2>
        {movimientos.length === 0 ? (
          <p className="rounded-[1.75rem] bg-white p-4 text-[var(--text-muted)] shadow-sm">Todavia no hay movimientos registrados.</p>
        ) : (
          movimientos.map((movimiento) => (
            <article className="rounded-[1.75rem] bg-white p-4 shadow-sm" key={movimiento.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-2xl" aria-hidden="true">
                    {movimiento.icono}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-[var(--text-main)]">{movimiento.titulo}</p>
                    <p className="text-sm text-[var(--text-main)]">{movimiento.detalle}</p>
                    <p className="ui-label">{date.format(movimiento.fecha)}</p>
                  </div>
                </div>
                {movimiento.monto !== 0 ? (
                  <p className={`shrink-0 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-bold ${movimiento.tono}`}>
                    {movimiento.mostrarNegativo ? `-${money.format(Math.abs(movimiento.monto))}` : money.format(Math.abs(movimiento.monto))}
                  </p>
                ) : null}
              </div>
              {movimiento.pendiente > 0 ? (
                <div className="mt-3 flex justify-end">
                  <Link className="ui-button-secondary min-h-10 px-4 text-sm" href={`/fiados/${movimiento.ventaId}/pago`}>
                    💵 Registrar pago
                  </Link>
                </div>
              ) : null}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
