import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });
const date = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" });

export default async function EstadoClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clienteId = Number(id);
  const cliente = Number.isInteger(clienteId)
    ? await db.cliente.findUnique({
        where: { id: clienteId },
        include: {
          ventas: {
            where: { estado: { in: ["FIADA", "PARCIAL"] } },
            include: { detalles: { include: { producto: true } }, pagos: true },
            orderBy: { fecha: "desc" }
          }
        }
      })
    : null;

  if (!cliente) notFound();

  const deudas = cliente.ventas
    .map((venta) => {
      const pagado = venta.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
      return { ...venta, pagado, pendiente: Number(venta.total) - pagado };
    })
    .filter((venta) => venta.pendiente > 0);
  const saldo = deudas.reduce((sum, venta) => sum + venta.pendiente, 0);

  return (
    <main className="app-page">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="ui-label">Estado de cuenta</p>
          <h1 className="text-4xl font-bold text-[var(--brand)]">{cliente.nombre}</h1>
        </div>
        <Link className="ui-button-secondary min-h-11 px-4" href="/clientes">
          Volver
        </Link>
      </header>

      <section className="ui-card">
        <p className="ui-label">Saldo por cobrar</p>
        <p className="mt-2 text-4xl font-bold text-[var(--brand)]">{money.format(saldo)}</p>
        {cliente.telefono ? <p className="ui-label mt-2">Telefono: {cliente.telefono}</p> : null}
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-bold text-[var(--brand)]">Deudas pendientes</h2>
        {deudas.length === 0 ? (
          <p className="ui-card ui-label">Este cliente no tiene saldo pendiente.</p>
        ) : (
          deudas.map((venta) => {
            const detalle = venta.detalles[0];
            return (
              <article className="ui-card" key={venta.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-[var(--text-main)]">{detalle ? `${detalle.producto.nombre} x ${detalle.cantidad}` : venta.observaciones || "Fiado"}</p>
                    <p className="ui-label">{date.format(venta.fecha)} · pagado {money.format(venta.pagado)}</p>
                  </div>
                  <p className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-bold text-[var(--primary)]">
                    {money.format(venta.pendiente)}
                  </p>
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
