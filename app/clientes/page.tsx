import Link from "next/link";
import { crearCliente } from "./actions";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await db.cliente.findMany({
    where: { activo: true },
    orderBy: [{ nombre: "asc" }],
    include: { _count: { select: { ventas: true } } }
  });

  return (
    <main className="app-page">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="ui-label">Clientes</p>
          <h1 className="text-4xl font-bold text-[var(--brand)]">Alta de clientes</h1>
        </div>
        <Link className="ui-button-secondary min-h-11 px-4" href="/">
          Inicio
        </Link>
      </header>

      <form action={crearCliente} className="ui-card grid gap-4">
        <div>
          <label className="ui-label" htmlFor="nombre">
            Nombre
          </label>
          <input className="ui-input mt-2" id="nombre" name="nombre" required minLength={2} />
        </div>

        <div>
          <label className="ui-label" htmlFor="telefono">
            Telefono
          </label>
          <input className="ui-input mt-2" id="telefono" name="telefono" inputMode="tel" />
        </div>

        <div>
          <label className="ui-label" htmlFor="notas">
            Notas
          </label>
          <textarea className="ui-input mt-2 min-h-24 py-4" id="notas" name="notas" />
        </div>

        <button className="ui-button-primary" type="submit">
          Guardar cliente
        </button>
      </form>

      <section className="grid gap-3" aria-label="Lista de clientes">
        <h2 className="text-xl font-bold text-[var(--brand)]">Clientes activos</h2>
        {clientes.length === 0 ? (
          <p className="ui-card ui-label">Todavia no hay clientes registrados.</p>
        ) : (
          clientes.map((cliente) => (
            <article className="ui-card" key={cliente.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[var(--text-main)]">{cliente.nombre}</h3>
                  <p className="ui-label">{cliente.telefono || "Sin telefono"}</p>
                </div>
                <p className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-bold text-[var(--primary)]">
                  {cliente._count.ventas} compras
                </p>
              </div>
              {cliente.notas ? <p className="mt-3 text-sm text-[var(--text-muted)]">{cliente.notas}</p> : null}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
