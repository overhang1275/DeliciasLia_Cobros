import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { logout } from "@/app/login/actions";
import { Check, ChevronRight, HandCoins, LogOut, Package, Plus, ReceiptText, Store, User, Users, Wallet } from "@/components/AppIcon";
import { getConfiguracion } from "@/lib/configuracion";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });

export default async function HomePage() {
  const [config, clientes, productos, ventasFiadas, cambiosPendientes] = await Promise.all([
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
    })
  ]);

  const porCobrar = ventasFiadas.reduce((total, venta) => {
    const pagado = venta.pagos.reduce((suma, pago) => suma + Number(pago.monto), 0);
    return total + Math.max(0, Number(venta.total) - pagado);
  }, 0);

  const metrics: [LucideIcon, string, string, string][] = [
    [HandCoins, "Crédito por cobrar", money.format(porCobrar), "Dinero pendiente por cobrar"],
    [Wallet, "Cambios que debo", money.format(Number(cambiosPendientes._sum.cambioMonto || 0)), "Cambio pendiente por entregar"],
    [Users, "Clientes activos", clientes.toString(), "Personas registradas"],
    [Package, "Productos", productos.toString(), "Articulos en catalogo"]
  ];
  const quickLinks: [LucideIcon, string, string, string][] = [
    [ReceiptText, "Créditos", "Cobros pendientes", "/fiados"],
    [User, "Clientes", "Alta y consulta", "/clientes"]
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
          <button className="grid size-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-xl text-[var(--primary)]" aria-label="Salir" title="Salir" type="submit">
            <LogOut aria-hidden="true" className="size-6" />
          </button>
        </form>
      </header>

      <section className="flex items-center gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm" aria-label="Accion principal">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
            <ReceiptText className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="ui-label">Lo mas usado</p>
            <h2 className="truncate text-lg font-bold text-[var(--brand)]">Nueva venta rapida</h2>
          </div>
        </div>
        <Link className="ui-button-primary min-h-11 shrink-0 gap-2 rounded-2xl px-4 text-sm" href="/ventas">
          <Plus aria-hidden="true" className="size-4" />
          Crear
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-2" aria-label="Para atender ahora">
        {metrics.map(([Icon, label, value, hint], index) => (
          <article className={index < 2 ? "rounded-[1.75rem] border border-red-100 bg-red-50/60 p-4 shadow-sm" : "rounded-[1.75rem] bg-white p-4 shadow-sm"} key={label}>
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
