import Link from "next/link";
import {
  Banknote,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  CreditCard,
  Home,
  Package,
  ReceiptText,
  Search,
  Trophy,
  Wallet
} from "@/components/AppIcon";
import { db } from "@/lib/db";
import { appDateFormatter, dateInputValue, parseDateInput } from "@/lib/timezone";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });
const day = appDateFormatter({ day: "2-digit", month: "short" });
const percent = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1, style: "percent" });

function barWidth(value: number, max: number) {
  return `${max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0}%`;
}

function percentText(value: number, total: number) {
  return total > 0 ? percent.format(value / total) : "0%";
}

export default async function ReportesPage({ searchParams }: { searchParams: Promise<{ desde?: string; hasta?: string }> }) {
  const params = await searchParams;
  const defaultHasta = new Date();
  const defaultDesde = new Date();
  defaultDesde.setDate(defaultHasta.getDate() - 13);

  const since = parseDateInput(params.desde, defaultDesde);
  const until = parseDateInput(params.hasta, defaultHasta, true);
  const days = Math.max(1, Math.min(60, Math.ceil((until.getTime() - since.getTime()) / 86400000) + 1));
  const range = { gte: since, lte: until };

  const [ventas, pagos, detalles, ventasPendientes, pedidosPendientes] = await Promise.all([
    db.venta.findMany({
      where: { fecha: range, estado: { not: "CANCELADA" } },
      include: { cliente: true, pagos: true },
      orderBy: { fecha: "asc" }
    }),
    db.pago.findMany({ where: { fecha: range }, orderBy: { fecha: "asc" } }),
    db.detalleVenta.findMany({
      where: { venta: { fecha: range, estado: { not: "CANCELADA" } } },
      include: { producto: true }
    }),
    db.venta.findMany({
      where: { estado: { in: ["FIADA", "PARCIAL"] } },
      include: { cliente: true, pagos: true }
    }),
    db.pedido.findMany({
      where: { estado: "PENDIENTE" },
      include: { producto: true },
      orderBy: { fechaEntrega: "asc" }
    })
  ]);

  const totalVentas = ventas.reduce((sum, venta) => sum + Number(venta.total), 0);
  const cobrado = pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
  const piezasVendidas = detalles.reduce((sum, detalle) => sum + detalle.cantidad, 0);
  const porCobrar = ventas.reduce((sum, venta) => {
    const pagado = venta.pagos.reduce((subtotal, pago) => subtotal + Number(pago.monto), 0);
    return sum + Math.max(0, Number(venta.total) - pagado);
  }, 0);
  const deudaTotal = ventasPendientes.reduce((sum, venta) => {
    const pagado = venta.pagos.reduce((subtotal, pago) => subtotal + Number(pago.monto), 0);
    return sum + Math.max(0, Number(venta.total) - pagado);
  }, 0);
  const ticketPromedio = ventas.length ? totalVentas / ventas.length : 0;
  const piezasPedidos = pedidosPendientes.reduce((sum, pedido) => sum + pedido.piezas, 0);
  const ventasConCredito = ventas.filter((venta) => venta.estado === "FIADA" || venta.estado === "PARCIAL");

  const ventasPorDia = Array.from({ length: days }, (_, i) => {
    const date = new Date(since);
    date.setDate(since.getDate() + i);
    const key = dateInputValue(date);
    const ventasDia = ventas.filter((venta) => dateInputValue(venta.fecha) === key);
    const total = ventasDia.reduce((sum, venta) => sum + Number(venta.total), 0);
    return { label: day.format(date), total };
  }).filter((item) => item.total > 0);
  const maxDia = Math.max(...ventasPorDia.map((item) => item.total), 0);

  const clientes = new Map<number, { nombre: string; compras: number; total: number; pendiente: number }>();
  for (const venta of ventas) {
    const actual = clientes.get(venta.clienteId) || { nombre: venta.cliente.nombre, compras: 0, total: 0, pendiente: 0 };
    const pagado = venta.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
    clientes.set(venta.clienteId, {
      nombre: actual.nombre,
      compras: actual.compras + 1,
      total: actual.total + Number(venta.total),
      pendiente: actual.pendiente + Math.max(0, Number(venta.total) - pagado)
    });
  }
  const topClientes = [...clientes.values()]
    .map((data) => ({ promedio: data.total / data.compras, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const maxCliente = Math.max(...topClientes.map((item) => item.total), 0);

  const productos = new Map<string, { piezas: number; total: number }>();
  for (const detalle of detalles) {
    const actual = productos.get(detalle.producto.nombre) || { piezas: 0, total: 0 };
    const total = Number(detalle.subtotal);
    productos.set(detalle.producto.nombre, {
      piezas: actual.piezas + detalle.cantidad,
      total: actual.total + total
    });
  }
  const topProductosPiezas = [...productos.entries()]
    .map(([nombre, data]) => ({ nombre, ...data }))
    .sort((a, b) => b.piezas - a.piezas || b.total - a.total)
    .slice(0, 8);
  const maxProductoPiezas = Math.max(...topProductosPiezas.map((item) => item.piezas), 0);
  const topProductosMonto = [...productos.entries()]
    .map(([nombre, data]) => ({ nombre, ...data }))
    .sort((a, b) => b.total - a.total || b.piezas - a.piezas)
    .slice(0, 8);
  const maxProductoMonto = Math.max(...topProductosMonto.map((item) => item.total), 0);

  const pagosPorMetodo = ["EFECTIVO", "TRANSFERENCIA"].map((metodo) => ({
    metodo,
    total: pagos.filter((pago) => pago.metodo === metodo).reduce((sum, pago) => sum + Number(pago.monto), 0)
  }));
  const totalPorMetodo = pagosPorMetodo.reduce((sum, item) => sum + item.total, 0);
  const efectivo = pagosPorMetodo.find((item) => item.metodo === "EFECTIVO")?.total || 0;
  const efectivoPct = totalPorMetodo > 0 ? Math.round((efectivo / totalPorMetodo) * 100) : 0;

  const deudores = new Map<string, number>();
  for (const venta of ventasPendientes) {
    const pagado = venta.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
    const pendiente = Math.max(0, Number(venta.total) - pagado);
    if (pendiente > 0) deudores.set(venta.cliente.nombre, (deudores.get(venta.cliente.nombre) || 0) + pendiente);
  }
  const listaDeudores = [...deudores.entries()]
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return (
    <main className="app-page">
      <header className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
          <ChartNoAxesColumnIncreasing className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="ui-label">Reportes</p>
          <h1 className="truncate text-3xl font-bold text-[var(--brand)]">Análisis</h1>
        </div>
        <Link className="ui-icon-button" href="/" aria-label="Inicio" title="Inicio">
          <Home aria-hidden="true" className="size-5" />
        </Link>
      </header>

      <form className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm sm:grid-cols-[1fr_1fr_auto]" action="/reportes">
        <div>
          <label className="ui-label inline-flex items-center gap-1" htmlFor="desde">
            Desde <CalendarDays aria-hidden="true" className="size-4" />
          </label>
          <input className="ui-input mt-2" defaultValue={dateInputValue(since)} id="desde" name="desde" type="date" />
        </div>
        <div>
          <label className="ui-label inline-flex items-center gap-1" htmlFor="hasta">
            Hasta <CalendarDays aria-hidden="true" className="size-4" />
          </label>
          <input className="ui-input mt-2" defaultValue={dateInputValue(until)} id="hasta" name="hasta" type="date" />
        </div>
        <button className="ui-button-primary self-end gap-2 px-5" type="submit">
          <Search aria-hidden="true" className="size-5" />
          Aplicar
        </button>
      </form>

      <section className="grid grid-cols-2 gap-3" aria-label="Resumen">
        <article className="rounded-[1.75rem] bg-white p-4 shadow-sm">
          <ReceiptText aria-hidden="true" className="size-6 text-[var(--primary)]" />
          <p className="ui-label">Ventas</p>
          <p className="mt-2 text-2xl font-bold text-[var(--brand)]">{money.format(totalVentas)}</p>
          <p className="ui-label">{ventas.length} tickets · {piezasVendidas} piezas</p>
        </article>
        <article className="rounded-[1.75rem] bg-white p-4 shadow-sm">
          <Banknote aria-hidden="true" className="size-6 text-[var(--primary)]" />
          <p className="ui-label">Cobrado</p>
          <p className="mt-2 text-2xl font-bold text-[var(--brand)]">{money.format(cobrado)}</p>
          <p className="ui-label">{percentText(cobrado, totalVentas)} de ventas del rango</p>
        </article>
        <article className="rounded-[1.75rem] bg-white p-4 shadow-sm">
          <Wallet aria-hidden="true" className="size-6 text-[var(--primary)]" />
          <p className="ui-label">Por cobrar</p>
          <p className="mt-2 text-2xl font-bold text-[var(--brand)]">{money.format(porCobrar)}</p>
          <p className="ui-label">Crédito total {money.format(deudaTotal)}</p>
        </article>
        <article className="rounded-[1.75rem] bg-white p-4 shadow-sm">
          <ClipboardList aria-hidden="true" className="size-6 text-[var(--primary)]" />
          <p className="ui-label">Pedidos pendientes</p>
          <p className="mt-2 text-2xl font-bold text-[var(--brand)]">{pedidosPendientes.length}</p>
          <p className="ui-label">{piezasPedidos} piezas comprometidas</p>
        </article>
      </section>

      <section className="grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm">
        <h2 className="inline-flex items-center gap-2 text-xl font-bold text-[var(--brand)]">
          <ClipboardList aria-hidden="true" className="size-5 text-[var(--primary)]" />
          Indicadores para decidir
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[var(--app-bg)] p-4">
            <p className="ui-label">Ticket promedio</p>
            <p className="text-xl font-bold text-[var(--brand)]">{money.format(ticketPromedio)}</p>
            <p className="text-sm text-[var(--text-muted)]">Promedio por ticket vendido</p>
          </div>
          <div className="rounded-2xl bg-[var(--app-bg)] p-4">
            <p className="ui-label">Tickets con crédito</p>
            <p className="text-xl font-bold text-[var(--brand)]">{ventasConCredito.length}</p>
            <p className="text-sm text-[var(--text-muted)]">{percentText(ventasConCredito.length, ventas.length)} del rango</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm">
        <h2 className="inline-flex items-center gap-2 text-xl font-bold text-[var(--brand)]">
          <CalendarDays aria-hidden="true" className="size-5 text-[var(--primary)]" />
          Ventas por día
        </h2>
        {ventasPorDia.length === 0 ? (
          <p className="ui-label">No hubo ventas en este rango.</p>
        ) : (
          ventasPorDia.map((item) => (
            <div className="grid gap-1" key={item.label}>
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-[var(--text-muted)]">{item.label}</span>
                <strong>{money.format(item.total)}</strong>
              </div>
              <div className="h-3 rounded-full bg-[var(--primary-soft)]">
                <div className="h-3 rounded-full bg-[var(--primary)]" style={{ width: barWidth(item.total, maxDia) }} />
              </div>
            </div>
          ))
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <article className="grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-xl font-bold text-[var(--brand)]">
            <Trophy aria-hidden="true" className="size-5 text-[var(--primary)]" />
            Top clientes
          </h2>
          {topClientes.length === 0 ? (
            <p className="ui-label">Todavía no hay ventas en este rango.</p>
          ) : (
            topClientes.map((cliente, index) => (
              <div className="grid gap-1" key={cliente.nombre}>
                <div className="flex items-start justify-between gap-3 text-sm">
                  <span>
                    <strong className="text-[var(--text-main)]">
                      {index + 1}. {cliente.nombre}
                    </strong>
                    <span className="ui-label block">{cliente.compras} compras · ticket {money.format(cliente.promedio)}</span>
                  </span>
                  <strong>{money.format(cliente.total)}</strong>
                </div>
                <div className="h-3 rounded-full bg-[var(--primary-soft)]">
                  <div className="h-3 rounded-full bg-[var(--primary)]" style={{ width: barWidth(cliente.total, maxCliente) }} />
                </div>
              </div>
            ))
          )}
        </article>

        <article className="grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-xl font-bold text-[var(--brand)]">
            <Package aria-hidden="true" className="size-5 text-[var(--primary)]" />
            Productos más vendidos
          </h2>
          {topProductosPiezas.length === 0 ? (
            <p className="ui-label">Todavía no hay ventas.</p>
          ) : (
            topProductosPiezas.map((item) => (
              <div className="grid gap-1" key={item.nombre}>
                <div className="flex justify-between gap-3 text-sm">
                  <span>
                    <strong>{item.nombre}</strong>
                    <span className="ui-label block">{money.format(item.total)}</span>
                  </span>
                  <strong>{item.piezas} pz</strong>
                </div>
                <div className="h-3 rounded-full bg-[var(--primary-soft)]">
                  <div className="h-3 rounded-full bg-[var(--primary)]" style={{ width: barWidth(item.piezas, maxProductoPiezas) }} />
                </div>
              </div>
            ))
          )}
        </article>

        <article className="grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-xl font-bold text-[var(--brand)]">
            <Package aria-hidden="true" className="size-5 text-[var(--primary)]" />
            Productos con más venta
          </h2>
          {topProductosMonto.length === 0 ? (
            <p className="ui-label">Todavía no hay ventas.</p>
          ) : (
            topProductosMonto.map((item) => (
              <div className="grid gap-1" key={item.nombre}>
                <div className="flex justify-between gap-3 text-sm">
                  <span>
                    <strong>{item.nombre}</strong>
                    <span className="ui-label block">{item.piezas} piezas</span>
                  </span>
                  <strong>{money.format(item.total)}</strong>
                </div>
                <div className="h-3 rounded-full bg-[var(--primary-soft)]">
                  <div className="h-3 rounded-full bg-[var(--primary)]" style={{ width: barWidth(item.total, maxProductoMonto) }} />
                </div>
              </div>
            ))
          )}
        </article>
      </section>

      <section className="grid gap-3">
        <article className="grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-xl font-bold text-[var(--brand)]">
            <CreditCard aria-hidden="true" className="size-5 text-[var(--primary)]" />
            Forma de pago
          </h2>
          {totalPorMetodo <= 0 ? (
            <p className="ui-label">Todavía no hay pagos en este rango.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div
                className="mx-auto grid size-36 place-items-center rounded-full"
                style={{ background: `conic-gradient(var(--primary) 0 ${efectivoPct}%, var(--brand) ${efectivoPct}% 100%)` }}
                aria-label={`Efectivo ${percentText(efectivo, totalPorMetodo)}, transferencia ${percentText(totalPorMetodo - efectivo, totalPorMetodo)}`}
              >
                <div className="grid size-24 place-items-center rounded-full bg-white text-center shadow-sm">
                  <span>
                    <strong className="block text-xl text-[var(--brand)]">{percentText(efectivo, totalPorMetodo)}</strong>
                    <span className="ui-label">Efectivo</span>
                  </span>
                </div>
              </div>
              <div className="grid gap-3">
                {pagosPorMetodo.map((item) => (
                  <div className="flex items-center justify-between gap-3" key={item.metodo}>
                    <span className="flex items-center gap-2 text-sm font-bold text-[var(--text-main)]">
                      <span className={`size-3 rounded-full ${item.metodo === "EFECTIVO" ? "bg-[var(--primary)]" : "bg-[var(--brand)]"}`} aria-hidden="true" />
                      {item.metodo === "EFECTIVO" ? "Efectivo" : "Transferencia"}
                    </span>
                    <span className="text-right text-sm">
                      <strong className="block">{money.format(item.total)}</strong>
                      <span className="ui-label">{percentText(item.total, totalPorMetodo)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <article className="grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-xl font-bold text-[var(--brand)]">
            <Wallet aria-hidden="true" className="size-5 text-[var(--primary)]" />
            Clientes con crédito
          </h2>
          {listaDeudores.length === 0 ? (
            <p className="ui-label">No hay clientes con crédito pendiente.</p>
          ) : (
            listaDeudores.map((cliente) => (
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] py-2 last:border-b-0" key={cliente.nombre}>
                <span className="font-bold text-[var(--text-main)]">{cliente.nombre}</span>
                <strong className="rounded-full bg-red-50 px-3 py-1 text-red-700">{money.format(cliente.total)}</strong>
              </div>
            ))
          )}
        </article>

      </section>
    </main>
  );
}
