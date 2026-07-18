import Link from "next/link";
import { crearVenta } from "./actions";
import { CambioPendienteFields } from "./CambioPendienteFields";
import { DarCambioButton } from "./DarCambioButton";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });

export default async function VentasPage() {
  const [clientes, productos, ventas] = await Promise.all([
    db.cliente.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    db.producto.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    db.venta.findMany({
      include: { cliente: true, detalles: { include: { producto: true } } },
      orderBy: { fecha: "desc" },
      take: 8
    })
  ]);
  const productosOptions = productos.map((producto) => ({
    id: producto.id,
    label: `${producto.nombre} - ${money.format(Number(producto.precioVenta))}`,
    precioVenta: Number(producto.precioVenta)
  }));

  return (
    <main className="app-page">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="ui-label">Ventas</p>
          <h1 className="text-4xl font-bold text-[var(--brand)]">Nueva venta</h1>
        </div>
        <Link className="ui-button-secondary min-h-11 px-4" href="/">
          Inicio
        </Link>
      </header>

      <form action={crearVenta} className="ui-card grid gap-4">
        <div>
          <label className="ui-label" htmlFor="clienteId">
            Cliente
          </label>
          <select className="ui-input mt-2" id="clienteId" name="clienteId" required>
            <option value="">Selecciona cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </option>
            ))}
          </select>
        </div>

        <CambioPendienteFields productos={productosOptions} />

        <button className="ui-button-primary" type="submit">
          Guardar venta
        </button>
      </form>

      <section className="grid gap-3" aria-label="Ultimas ventas">
        <h2 className="text-xl font-bold text-[var(--brand)]">Ultimas ventas</h2>
        {ventas.length === 0 ? (
          <p className="ui-card ui-label">Todavia no hay ventas registradas.</p>
        ) : (
          ventas.map((venta) => (
            <article className="ui-card" key={venta.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[var(--text-main)]">{venta.cliente.nombre}</h3>
                  <p className="ui-label">
                    {venta.detalles[0]
                      ? `${venta.detalles[0].producto.nombre} x ${venta.detalles[0].cantidad}`
                      : venta.observaciones || "Venta"}
                  </p>
                </div>
                <p className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-bold text-[var(--primary)]">
                  {money.format(Number(venta.total))}
                </p>
              </div>
              {venta.cambioPendiente && Number(venta.cambioMonto) > 0 ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                  <span>Cambio pendiente: {money.format(Number(venta.cambioMonto))}</span>
                  <DarCambioButton ventaId={venta.id} total={money.format(Number(venta.cambioMonto))} />
                </div>
              ) : null}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
