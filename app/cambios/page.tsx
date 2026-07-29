import Link from "next/link";
import { entregarCambio } from "./actions";
import { CalendarDays, Home, ReceiptText, Wallet } from "@/components/AppIcon";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { db } from "@/lib/db";
import { appDateFormatter } from "@/lib/timezone";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });
const date = appDateFormatter({ dateStyle: "medium" });
const ticketId = (id: number) => String(id).padStart(6, "0");

export default async function CambiosPage() {
  const cambios = await db.venta.findMany({
    where: { cambioPendiente: true, cambioMonto: { gt: 0 } },
    include: { cliente: true, detalles: { include: { producto: true } } },
    orderBy: { fecha: "asc" }
  });
  const total = cambios.reduce((sum, venta) => sum + Number(venta.cambioMonto), 0);

  return (
    <main className="app-page">
      <header className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-700" aria-hidden="true">
          <Wallet className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="ui-label">Pendientes por entregar</p>
          <h1 className="truncate text-3xl font-bold text-[var(--brand)]">Cambios</h1>
        </div>
        <Link className="ui-icon-button" href="/" aria-label="Inicio" title="Inicio">
          <Home aria-hidden="true" className="size-5" />
        </Link>
      </header>

      <section className="rounded-[2rem] bg-white p-5 shadow-sm">
        <p className="ui-label">Total que debo entregar</p>
        <p className="mt-1 text-4xl font-bold text-amber-700">{money.format(total)}</p>
      </section>

      <section className="grid gap-3" aria-label="Cambios pendientes">
        {cambios.length === 0 ? (
          <p className="rounded-[1.75rem] bg-white p-4 text-[var(--text-muted)] shadow-sm">No hay cambios pendientes por entregar.</p>
        ) : (
          cambios.map((venta) => {
            const detalle = venta.detalles[0];
            const producto = detalle ? `${detalle.producto.nombre} x ${detalle.cantidad}` : venta.observaciones || "Venta";

            return (
              <article className="rounded-[1.75rem] bg-white p-4 shadow-sm" key={venta.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-700" aria-hidden="true">
                      <Wallet className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate font-bold text-[var(--text-main)]">{venta.cliente.nombre}</h2>
                      <p className="ui-label">{producto}</p>
                      <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[var(--text-muted)]">
                        <ReceiptText aria-hidden="true" className="size-3" />
                        Ticket ID {ticketId(venta.id)}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <CalendarDays aria-hidden="true" className="size-3" />
                        {date.format(venta.fecha)}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">{money.format(Number(venta.cambioMonto))}</p>
                </div>
                <form action={entregarCambio} className="mt-4 flex justify-end">
                  <input name="ventaId" type="hidden" value={venta.id} />
                  <ConfirmSubmitButton
                    className="ui-button-primary min-h-10 px-4 text-sm"
                    title="Marcar cambio entregado"
                    description={`Confirma que ya entregaste ${money.format(Number(venta.cambioMonto))} a ${venta.cliente.nombre}.`}
                    confirmLabel="Entregado"
                  >
                    Marcar entregado
                  </ConfirmSubmitButton>
                </form>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
