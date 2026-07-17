import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });

export default async function HomePage() {
  const [clientes, productos, ventasFiadas] = await Promise.all([
    db.cliente.count({ where: { activo: true } }),
    db.producto.count({ where: { activo: true } }),
    db.venta.findMany({
      where: { estado: { in: ["FIADA", "PARCIAL"] } },
      include: { pagos: true }
    })
  ]);

  const porCobrar = ventasFiadas.reduce((total, venta) => {
    const pagado = venta.pagos.reduce((suma, pago) => suma + Number(pago.monto), 0);
    return total + Math.max(0, Number(venta.total) - pagado);
  }, 0);

  const metrics = [
    ["Ventas hoy", money.format(0)],
    ["Cobrado", money.format(0)],
    ["Clientes", clientes.toString()],
    ["Productos", productos.toString()],
    ["Fiados por cobrar", money.format(porCobrar)]
  ];

  return (
    <main className="app-page">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="ui-label">Administracion local</p>
          <h1 className="text-4xl font-bold text-[var(--brand)]">Delicias Lia</h1>
        </div>
        <div className="grid size-14 place-items-center rounded-2xl bg-white text-2xl shadow-sm">DL</div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-6" aria-label="Resumen del dia">
        {metrics.map(([label, value], index) => (
          <div key={label} className={`ui-card ${index === 4 ? "col-span-2 md:col-span-2" : "md:col-span-1"}`}>
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
