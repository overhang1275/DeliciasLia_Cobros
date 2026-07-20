import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });
const day = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short" });

function barWidth(value: number, max: number) {
  return `${max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0}%`;
}

function dateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDate(value: string | undefined, fallback: Date, endOfDay = false) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date(fallback);
  if (Number.isNaN(date.getTime())) return fallback;
  date.setHours(endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  return date;
}

export default async function ReportesPage({ searchParams }: { searchParams: Promise<{ desde?: string; hasta?: string }> }) {
  const params = await searchParams;
  const defaultHasta = new Date();
  const defaultDesde = new Date();
  defaultDesde.setDate(defaultHasta.getDate() - 13);

  const since = parseDate(params.desde, defaultDesde);
  const until = parseDate(params.hasta, defaultHasta, true);
  const days = Math.max(1, Math.min(60, Math.ceil((until.getTime() - since.getTime()) / 86400000) + 1));
  const range = { gte: since, lte: until };

  const [ventas, pagos, detalles, ventasPendientes] = await Promise.all([
    db.venta.findMany({
      where: { fecha: range, estado: { not: "CANCELADA" } },
      include: { pagos: true },
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
    })
  ]);

  const totalVentas = ventas.reduce((sum, venta) => sum + Number(venta.total), 0);
  const cobrado = pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
  const utilidad = ventas.reduce((sum, venta) => sum + Number(venta.utilidadTotal), 0);
  const porCobrar = ventas.reduce((sum, venta) => {
    const pagado = venta.pagos.reduce((subtotal, pago) => subtotal + Number(pago.monto), 0);
    return sum + Math.max(0, Number(venta.total) - pagado);
  }, 0);

  const ventasPorDia = Array.from({ length: days }, (_, i) => {
    const date = new Date(since);
    date.setDate(since.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    const total = ventas
      .filter((venta) => venta.fecha.toISOString().slice(0, 10) === key)
      .reduce((sum, venta) => sum + Number(venta.total), 0);
    return { label: day.format(date), total };
  }).filter((item) => item.total > 0);
  const maxDia = Math.max(...ventasPorDia.map((item) => item.total), 0);

  const productos = new Map<string, { piezas: number; total: number }>();
  for (const detalle of detalles) {
    const actual = productos.get(detalle.producto.nombre) || { piezas: 0, total: 0 };
    productos.set(detalle.producto.nombre, {
      piezas: actual.piezas + detalle.cantidad,
      total: actual.total + Number(detalle.subtotal)
    });
  }
  const topProductos = [...productos.entries()]
    .map(([nombre, data]) => ({ nombre, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const maxProducto = Math.max(...topProductos.map((item) => item.total), 0);

  const pagosPorMetodo = ["EFECTIVO", "TRANSFERENCIA"].map((metodo) => ({
    metodo,
    total: pagos.filter((pago) => pago.metodo === metodo).reduce((sum, pago) => sum + Number(pago.monto), 0)
  }));
  const maxMetodo = Math.max(...pagosPorMetodo.map((item) => item.total), 0);
  const deudores = new Map<string, number>();
  for (const venta of ventasPendientes) {
    const pagado = venta.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
    const pendiente = Math.max(0, Number(venta.total) - pagado);
    if (pendiente > 0) deudores.set(venta.cliente.nombre, (deudores.get(venta.cliente.nombre) || 0) + pendiente);
  }
  const listaDeudores = [...deudores.entries()]
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total);

  return (
    <main className="app-page">
      <header className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-3xl" aria-hidden="true">📊</span>
        <div className="min-w-0 flex-1">
          <p className="ui-label">Reportes</p>
          <h1 className="truncate text-3xl font-bold text-[var(--brand)]">Analisis</h1>
        </div>
        <Link className="grid size-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-xl text-[var(--primary)]" href="/" aria-label="Inicio">
          <span aria-hidden="true">⌂</span>
        </Link>
      </header>

      <form className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm sm:grid-cols-[1fr_1fr_auto]" action="/reportes">
        <div>
          <label className="ui-label" htmlFor="desde">
            Desde 📅
          </label>
          <input className="ui-input mt-2" defaultValue={dateInput(since)} id="desde" name="desde" type="date" />
        </div>
        <div>
          <label className="ui-label" htmlFor="hasta">
            Hasta 📅
          </label>
          <input className="ui-input mt-2" defaultValue={dateInput(until)} id="hasta" name="hasta" type="date" />
        </div>
        <button className="ui-button-primary self-end px-5" type="submit">
          🔎 Aplicar
        </button>
      </form>

      <section className="grid grid-cols-2 gap-3" aria-label="Resumen">
        {[
          ["🧾", "Ventas", money.format(totalVentas)],
          ["💵", "Cobrado", money.format(cobrado)],
          ["📒", "Por cobrar", money.format(porCobrar)],
          ["📈", "Utilidad", money.format(utilidad)]
        ].map(([icon, label, value]) => (
          <article className="rounded-[1.75rem] bg-white p-4 shadow-sm" key={label}>
            <span className="text-2xl" aria-hidden="true">{icon}</span>
            <p className="ui-label">{label}</p>
            <p className="mt-2 text-2xl font-bold text-[var(--brand)]">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--brand)]">📅 Ventas por dia</h2>
        {ventasPorDia.length === 0 ? (
          <p className="ui-label">No hubo ventas en este rango.</p>
        ) : (
          ventasPorDia.map((item) => (
            <div className="grid gap-1" key={item.label}>
              <div className="flex justify-between text-sm">
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
          <h2 className="text-xl font-bold text-[var(--brand)]">🍮 Mejores productos</h2>
          {topProductos.length === 0 ? (
            <p className="ui-label">Todavia no hay ventas.</p>
          ) : (
            topProductos.map((item) => (
              <div className="grid gap-1" key={item.nombre}>
                <div className="flex justify-between gap-3 text-sm">
                  <span>{item.nombre} x {item.piezas}</span>
                  <strong>{money.format(item.total)}</strong>
                </div>
                <div className="h-3 rounded-full bg-[var(--primary-soft)]">
                  <div className="h-3 rounded-full bg-[var(--primary)]" style={{ width: barWidth(item.total, maxProducto) }} />
                </div>
              </div>
            ))
          )}
        </article>

        <article className="grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-bold text-[var(--brand)]">💳 Forma de pago</h2>
          {pagosPorMetodo.map((item) => (
            <div className="grid gap-1" key={item.metodo}>
              <div className="flex justify-between text-sm">
                <span>{item.metodo === "EFECTIVO" ? "Efectivo" : "Transferencia"}</span>
                <strong>{money.format(item.total)}</strong>
              </div>
              <div className="h-3 rounded-full bg-[var(--primary-soft)]">
                <div className="h-3 rounded-full bg-[var(--primary)]" style={{ width: barWidth(item.total, maxMetodo) }} />
              </div>
            </div>
          ))}
        </article>
      </section>

      <section className="grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--brand)]">💰 Clientes con deuda</h2>
        {listaDeudores.length === 0 ? (
          <p className="ui-label">No hay clientes con deuda pendiente.</p>
        ) : (
          listaDeudores.map((cliente) => (
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] py-2 last:border-b-0" key={cliente.nombre}>
              <span className="font-bold text-[var(--text-main)]">{cliente.nombre}</span>
              <strong className="rounded-full bg-red-50 px-3 py-1 text-red-700">{money.format(cliente.total)}</strong>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
