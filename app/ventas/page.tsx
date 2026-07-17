import Link from "next/link";
import { crearVenta } from "./actions";
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

        <div>
          <label className="ui-label" htmlFor="productoId">
            Producto
          </label>
          <select className="ui-input mt-2" id="productoId" name="productoId" required>
            <option value="">Selecciona producto</option>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre} - {money.format(Number(producto.precioVenta))}
              </option>
            ))}
          </select>
          {productos.length === 0 ? (
            <Link className="mt-2 inline-block text-sm font-bold text-[var(--primary)]" href="/productos">
              Agregar productos
            </Link>
          ) : null}
        </div>

        <div>
          <label className="ui-label" htmlFor="piezas">
            Piezas
          </label>
          <input className="ui-input mt-2" id="piezas" inputMode="numeric" min="1" name="piezas" placeholder="1" required type="number" />
        </div>

        <fieldset className="grid grid-cols-2 gap-3">
          <label className="ui-button-secondary">
            <input className="mr-2" defaultChecked name="estado" type="radio" value="PAGADA" />
            Pagada
          </label>
          <label className="ui-button-secondary">
            <input className="mr-2" name="estado" type="radio" value="FIADA" />
            Fiada
          </label>
        </fieldset>

        <fieldset className="grid grid-cols-2 gap-3">
          <legend className="ui-label col-span-2">Forma de pago</legend>
          <label className="ui-button-secondary">
            <input className="mr-2" defaultChecked name="metodoPago" type="radio" value="EFECTIVO" />
            Efectivo
          </label>
          <label className="ui-button-secondary">
            <input className="mr-2" name="metodoPago" type="radio" value="TRANSFERENCIA" />
            Transferencia
          </label>
        </fieldset>

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
            </article>
          ))
        )}
      </section>
    </main>
  );
}
