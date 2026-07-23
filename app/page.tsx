import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { logout } from "@/app/login/actions";
import { ConfigAccordionItem } from "@/app/configuracion/ConfigAccordionItem";
import { ChevronRight, HandCoins, LogOut, Package, Plus, ReceiptText, Store, User, Users, Wallet } from "@/components/AppIcon";
import { getConfiguracion } from "@/lib/configuracion";
import { db } from "@/lib/db";
import { todayRange } from "@/lib/timezone";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });

export default async function HomePage() {
  const rangoHoy = todayRange();
  const [config, clientes, productos, ventasFiadas, cambiosPendientes, piezasHoy, cobradoHoy, creditoHoy] = await Promise.all([
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
    })
  ]);

  const porCobrar = ventasFiadas.reduce((total, venta) => {
    const pagado = venta.pagos.reduce((suma, pago) => suma + Number(pago.monto), 0);
    return total + Math.max(0, Number(venta.total) - pagado);
  }, 0);

  const metrics: [LucideIcon, string, string, string][] = [
    [HandCoins, "Crédito por cobrar", money.format(porCobrar), "Dinero pendiente por cobrar"],
    [Wallet, "Cambios que debo", money.format(Number(cambiosPendientes._sum.cambioMonto || 0)), "Cambio pendiente por entregar"]
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
    [HandCoins, "Cobrado", money.format(Number(cobradoHoy._sum.monto || 0))],
    [ReceiptText, "Crédito", money.format(Number(creditoHoy._sum.total || 0))]
  ];

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
