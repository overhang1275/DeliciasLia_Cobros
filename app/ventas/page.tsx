import Link from "next/link";
import { crearVenta } from "./actions";
import { CambioPendienteFields } from "./CambioPendienteFields";
import { DarCambioButton } from "./DarCambioButton";
import { Home, Package, ReceiptText, Save, ShoppingBag } from "@/components/AppIcon";
import { ClienteSearchField } from "@/components/ClienteSearchField";
import { SuccessNotice } from "@/components/SuccessNotice";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });

export default async function VentasPage({ searchParams }: { searchParams: Promise<{ clienteId?: string; guardado?: string; productoId?: string; piezas?: string }> }) {
  const params = await searchParams;
  const defaultClienteId = Number(params.clienteId) || undefined;
  const defaultProductoId = Number(params.productoId) || undefined;
  const defaultPiezas = Math.max(1, Number(params.piezas) || 1);
  const [clientes, productos, ventas] = await Promise.all([
    db.cliente.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    db.producto.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    db.venta.findMany({
      include: { cliente: true, detalles: { include: { producto: true } } },
      orderBy: { fecha: "desc" },
      take: 8
    })
  ]);
  const productosOptions = productos.map((producto) => ({
    id: producto.id,
    label: `${producto.nombre} - ${money.format(Number(producto.precioVenta))}`,
    precioVenta: Number(producto.precioVenta)
  }));

  return (
    <main className="app-page">
      <header className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
          <ReceiptText className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="ui-label">Venta rápida</p>
          <h1 className="truncate text-3xl font-bold text-[var(--brand)]">Nueva venta</h1>
        </div>
        <Link className="ui-icon-button" href="/" aria-label="Inicio" title="Inicio">
          <Home aria-hidden="true" className="size-5" />
        </Link>
      </header>

      {params.guardado === "venta" ? <SuccessNotice>Venta guardada correctamente.</SuccessNotice> : null}
      {params.guardado === "cambio" ? <SuccessNotice>Cambio marcado como entregado.</SuccessNotice> : null}

      <form action={crearVenta} className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm">
        <div>
          <p className="ui-label">Datos de la venta</p>
          <h2 className="text-xl font-bold text-[var(--brand)]">¿Qué se vendió?</h2>
        </div>

        <ClienteSearchField clientes={clientes} defaultClienteId={defaultClienteId} />

        <CambioPendienteFields productos={productosOptions} defaultProductoId={defaultProductoId} defaultPiezas={defaultPiezas} />

        <button className="ui-button-primary gap-2" type="submit">
          <Save aria-hidden="true" className="size-5" />
          Guardar
        </button>
      </form>

      <section className="grid gap-3" aria-label="Últimas ventas">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--brand)]">Últimas ventas</h2>
          <ShoppingBag className="size-6 text-[var(--primary)]" aria-hidden="true" />
        </div>
        {ventas.length === 0 ? (
          <p className="rounded-[1.75rem] bg-white p-4 text-[var(--text-muted)] shadow-sm">Todavía no hay ventas registradas.</p>
        ) : (
          ventas.map((venta) => (
            <article className="rounded-[1.75rem] bg-white p-4 shadow-sm" key={venta.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
                    <Package className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[var(--text-main)]">{venta.cliente.nombre}</h3>
                    <p className="ui-label">
                      {venta.detalles[0]
                        ? `${venta.detalles[0].producto.nombre} x ${venta.detalles[0].cantidad}`
                        : venta.observaciones || "Venta"}
                    </p>
                  </div>
                </div>
                <p className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-bold text-[var(--primary)]">
                  {money.format(Number(venta.total))}
                </p>
              </div>
              {venta.cambioPendiente && Number(venta.cambioMonto) > 0 ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                  <span>Cambio pendiente: {money.format(Number(venta.cambioMonto))}</span>
                  <DarCambioButton ventaId={venta.id} total={money.format(Number(venta.cambioMonto))} />
                </div>
              ) : null}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
