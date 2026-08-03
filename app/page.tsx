import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { logout } from "@/app/login/actions";
import { ConfigAccordionItem } from "@/app/configuracion/ConfigAccordionItem";
import { ChevronRight, CreditCard, HandCoins, LogOut, Package, Plus, ReceiptText, Store, User, Users, Wallet } from "@/components/AppIcon";
import { getConfiguracion } from "@/lib/configuracion";
import { db } from "@/lib/db";
import { formatMoney, formatPercent } from "@/lib/formatters";
import { saldoVentas } from "@/lib/saldos";
import { todayRange } from "@/lib/timezone";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rangoHoy = todayRange();
  const [config, clientes, productos, ventasFiadas, cambiosPendientes, piezasHoy, cobradoHoy, creditoHoy, pagosHoy] = await Promise.all([
    getConfiguracion(),
    db.cliente.count({ where: { activo: true } }),
    db.producto.count({ where: { activo: true } }),
    db.venta.findMany({
      where: { estado: { in: ["FIADA", "PARCIAL"] } },
      include: { pagos: true }
    }),
    db.venta.aggregate({
      where: { cambioPendiente: true },
      _sum: { cambioMonto: true }
    }),
    db.detalleVenta.aggregate({
      where: { venta: { fecha: rangoHoy, estado: { not: "CANCELADA" } } },
      _sum: { cantidad: true }
    }),
    db.pago.aggregate({
      where: { fecha: rangoHoy },
      _sum: { monto: true }
    }),
    db.venta.aggregate({
      where: { fecha: rangoHoy, estado: { in: ["FIADA", "PARCIAL"] } },
      _sum: { total: true }
    }),
    db.pago.groupBy({
      by: ["metodo"],
      where: { fecha: rangoHoy },
      _sum: { monto: true }
    })
  ]);

  const porCobrar = saldoVentas(ventasFiadas);

  const metrics: [LucideIcon, string, string, string][] = [
    [HandCoins, "Crédito por cobrar", formatMoney(porCobrar), "Dinero pendiente por cobrar"],
    [Wallet, "Cambios que debo", formatMoney(Number(cambiosPendientes._sum.cambioMonto || 0)), "Cambio pendiente por entregar"]
  ];
  const resumenCatalogo: [LucideIcon, string, string][] = [
    [Users, "Clientes", clientes.toString()],
    [Package, "Productos", productos.toString()]
  ];
  const quickLinks: [LucideIcon, string, string, string][] = [
    [ReceiptText, "Créditos", "Cobros pendientes", "/fiados"],
    [User, "Clientes", "Alta y consulta", "/clientes"]
  ];
  const ventasHoy: [LucideIcon, string, string][] = [
    [Package, "Piezas vendidas", String(piezasHoy._sum.cantidad || 0)],
    [HandCoins, "Cobrado", formatMoney(Number(cobradoHoy._sum.monto || 0))],
    [ReceiptText, "Crédito", formatMoney(Number(creditoHoy._sum.total || 0))]
  ];

  const pagosHoyPorMetodo = pagosHoy.map((item) => ({
    metodo: item.metodo,
    total: Number(item._sum.monto || 0)
  }));
  const totalHoyPorMetodo = pagosHoyPorMetodo.reduce((sum, item) => sum + item.total, 0);
  const efectivo = pagosHoyPorMetodo.find((item) => item.metodo === "EFECTIVO")?.total || 0;
  const efectivoPct = totalHoyPorMetodo > 0 ? Math.round((efectivo / totalHoyPorMetodo) * 100) : 0;

  const percentText = formatPercent;

  return (
    <main className="app-page">
      <header className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-3xl bg-[var(--primary-soft)] shadow-sm">
          {config.logoDataUrl ? (
            <Image alt={config.negocioNombre} className="size-16 object-cover" height={64} src={config.logoDataUrl} unoptimized width={64} />
          ) : (
            <Store aria-label="Sin logo configurado" className="size-8 text-[var(--primary)]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="ui-label">Hola, lista para vender</p>
          <h1 className="truncate text-3xl font-bold text-[var(--brand)]">{config.negocioNombre}</h1>
        </div>
        <form action={logout}>
          <button className="ui-icon-button" aria-label="Salir" title="Salir" type="submit">
            <LogOut aria-hidden="true" className="size-6" />
          </button>
        </form>
      </header>

      <section className="flex items-center gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm" aria-label="Acción principal">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
            <ReceiptText className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="ui-label">Lo más usado</p>
            <h2 className="truncate text-lg font-bold text-[var(--brand)]">Nueva venta rápida</h2>
          </div>
        </div>
        <Link className="ui-button-primary min-h-11 shrink-0 gap-2 rounded-2xl px-4 text-sm" href="/ventas">
          <Plus aria-hidden="true" className="size-4" />
          Crear
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-2" aria-label="Para atender ahora">
        {metrics.map(([Icon, label, value, hint]) => (
          <article className="rounded-[1.75rem] border border-red-100 bg-red-50 p-4 shadow-sm" key={label}>
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
                <Icon className="size-6" />
              </span>
              <div className="min-w-0">
                <p className="ui-label">{label}</p>
                <p className="text-2xl font-bold text-[var(--brand)]">{value}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-[var(--text-muted)]">{hint}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-3 rounded-[1.75rem] bg-white p-3 shadow-sm" aria-label="Resumen de catálogo">
        {resumenCatalogo.map(([Icon, label, value]) => (
          <div className="flex items-center gap-3 rounded-[1.25rem] bg-[var(--app-bg)] p-3" key={label}>
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm text-[var(--text-muted)]">{label}</p>
              <p className="text-lg font-bold text-[var(--brand)]">{value}</p>
            </div>
          </div>
        ))}
      </section>

      <ConfigAccordionItem defaultOpen description="Resumen del día en curso." title="Ventas de hoy">
        <div className="grid gap-3">
          {ventasHoy.map(([Icon, label, value]) => (
            <div className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-[var(--app-bg)] p-4 shadow-sm" key={label}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
                  <Icon className="size-6" />
                </span>
                <p className="font-bold text-[var(--text-main)]">{label}</p>
              </div>
              <p className="shrink-0 text-xl font-bold text-[var(--brand)]">{value}</p>
            </div>
          ))}
        </div>
        <section className="mt-4 grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm">
          <h3 className="inline-flex items-center gap-2 text-lg font-bold text-[var(--brand)]">
            <CreditCard className="size-5 text-[var(--primary)]" />
            Forma de pago
          </h3>
          {totalHoyPorMetodo <= 0 ? (
            <p className="ui-label">Sin pagos hoy.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div
                className="mx-auto grid size-36 place-items-center rounded-full"
                style={{ background: `conic-gradient(var(--primary) 0 ${efectivoPct}%, var(--brand) ${efectivoPct}% 100%)` }}
                aria-label={`Efectivo ${percentText(efectivo, totalHoyPorMetodo)}, transferencia ${percentText(totalHoyPorMetodo - efectivo, totalHoyPorMetodo)}`}
              >
                <div className="grid size-24 place-items-center rounded-full bg-white text-center shadow-sm">
                  <span>
                    <strong className="block text-xl text-[var(--brand)]">{percentText(efectivo, totalHoyPorMetodo)}</strong>
                    <span className="ui-label">Efectivo</span>
                  </span>
                </div>
              </div>
              <div className="grid gap-3">
                {pagosHoyPorMetodo.map((item) => (
                  <div className="flex items-center justify-between gap-3" key={item.metodo}>
                    <span className="flex items-center gap-2 text-sm font-bold text-[var(--text-main)]">
                      <span className={`size-3 rounded-full ${item.metodo === "EFECTIVO" ? "bg-[var(--primary)]" : "bg-[var(--brand)]"}`} />
                      {item.metodo === "EFECTIVO" ? "Efectivo" : "Transferencia"}
                    </span>
                    <span className="text-right text-sm">
                      <strong className="block">{formatMoney(item.total)}</strong>
                      <span className="ui-label">{percentText(item.total, totalHoyPorMetodo)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </ConfigAccordionItem>

      <section className="grid gap-3" aria-label="Accesos rapidos">
        <h2 className="text-xl font-bold text-[var(--brand)]">Atajos</h2>
        {quickLinks.map(([Icon, title, description, href]) => (
          <Link className="flex min-h-20 items-center gap-4 rounded-[1.75rem] bg-white p-4 shadow-sm transition duration-150 active:scale-[0.99]" href={href} key={href}>
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
              <Icon className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-[var(--text-main)]">{title}</span>
              <span className="ui-label block">{description}</span>
            </span>
            <ChevronRight className="size-6 text-[var(--primary)]" aria-hidden="true" />
          </Link>
        ))}
      </section>
    </main>
  );
}
