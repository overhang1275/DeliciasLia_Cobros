import Link from "next/link";
import { crearProducto } from "./actions";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });

export default async function ProductosPage() {
  const productos = await db.producto.findMany({
    where: { activo: true },
    orderBy: [{ nombre: "asc" }]
  });

  return (
    <main className="app-page">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="ui-label">Productos</p>
          <h1 className="text-4xl font-bold text-[var(--brand)]">Catalogo de venta</h1>
        </div>
        <Link className="ui-button-secondary min-h-11 px-4" href="/">
          Inicio
        </Link>
      </header>

      <form action={crearProducto} className="ui-card grid gap-4">
        <div>
          <label className="ui-label" htmlFor="nombre">
            Producto
          </label>
          <input className="ui-input mt-2" id="nombre" name="nombre" placeholder="Arroz 7oz" required minLength={2} />
        </div>

        <div>
          <label className="ui-label" htmlFor="precioVenta">
            Precio MXN
          </label>
          <input
            className="ui-input mt-2"
            id="precioVenta"
            name="precioVenta"
            inputMode="decimal"
            min="0.01"
            placeholder="20"
            required
            step="0.01"
            type="number"
          />
        </div>

        <button className="ui-button-primary" type="submit">
          Guardar producto
        </button>
      </form>

      <section className="grid gap-3" aria-label="Lista de productos">
        <h2 className="text-xl font-bold text-[var(--brand)]">Productos activos</h2>
        {productos.length === 0 ? (
          <p className="ui-card ui-label">Todavia no hay productos registrados.</p>
        ) : (
          productos.map((producto) => (
            <article className="ui-card flex items-center justify-between gap-4" key={producto.id}>
              <h3 className="font-bold text-[var(--text-main)]">{producto.nombre}</h3>
              <p className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-bold text-[var(--primary)]">
                {money.format(Number(producto.precioVenta))}
              </p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
