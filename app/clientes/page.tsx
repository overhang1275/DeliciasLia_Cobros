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
  const clientesOrdenados = (
    await db.cliente.findMany({
      where,
      orderBy: [{ nombre: "asc" }],
      include: {
        _count: { select: { ventas: true } },
        ventas: {
          where: { estado: { in: ["FIADA", "PARCIAL"] } },
          include: { pagos: true }
        }
      }
    })
  )
    .map((cliente) => {
      const saldo = cliente.ventas.reduce((total, venta) => {
        const pagado = venta.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
        return total + Math.max(0, Number(venta.total) - pagado);
      }, 0);
      const deudaMasVieja = cliente.ventas.filter((venta) => Number(venta.total) - venta.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0) > 0).sort((a, b) => a.fecha.getTime() - b.fecha.getTime())[0]?.fecha;
      return { ...cliente, deudaMasVieja, saldo };
    })
    .sort((a, b) => {
      if (a.saldo > 0 && b.saldo <= 0) return -1;
      if (a.saldo <= 0 && b.saldo > 0) return 1;
      if (a.deudaMasVieja && b.deudaMasVieja) return a.deudaMasVieja.getTime() - b.deudaMasVieja.getTime();
      return a.nombre.localeCompare(b.nombre);
    });
  const totalPages = Math.max(1, Math.ceil(clientesOrdenados.length / pageSize));
  const clientes = clientesOrdenados.slice((Math.min(page, totalPages) - 1) * pageSize, Math.min(page, totalPages) * pageSize);

  return (
    <main className="app-page">
      <header className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-3xl" aria-hidden="true">👥</span>
        <div className="min-w-0 flex-1">
          <p className="ui-label">Personas</p>
          <h1 className="truncate text-3xl font-bold text-[var(--brand)]">Clientes</h1>
        </div>
        <Link className="grid size-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-xl text-[var(--primary)]" href="/" aria-label="Inicio">
          <span aria-hidden="true">🏠</span>
        </Link>
      </header>

      <form action={crearCliente} className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm">
        <div>
          <p className="ui-label">Nuevo cliente</p>
          <h2 className="text-xl font-bold text-[var(--brand)]">Datos de contacto</h2>
        </div>
        <div>
          <label className="ui-label" htmlFor="nombre">
            Nombre 👤
          </label>
          <input className="ui-input mt-2" id="nombre" name="nombre" required minLength={2} />
        </div>

        <div>
          <label className="ui-label" htmlFor="telefono">
            Telefono 📱
          </label>
          <input className="ui-input mt-2" id="telefono" name="telefono" inputMode="tel" />
        </div>

        <div>
          <label className="ui-label" htmlFor="notas">
            Notas 📝
          </label>
          <textarea className="ui-input mt-2 min-h-24 py-4" id="notas" name="notas" />
        </div>

        <button className="ui-button-primary gap-2" type="submit">
          <span aria-hidden="true">✓</span>
          Guardar
        </button>
      </form>

      <section className="grid gap-3" aria-label="Lista de clientes">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--brand)]">Clientes activos</h2>
          <span className="text-2xl" aria-hidden="true">📇</span>
        </div>
        <form className="flex gap-3 rounded-[1.75rem] bg-white p-3 shadow-sm" action="/clientes">
          <input className="ui-input" defaultValue={q} name="q" placeholder="Buscar cliente" />
          <button className="ui-button-secondary min-h-14 px-4" type="submit" aria-label="Filtrar">
            🔎
          </button>
        </form>
        {clientes.length === 0 ? (
          <p className="rounded-[1.75rem] bg-white p-4 text-[var(--text-muted)] shadow-sm">Todavia no hay clientes registrados.</p>
        ) : (
          clientes.map((cliente) => {
            return (
              <article className="relative rounded-[1.75rem] bg-white p-4 pb-14 shadow-sm" key={cliente.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-2xl" aria-hidden="true">👤</span>
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-[var(--text-main)]">{cliente.nombre}</h3>
                      <p className="ui-label">{cliente.telefono || "Sin telefono"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <p className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-bold text-[var(--primary)]">
                      {cliente._count.ventas} compras
                    </p>
                    <p className={`rounded-full px-3 py-1 text-sm font-bold ${cliente.saldo > 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                      {cliente.saldo > 0 ? "Debe" : "No debe"}
                    </p>
                  </div>
                </div>
                {cliente.notas ? <p className="mt-3 text-sm text-[var(--text-muted)]">{cliente.notas}</p> : null}
                <Link
                  aria-label={`Historial de ${cliente.nombre}`}
                  className="absolute bottom-4 right-28 grid size-10 place-items-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]"
                  href={`/clientes/${cliente.id}/historial`}
                >
                  <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 3v18h18" />
                    <path d="m7 14 4-4 3 3 5-6" />
                  </svg>
                </Link>
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
            );
          })
        )}
        <Pagination basePath="/clientes" page={page} q={q} totalPages={totalPages} />
      </section>
    </main>
  );
}
