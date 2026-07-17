import Link from "next/link";
import { crearCliente } from "./actions";
import { Pagination } from "@/components/Pagination";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
const pageSize = 6;

export default async function ClientesPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const page = Math.max(1, Number(params.page) || 1);
  const where = {
    activo: true,
    ...(q
      ? {
          OR: [{ nombre: { contains: q } }, { telefono: { contains: q } }]
        }
      : {})
  };
  const [clientes, total] = await Promise.all([
    db.cliente.findMany({
      where,
      orderBy: [{ nombre: "asc" }],
      include: { _count: { select: { ventas: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    db.cliente.count({ where })
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
        <form className="ui-card flex gap-3" action="/clientes">
          <input className="ui-input" defaultValue={q} name="q" placeholder="Buscar cliente" />
          <button className="ui-button-secondary px-4" type="submit">
            Filtrar
          </button>
        </form>
        {clientes.length === 0 ? (
          <p className="ui-card ui-label">Todavia no hay clientes registrados.</p>
        ) : (
          clientes.map((cliente) => (
            <article className="ui-card relative pb-14" key={cliente.id}>
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
              <Link
                aria-label={`Estado de cuenta de ${cliente.nombre}`}
                className="absolute bottom-4 right-16 grid size-10 place-items-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]"
                href={cliente.estadoToken ? `/estado/${cliente.estadoToken}` : `/clientes/${cliente.id}/estado`}
              >
                <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M8 6h13" />
                  <path d="M8 12h13" />
                  <path d="M8 18h13" />
                  <path d="M3 6h.01" />
                  <path d="M3 12h.01" />
                  <path d="M3 18h.01" />
                </svg>
              </Link>
              <Link
                aria-label={`Editar ${cliente.nombre}`}
                className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]"
                href={`/clientes/${cliente.id}/editar`}
              >
                <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 20h9" />
                  <path d="m16.5 3.5 4 4L7 21H3v-4L16.5 3.5z" />
                </svg>
              </Link>
            </article>
          ))
        )}
        <Pagination basePath="/clientes" page={page} q={q} totalPages={totalPages} />
      </section>
    </main>
  );
}
