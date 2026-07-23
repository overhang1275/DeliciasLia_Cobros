import Link from "next/link";
import { EstadoPedido } from "@prisma/client";
import { cancelarPedido, crearPedido } from "./actions";
import { Banknote, CalendarDays, ClipboardList, Hash, Home, Package, ReceiptText, Save, Search, X } from "@/components/AppIcon";
import { ClienteSearchField } from "@/components/ClienteSearchField";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { Pagination } from "@/components/Pagination";
import { db } from "@/lib/db";
import { appDateFormatter, dateInputValue } from "@/lib/timezone";

export const dynamic = "force-dynamic";
const pageSize = 6;

const date = appDateFormatter({ day: "2-digit", month: "short", year: "numeric" });
const today = dateInputValue();

function orderLink(path: string, pedido: { clienteId: number; productoId: number; piezas: number }) {
  const params = new URLSearchParams({
    clienteId: String(pedido.clienteId),
    productoId: String(pedido.productoId),
    piezas: String(pedido.piezas)
  });
  return `${path}?${params.toString()}`;
}

export default async function PedidosPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const page = Math.max(1, Number(params.page) || 1);
  const where = {
    estado: EstadoPedido.PENDIENTE,
    ...(q
      ? {
          OR: [{ cliente: { nombre: { contains: q } } }, { producto: { nombre: { contains: q } } }, { notas: { contains: q } }]
        }
      : {})
  };
  const [clientes, productos, pedidos, total] = await Promise.all([
    db.cliente.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    db.producto.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    db.pedido.findMany({
      where,
      include: { cliente: true, producto: true },
      orderBy: [{ fechaEntrega: "asc" }, { fechaPedido: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    db.pedido.count({ where })
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="app-page">
      <header className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
          <CalendarDays className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="ui-label">Encargos</p>
          <h1 className="truncate text-3xl font-bold text-[var(--brand)]">Pedidos</h1>
        </div>
        <Link className="ui-icon-button" href="/" aria-label="Inicio" title="Inicio">
          <Home aria-hidden="true" className="size-5" />
        </Link>
      </header>

      <form action={crearPedido} className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm">
        <div>
          <p className="ui-label">Nuevo pedido</p>
          <h2 className="text-xl font-bold text-[var(--brand)]">¿Qué te encargaron?</h2>
        </div>

        <ClienteSearchField clientes={clientes} />

        <div>
          <label className="ui-label inline-flex items-center gap-1" htmlFor="productoId">
            Producto <Package aria-hidden="true" className="size-4" />
          </label>
          <select className="ui-input mt-2" id="productoId" name="productoId" required>
            <option value="">Selecciona producto</option>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre}
              </option>
            ))}
          </select>
          {productos.length === 0 ? (
            <Link className="mt-2 inline-block text-sm font-bold text-[var(--primary)]" href="/productos">
              Agregar productos
            </Link>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="ui-label inline-flex items-center gap-1" htmlFor="piezas">
              Piezas <Hash aria-hidden="true" className="size-4" />
            </label>
            <input className="ui-input mt-2" id="piezas" inputMode="numeric" min="1" name="piezas" placeholder="1" required type="number" />
          </div>
          <div>
            <label className="ui-label inline-flex items-center gap-1" htmlFor="fechaEntrega">
              Para cuando <CalendarDays aria-hidden="true" className="size-4" />
            </label>
            <input className="ui-input mt-2" defaultValue={today} id="fechaEntrega" name="fechaEntrega" required type="date" />
          </div>
        </div>

        <div>
          <label className="ui-label" htmlFor="notas">
            Notas
          </label>
          <textarea className="ui-input mt-2 min-h-24 py-4" id="notas" name="notas" placeholder="Detalles del pedido" />
        </div>

        <button className="ui-button-primary gap-2" type="submit">
          <Save aria-hidden="true" className="size-5" />
          Guardar pedido
        </button>
      </form>

      <section className="grid gap-4" aria-label="Pedidos pendientes">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--brand)]">Pendientes</h2>
          <ClipboardList aria-hidden="true" className="size-6 text-[var(--primary)]" />
        </div>
        <form className="flex gap-3 rounded-[1.75rem] bg-white p-3 shadow-sm" action="/pedidos">
          <input className="ui-input" defaultValue={q} name="q" placeholder="Buscar pedido" />
          <button className="ui-button-secondary min-h-14 px-4" type="submit" aria-label="Filtrar" title="Filtrar">
            <Search aria-hidden="true" className="size-5" />
          </button>
        </form>
        {pedidos.length === 0 ? (
          <p className="rounded-[1.75rem] bg-white p-4 text-[var(--text-muted)] shadow-sm">No hay pedidos pendientes.</p>
        ) : (
          pedidos.map((pedido) => (
            <article className="rounded-[1.75rem] bg-white p-5 shadow-sm" key={pedido.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
                    <Package className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-[var(--text-main)]">{pedido.cliente.nombre}</h3>
                    <p className="ui-label">
                      {pedido.producto.nombre} x {pedido.piezas}
                    </p>
                    {pedido.notas ? <p className="mt-2 text-sm text-[var(--text-muted)]">{pedido.notas}</p> : null}
                  </div>
                </div>
                <p className="shrink-0 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-bold text-[var(--primary)]">
                  {date.format(pedido.fechaEntrega)}
                </p>
              </div>
              <div className="mt-5 grid gap-2 rounded-[1.5rem] bg-[var(--app-bg)] p-3 sm:grid-cols-3">
                <Link className="ui-button-compact gap-2" href={orderLink("/ventas", pedido)}>
                  <Banknote aria-hidden="true" className="size-4" />
                  Venta
                </Link>
                <Link className="ui-button-compact gap-2" href={orderLink("/fiados", pedido)}>
                  <ReceiptText aria-hidden="true" className="size-4" />
                  Crédito
                </Link>
                <form action={cancelarPedido}>
                  <input name="pedidoId" type="hidden" value={pedido.id} />
                  <ConfirmSubmitButton
                    className="ui-button-danger w-full gap-2"
                    title="Cancelar pedido"
                    description={`Se cancelará el pedido de ${pedido.cliente.nombre}. No afectará ventas ni créditos.`}
                    confirmLabel="Cancelar pedido"
                  >
                    <X aria-hidden="true" className="size-4" />
                    Cancelar
                  </ConfirmSubmitButton>
                </form>
              </div>
            </article>
          ))
        )}
        <Pagination basePath="/pedidos" page={page} q={q} totalPages={totalPages} />
      </section>
    </main>
  );
}
