import Link from "next/link";
import { notFound } from "next/navigation";
import { registrarPagoFiado } from "../../actions";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });

export default async function PagoFiadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ventaId = Number(id);
  const venta = Number.isInteger(ventaId)
    ? await db.venta.findUnique({
        where: { id: ventaId },
        include: { cliente: true, detalles: { include: { producto: true } }, pagos: true }
      })
    : null;

  if (!venta) notFound();

  const pagado = venta.pagos.reduce((total, pago) => total + Number(pago.monto), 0);
  const pendiente = Number(venta.total) - pagado;
  const detalle = venta.detalles[0];

  return (
    <main className="app-page">
      <header className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-3xl" aria-hidden="true">
          💵
        </span>
        <div className="min-w-0 flex-1">
          <p className="ui-label">Abono a fiado</p>
          <h1 className="truncate text-3xl font-bold text-[var(--brand)]">Registrar pago</h1>
        </div>
        <Link className="grid size-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-xl text-[var(--primary)]" href="/fiados" aria-label="Volver">
          <span aria-hidden="true">←</span>
        </Link>
      </header>

      <section className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-2xl" aria-hidden="true">
            📒
          </span>
          <div className="min-w-0">
            <p className="ui-label">{venta.cliente.nombre}</p>
            <h2 className="mt-1 text-3xl font-bold text-[var(--brand)]">{money.format(Math.max(0, pendiente))}</h2>
            <p className="ui-label mt-2">
              {detalle ? `${detalle.producto.nombre} x ${detalle.cantidad}` : venta.observaciones || "Fiado"}
            </p>
          </div>
        </div>
      </section>

      <form action={registrarPagoFiado} className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm">
        <div>
          <p className="ui-label">Pago recibido</p>
          <h2 className="text-xl font-bold text-[var(--brand)]">¿Cuánto abonó?</h2>
        </div>
        <input name="ventaId" type="hidden" value={venta.id} />

        <div>
          <label className="ui-label" htmlFor="monto">
            Cantidad 💰
          </label>
          <input
            className="ui-input mt-2"
            id="monto"
            inputMode="decimal"
            max={Math.max(0, pendiente)}
            min="0.01"
            name="monto"
            placeholder="Cantidad"
            required
            step="0.01"
            type="number"
          />
        </div>

        <div>
          <label className="ui-label" htmlFor="metodo">
            Tipo de pago 💳
          </label>
          <select className="ui-input mt-2" id="metodo" name="metodo" required>
            <option value="EFECTIVO">💵 Efectivo</option>
            <option value="TRANSFERENCIA">🏦 Transferencia</option>
          </select>
        </div>

        <button className="ui-button-primary gap-2" type="submit">
          <span aria-hidden="true">✓</span>
          Guardar pago
        </button>
      </form>
    </main>
  );
}
