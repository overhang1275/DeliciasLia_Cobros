import Link from "next/link";
import { EstadoVenta } from "@prisma/client";
import { registrarFiado } from "./actions";
import { LiquidarDeudaForm } from "@/components/LiquidarDeudaForm";
import { Pagination } from "@/components/Pagination";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
const pageSize = 6;

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });
const today = new Date().toISOString().slice(0, 10);

export default async function FiadosPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const page = Math.max(1, Number(params.page) || 1);
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
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="ui-label">Fiados</p>
          <h1 className="text-4xl font-bold text-[var(--brand)]">Registrar deuda</h1>
        </div>
        <Link className="ui-button-secondary min-h-11 px-4" href="/">
          Inicio
        </Link>
      </header>

      <form action={registrarFiado} className="ui-card grid gap-4">
        <div>
          <label className="ui-label" htmlFor="clienteId">
            Cliente
          </label>
          <select className="ui-input mt-2" id="clienteId" name="clienteId" required>
            <option value="">Selecciona cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="ui-label" htmlFor="productoId">
            Tipo de postre
          </label>
          <select className="ui-input mt-2" id="productoId" name="productoId" required>
            <option value="">Selecciona postre</option>
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
          <input className="ui-input mt-2" id="piezas" inputMode="numeric" min="1" name="piezas" placeholder="1" required type="number" />
        </div>

        <div>
          <label className="ui-label" htmlFor="fecha">
            Fecha de venta
          </label>
          <input className="ui-input mt-2" defaultValue={today} id="fecha" name="fecha" required type="date" />
        </div>

        <button className="ui-button-primary" type="submit">
          Guardar fiado
        </button>
      </form>

      <section className="grid gap-3" aria-label="Fiados pendientes">
        <h2 className="text-xl font-bold text-[var(--brand)]">Pendientes</h2>
        <form className="ui-card flex gap-3" action="/fiados">
          <input className="ui-input" defaultValue={q} name="q" placeholder="Buscar fiado" />
          <button className="ui-button-secondary px-4" type="submit">
            Filtrar
          </button>
        </form>
        {pendientes.length === 0 ? (
          <p className="ui-card ui-label">Todavia no hay fiados registrados.</p>
        ) : (
          pendientes.map((venta) => (
            <article className="ui-card" key={venta.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[var(--text-main)]">{venta.cliente.nombre}</h3>
                  <p className="ui-label">
                    {venta.detalles[0]
                      ? `${venta.detalles[0].producto.nombre} x ${venta.detalles[0].cantidad}`
                      : venta.observaciones || "Fiado"}
                  </p>
                </div>
                <p className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-bold text-[var(--primary)]">
                  {money.format(venta.pendiente)}
                </p>
              </div>
              <div className="mt-5 grid gap-2 lg:grid-cols-[auto_1fr]">
                <div className="grid gap-2 sm:grid-cols-2 lg:flex">
                  <Link className="ui-button-secondary min-h-10 px-4 text-sm" href={`/fiados/${venta.id}/pago`}>
                    Registrar pago
                  </Link>
                  <Link
                    className="ui-button-secondary min-h-10 px-4 text-sm"
                    href={venta.cliente.estadoToken ? `/estado/${venta.cliente.estadoToken}` : `/clientes/${venta.clienteId}/estado`}
                  >
                    Estado de cuenta
                  </Link>
                </div>
                <div className="lg:justify-self-end">
                  <LiquidarDeudaForm clienteId={venta.clienteId} total={money.format(totalPorCliente.get(venta.clienteId) || venta.pendiente)} />
                </div>
              </div>
            </article>
          ))
        )}
        <Pagination basePath="/fiados" page={page} q={q} totalPages={totalPages} />
      </section>
    </main>
  );
}
