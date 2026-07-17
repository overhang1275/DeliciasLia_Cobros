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
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="ui-label">Fiados</p>
          <h1 className="text-4xl font-bold text-[var(--brand)]">Registrar pago</h1>
        </div>
        <Link className="ui-button-secondary min-h-11 px-4" href="/fiados">
          Volver
        </Link>
      </header>

      <section className="ui-card">
        <p className="ui-label">{venta.cliente.nombre}</p>
        <h2 className="mt-1 text-2xl font-bold text-[var(--brand)]">{money.format(Math.max(0, pendiente))}</h2>
        <p className="ui-label mt-2">
          {detalle ? `${detalle.producto.nombre} x ${detalle.cantidad}` : venta.observaciones || "Fiado"}
        </p>
      </section>

      <form action={registrarPagoFiado} className="ui-card grid gap-4">
        <input name="ventaId" type="hidden" value={venta.id} />

        <div>
          <label className="ui-label" htmlFor="monto">
            Cantidad
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
            Tipo de pago
          </label>
          <select className="ui-input mt-2" id="metodo" name="metodo" required>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>
        </div>

        <button className="ui-button-primary" type="submit">
          Guardar pago
        </button>
      </form>
    </main>
  );
}
