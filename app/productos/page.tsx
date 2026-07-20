import Link from "next/link";
import { crearProducto } from "./actions";
import { Pagination } from "@/components/Pagination";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
const pageSize = 6;

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });

export default async function ProductosPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const page = Math.max(1, Number(params.page) || 1);
  const where = {
    activo: true,
    ...(q
      ? {
          OR: [{ nombre: { contains: q } }, { categoria: { contains: q } }]
        }
      : {})
  };
  const [productos, total] = await Promise.all([
    db.producto.findMany({
      where,
      orderBy: [{ nombre: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    db.producto.count({ where })
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="app-page">
      <header className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-3xl" aria-hidden="true">📦</span>
        <div className="min-w-0 flex-1">
          <p className="ui-label">Catalogo</p>
          <h1 className="truncate text-3xl font-bold text-[var(--brand)]">Productos</h1>
        </div>
        <Link className="grid size-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-xl text-[var(--primary)]" href="/" aria-label="Inicio" title="Inicio">
          <span aria-hidden="true">🏠</span>
        </Link>
      </header>

      <form action={crearProducto} className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm">
        <div>
          <p className="ui-label">Nuevo producto</p>
          <h2 className="text-xl font-bold text-[var(--brand)]">Producto para vender</h2>
        </div>
        <div>
          <label className="ui-label" htmlFor="nombre">
            Producto 📦
          </label>
          <input className="ui-input mt-2" id="nombre" name="nombre" placeholder="Producto o servicio" required minLength={2} />
        </div>

        <div>
          <label className="ui-label" htmlFor="precioVenta">
            Precio MXN 💰
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

        <button className="ui-button-primary gap-2" type="submit">
          <span aria-hidden="true">✓</span>
          Guardar
        </button>
      </form>

      <section className="grid gap-3" aria-label="Lista de productos">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--brand)]">Productos activos</h2>
          <span className="text-2xl" aria-hidden="true">🏷️</span>
        </div>
        <form className="flex gap-3 rounded-[1.75rem] bg-white p-3 shadow-sm" action="/productos">
          <input className="ui-input" defaultValue={q} name="q" placeholder="Buscar producto" />
          <button className="ui-button-secondary min-h-14 px-4" type="submit" aria-label="Filtrar" title="Filtrar">
            🔎
          </button>
        </form>
        {productos.length === 0 ? (
          <p className="rounded-[1.75rem] bg-white p-4 text-[var(--text-muted)] shadow-sm">Todavia no hay productos registrados.</p>
        ) : (
          productos.map((producto) => (
            <article className="flex items-center justify-between gap-4 rounded-[1.75rem] bg-white p-4 shadow-sm" key={producto.id}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-2xl" aria-hidden="true">📦</span>
                <h3 className="truncate font-bold text-[var(--text-main)]">{producto.nombre}</h3>
              </div>
              <p className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-bold text-[var(--primary)]">
                {money.format(Number(producto.precioVenta))}
              </p>
            </article>
          ))
        )}
        <Pagination basePath="/productos" page={page} q={q} totalPages={totalPages} />
      </section>
    </main>
  );
}
