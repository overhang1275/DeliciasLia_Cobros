import Link from "next/link";
import { EstadoVenta } from "@prisma/client";
import { registrarFiado } from "./actions";
import { Banknote, CalendarDays, FileText, HandCoins, Home, Package, ReceiptText, Save, Search } from "@/components/AppIcon";
import { ClienteSearchField } from "@/components/ClienteSearchField";
import { EliminarFiadoForm } from "@/components/EliminarFiadoForm";
import { LiquidarDeudaForm } from "@/components/LiquidarDeudaForm";
import { Pagination } from "@/components/Pagination";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
const pageSize = 6;

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });
const date = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" });
const today = new Date().toISOString().slice(0, 10);

export default async function FiadosPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; clienteId?: string; guardado?: string; productoId?: string; piezas?: string }> }) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const page = Math.max(1, Number(params.page) || 1);
  const defaultClienteId = Number(params.clienteId) || undefined;
  const defaultProductoId = Number(params.productoId) || undefined;
  const defaultPiezas = Math.max(1, Number(params.piezas) || 1);
  const where = {
    estado: { in: [EstadoVenta.FIADA, EstadoVenta.PARCIAL] },
    ...(q
      ? {
          OR: [
            { cliente: { nombre: { contains: q } } },
            { detalles: { some: { producto: { nombre: { contains: q } } } } },
            { observaciones: { contains: q } }
          ]
        }
      : {})
  };
  const [clientes, productos, ventasFiadas, total] = await Promise.all([
    db.cliente.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    db.producto.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    db.venta.findMany({
      where,
      include: { cliente: true, detalles: { include: { producto: true } }, pagos: true },
      orderBy: { fecha: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    db.venta.count({ where })
  ]);

  const pendientes = ventasFiadas
    .map((venta) => {
      const pagado = venta.pagos.reduce((total, pago) => total + Number(pago.monto), 0);
      return { ...venta, pendiente: Number(venta.total) - pagado };
    })
    .filter((venta) => venta.pendiente > 0);
  const clienteIds = [...new Set(pendientes.map((venta) => venta.clienteId))];
  const ventasPendientesPorCliente =
    clienteIds.length > 0
      ? await db.venta.findMany({
          where: { clienteId: { in: clienteIds }, estado: { in: [EstadoVenta.FIADA, EstadoVenta.PARCIAL] } },
          include: { pagos: true }
        })
      : [];
  const totalPorCliente = new Map<number, number>();
  for (const venta of ventasPendientesPorCliente) {
    const pagado = venta.pagos.reduce((total, pago) => total + Number(pago.monto), 0);
    const pendiente = Math.max(0, Number(venta.total) - pagado);
    totalPorCliente.set(venta.clienteId, (totalPorCliente.get(venta.clienteId) || 0) + pendiente);
  }
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="app-page">
      <header className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
          <ReceiptText className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="ui-label">Cobros pendientes</p>
          <h1 className="truncate text-3xl font-bold text-[var(--brand)]">Crédito</h1>
        </div>
        <Link className="ui-icon-button" href="/" aria-label="Inicio" title="Inicio">
          <Home aria-hidden="true" className="size-5" />
        </Link>
      </header>

      <form action={registrarFiado} className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm">
        <div>
          <p className="ui-label">Nuevo crédito</p>
          <h2 className="text-xl font-bold text-[var(--brand)]">Quien queda pendiente?</h2>
        </div>

        <ClienteSearchField clientes={clientes} defaultClienteId={defaultClienteId} />

        <div>
          <label className="ui-label inline-flex items-center gap-1" htmlFor="productoId">
            Producto <Package aria-hidden="true" className="size-4" />
          </label>
          <select className="ui-input mt-2" defaultValue={defaultProductoId} id="productoId" name="productoId" required>
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
          <input className="ui-input mt-2" defaultValue={defaultPiezas} id="piezas" inputMode="numeric" min="1" name="piezas" placeholder="1" required type="number" />
        </div>

        <div>
          <label className="ui-label inline-flex items-center gap-1" htmlFor="fecha">
            Fecha de venta <CalendarDays aria-hidden="true" className="size-4" />
          </label>
          <input className="ui-input mt-2" defaultValue={today} id="fecha" name="fecha" required type="date" />
        </div>

        <button className="ui-button-primary gap-2" type="submit">
          <Save aria-hidden="true" className="size-5" />
          Guardar
        </button>
      </form>

      <section className="grid gap-4" aria-label="Créditos pendientes">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--brand)]">Pendientes</h2>
          <HandCoins className="size-6 text-[var(--primary)]" aria-hidden="true" />
        </div>
        <form className="flex gap-3 rounded-[1.75rem] bg-white p-3 shadow-sm" action="/fiados">
          <input className="ui-input" defaultValue={q} name="q" placeholder="Buscar crédito" />
          <button className="ui-button-secondary min-h-14 px-4" type="submit" aria-label="Filtrar" title="Filtrar">
            <Search aria-hidden="true" className="size-5" />
          </button>
        </form>
        {pendientes.length === 0 ? (
          <p className="rounded-[1.75rem] bg-white p-4 text-[var(--text-muted)] shadow-sm">No hay créditos pendientes.</p>
        ) : (
          pendientes.map((venta) => (
            <article className="rounded-[1.75rem] bg-white p-5 shadow-sm" key={venta.id}>
              <div className="flex items-start justify-between gap-5">
                <div className="flex min-w-0 flex-1 gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
                    <ReceiptText className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-[var(--text-main)]">{venta.cliente.nombre}</h3>
                    <p className="ui-label">
                      {venta.detalles[0]
                        ? `${venta.detalles[0].producto.nombre} x ${venta.detalles[0].cantidad}`
                        : venta.observaciones || "Crédito"}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm text-[var(--text-muted)]">
                      <CalendarDays aria-hidden="true" className="size-4" />
                      {date.format(venta.fecha)}
                    </p>
                  </div>
                </div>
                <p className="shrink-0 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-bold text-[var(--primary)]">
                  {money.format(venta.pendiente)}
                </p>
              </div>
              <div className="mt-5 grid gap-3 rounded-[1.5rem] bg-[var(--app-bg)] p-3 lg:grid-cols-[auto_1fr]">
                <div className="grid gap-2 sm:grid-cols-2 lg:flex">
                  <Link className="ui-button-compact gap-2" href={`/fiados/${venta.id}/pago`}>
                    <Banknote aria-hidden="true" className="size-4" />
                    Registrar pago
                  </Link>
                  <Link
                    className="ui-button-compact gap-2"
                    href={venta.cliente.estadoToken ? `/estado/${venta.cliente.estadoToken}` : `/clientes/${venta.clienteId}/estado`}
                  >
                    <FileText aria-hidden="true" className="size-4" />
                    Estado de cuenta
                  </Link>
                </div>
                <div className="lg:justify-self-end">
                  <LiquidarDeudaForm clienteId={venta.clienteId} total={money.format(totalPorCliente.get(venta.clienteId) || venta.pendiente)} />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <EliminarFiadoForm ventaId={venta.id} />
              </div>
            </article>
          ))
        )}
        <Pagination basePath="/fiados" page={page} q={q} totalPages={totalPages} />
      </section>
    </main>
  );
}
