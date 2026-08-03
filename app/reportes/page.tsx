import Link from "next/link";
import {
  Banknote,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CreditCard,
  HandCoins,
  Home,
  ReceiptText,
  Search,
  Trophy,
  Wallet
} from "@/components/AppIcon";
import { obtenerReporteData } from "@/lib/reportes";
import { dateInputValue } from "@/lib/timezone";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });
const percent = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1, style: "percent" });

function barWidth(value: number, max: number) {
  return `${max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0}%`;
}

function percentText(value: number, total: number) {
  return total > 0 ? percent.format(value / total) : "0%";
}

export default async function ReportesPage({ searchParams }: { searchParams: Promise<{ desde?: string; hasta?: string }> }) {
  const params = await searchParams;
  const {
    cambiosPendientes,
    cobrado,
    creditoGenerado,
    deudaTotal,
    efectivo,
    efectivoPct,
    listaDeudores,
    maxCliente,
    maxDia,
    maxPagoDia,
    pagosPorDia,
    pagosPorMetodo,
    piezasVendidas,
    since,
    ticketPromedio,
    topClientes,
    totalCambiosPendientes,
    totalPorMetodo,
    totalVentas,
    until,
    ventas,
    ventasConCredito,
    ventasPorDia
  } = await obtenerReporteData(params);

  const corte = [
    ["Ventas registradas", money.format(totalVentas)],
    ["Pagos recibidos", money.format(cobrado)],
    ["Crédito generado", money.format(creditoGenerado)],
    ["Cambios pendientes", money.format(totalCambiosPendientes)]
  ];

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
          <p className="ui-label">{percentText(cobrado, totalVentas)} del rango</p>
        </article>
        <article className="rounded-[1.75rem] bg-white p-4 shadow-sm">
          <Wallet aria-hidden="true" className="size-6 text-red-700" />
          <p className="ui-label">Crédito</p>
          <p className="mt-2 text-2xl font-bold text-[var(--brand)]">{money.format(creditoGenerado)}</p>
          <p className="ui-label">Total por cobrar {money.format(deudaTotal)}</p>
        </article>
        <article className="rounded-[1.75rem] bg-white p-4 shadow-sm">
          <HandCoins aria-hidden="true" className="size-6 text-amber-700" />
          <p className="ui-label">Cambios</p>
          <p className="mt-2 text-2xl font-bold text-[var(--brand)]">{money.format(totalCambiosPendientes)}</p>
          <p className="ui-label">Pendientes por entregar</p>
        </article>
      </section>

      <section className="grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm">
        <h2 className="inline-flex items-center gap-2 text-xl font-bold text-[var(--brand)]">
          <CreditCard aria-hidden="true" className="size-5 text-[var(--primary)]" />
          Cobrado vs crédito
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[var(--app-bg)] p-4">
            <p className="ui-label">Ticket promedio</p>
            <p className="text-xl font-bold text-[var(--brand)]">{money.format(ticketPromedio)}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
            <p className="ui-label">Pagos recibidos</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{money.format(cobrado)}</p>
          </div>
          <div className="rounded-2xl bg-red-50 p-4 dark:bg-red-950/30">
            <p className="ui-label">Tickets a crédito</p>
            <p className="text-xl font-bold text-red-700 dark:text-red-300">{ventasConCredito.length}</p>
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

      <section className="grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm">
        <h2 className="inline-flex items-center gap-2 text-xl font-bold text-[var(--brand)]">
          <Banknote aria-hidden="true" className="size-5 text-[var(--primary)]" />
          Pagos recibidos por periodo
        </h2>
        {pagosPorDia.length === 0 ? (
          <p className="ui-label">No hubo pagos en este rango.</p>
        ) : (
          pagosPorDia.map((item) => (
            <div className="grid gap-1" key={item.label}>
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-[var(--text-muted)]">{item.label}</span>
                <strong>{money.format(item.total)}</strong>
              </div>
              <div className="h-3 rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                <div className="h-3 rounded-full bg-emerald-600" style={{ width: barWidth(item.total, maxPagoDia) }} />
              </div>
            </div>
          ))
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <article className="grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-xl font-bold text-[var(--brand)]">
            <Trophy aria-hidden="true" className="size-5 text-[var(--primary)]" />
            Clientes que más compran
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
            <Wallet aria-hidden="true" className="size-5 text-red-700" />
            Clientes que más deben
          </h2>
          {listaDeudores.length === 0 ? (
            <p className="ui-label">No hay clientes con crédito pendiente.</p>
          ) : (
            listaDeudores.map((cliente) => (
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] py-2 last:border-b-0" key={cliente.nombre}>
                <span className="font-bold text-[var(--text-main)]">{cliente.nombre}</span>
                <strong className="rounded-full bg-red-50 px-3 py-1 text-red-700 dark:bg-red-950/30 dark:text-red-300">{money.format(cliente.total)}</strong>
              </div>
            ))
          )}
        </article>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
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

        <article className="grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-xl font-bold text-[var(--brand)]">
            <HandCoins aria-hidden="true" className="size-5 text-amber-700" />
            Cambios pendientes
          </h2>
          {cambiosPendientes.length === 0 ? (
            <p className="ui-label">No tienes cambios pendientes por entregar.</p>
          ) : (
            cambiosPendientes.map((venta) => (
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] py-2 last:border-b-0" key={venta.id}>
                <span>
                  <strong className="block text-[var(--text-main)]">{venta.cliente.nombre}</strong>
                  <span className="ui-label">Ticket {String(venta.id).padStart(6, "0")}</span>
                </span>
                <strong className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                  {money.format(Number(venta.cambioMonto))}
                </strong>
              </div>
            ))
          )}
        </article>
      </section>

      <section className="grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm">
        <h2 className="inline-flex items-center gap-2 text-xl font-bold text-[var(--brand)]">
          <ReceiptText aria-hidden="true" className="size-5 text-[var(--primary)]" />
          Corte del periodo
        </h2>
        <div className="grid gap-2">
          {corte.map(([label, value]) => (
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--app-bg)] px-4 py-3" key={label}>
              <span className="text-sm font-bold text-[var(--text-main)]">{label}</span>
              <strong className="text-right text-[var(--brand)]">{value}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
