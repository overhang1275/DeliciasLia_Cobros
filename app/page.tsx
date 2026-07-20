import Link from "next/link";
import Image from "next/image";
import { logout } from "@/app/login/actions";
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

  const metrics = [
    ["Clientes", clientes.toString()],
    ["Productos", productos.toString()],
    ["Fiados por cobrar", money.format(porCobrar)],
    ["Cambios que debo", money.format(Number(cambiosPendientes._sum.cambioMonto || 0))]
  ];

  return (
    <main className="app-page">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="ui-label">Administracion local</p>
          <h1 className="text-4xl font-bold text-[var(--brand)]">{config.negocioNombre}</h1>
        </div>
        <div className="grid justify-items-end gap-2">
          {config.logoDataUrl ? (
            <Image alt={config.negocioNombre} className="size-14 rounded-2xl object-cover shadow-sm" height={56} src={config.logoDataUrl} unoptimized width={56} />
          ) : (
            <div aria-label="Sin logo configurado" className="grid size-14 place-items-center rounded-2xl bg-white text-[var(--text-muted)] shadow-sm">
              <svg aria-hidden="true" className="size-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
              </svg>
            </div>
          )}
          <form action={logout}>
            <button className="text-sm font-bold text-[var(--primary)]" type="submit">
              Salir
            </button>
          </form>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Resumen del dia">
        {metrics.map(([label, value]) => (
          <div key={label} className="ui-card">
            <p className="ui-label">{label}</p>
            <p className="mt-2 text-2xl font-bold text-[var(--brand)]">{value}</p>
          </div>
        ))}
      </section>

      <section className="ui-card grid gap-4" aria-label="Acciones rapidas">
        <div>
          <p className="ui-label">Acciones rapidas</p>
          <h2 className="text-2xl font-bold text-[var(--brand)]">Que vamos a registrar?</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link className="ui-button-primary justify-start" href="/ventas">
            Nueva venta
          </Link>
          <Link className="ui-button-secondary justify-start" href="/productos">
            Productos
          </Link>
          <Link className="ui-button-secondary justify-start" href="/clientes">
            Clientes
          </Link>
          <Link className="ui-button-secondary justify-start" href="/fiados">
            Fiados
          </Link>
          <Link className="ui-button-secondary justify-start" href="/reportes">
            Reportes
          </Link>
          <Link className="ui-button-secondary justify-start" href="/configuracion">
            Configuracion
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2" aria-label="Estado del negocio">
        <article className="ui-card">
          <p className="ui-label">Catalogo</p>
          <p className="mt-2 text-lg font-bold text-[var(--text-main)]">{productos} productos para vender</p>
        </article>
        <article className="ui-card">
          <p className="ui-label">Clientes</p>
          <p className="mt-2 text-lg font-bold text-[var(--text-main)]">{clientes} clientes activos</p>
        </article>
      </section>
    </main>
  );
}
