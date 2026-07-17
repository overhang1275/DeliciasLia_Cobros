import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { Pagination } from "@/components/Pagination";
import { ShareStatementButton } from "@/components/ShareStatementButton";
import { getConfiguracion } from "@/lib/configuracion";
import { db } from "@/lib/db";
import { isValidSessionToken, SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });
const date = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" });
const pageSize = 10;
const ticketId = (id: number) => String(id).padStart(6, "0");

export default async function EstadoPublicoPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ page?: string }> }) {
  const { token } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const [cliente, config] = await Promise.all([
    db.cliente.findUnique({
      where: { estadoToken: token },
      include: {
        ventas: {
          where: { estado: { not: "CANCELADA" } },
          include: { detalles: { include: { producto: true } }, pagos: true },
          orderBy: { fecha: "asc" }
        }
      }
    }),
    getConfiguracion()
  ]);

  if (!cliente) notFound();

  const pagos = await db.pago.findMany({
    where: { venta: { clienteId: cliente.id } },
    include: { venta: { include: { detalles: { include: { producto: true } } } } },
    orderBy: { fecha: "asc" }
  });
  const deudas = cliente.ventas
    .map((venta) => {
      const pagado = venta.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
      return { ...venta, pagado, pendiente: Number(venta.total) - pagado };
    })
    .filter((venta) => venta.pendiente > 0);
  const saldo = deudas.reduce((sum, venta) => sum + venta.pendiente, 0);
  const movimientos = [
    ...cliente.ventas.map((venta) => ({
      id: `venta-${venta.id}`,
      fecha: venta.fecha,
      folio: `Ticket ID ${ticketId(venta.id)}`,
      concepto: venta.detalles[0] ? `${venta.detalles[0].producto.nombre} x ${venta.detalles[0].cantidad}` : venta.observaciones || "Venta",
      detalle: `Cargo - ${venta.estado.toLowerCase()}`,
      monto: Number(venta.total),
      tipo: "cargo"
    })),
    ...pagos.map((pago) => ({
      id: `pago-${pago.id}`,
      fecha: pago.fecha,
      folio: `Ref. pago ID ${ticketId(pago.id)} - ticket ID ${ticketId(pago.ventaId)}`,
      concepto: pago.venta.detalles[0]?.producto.nombre || pago.venta.observaciones || "Pago",
      detalle: `Abono - ${pago.metodo.toLowerCase()}`,
      monto: -Number(pago.monto),
      tipo: "abono"
    }))
  ].sort((a, b) => a.fecha.getTime() - b.fecha.getTime() || a.id.localeCompare(b.id));
  const totalPages = Math.max(1, Math.ceil(movimientos.length / pageSize));
  const pageMovimientos = movimientos.slice((Math.min(page, totalPages) - 1) * pageSize, Math.min(page, totalPages) * pageSize);
  const isAdmin = await isValidSessionToken((await cookies()).get(SESSION_COOKIE)?.value);

  return (
    <main className="app-page">
      <header className="ui-card">
        <div className="flex items-start gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {config.logoDataUrl ? <Image alt={config.negocioNombre} className="size-16 shrink-0 rounded-2xl object-cover" height={64} src={config.logoDataUrl} unoptimized width={64} /> : null}
            <div className="min-w-0">
              <p className="ui-label">{config.negocioNombre}</p>
              <h1 className="break-words text-3xl font-bold text-[var(--brand)]">{cliente.nombre}</h1>
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-2xl bg-[var(--primary-soft)] p-4">
          <p className="text-sm font-bold text-[var(--primary)]">Saldo por cobrar</p>
          <p className="mt-1 text-4xl font-bold text-[var(--brand)]">{money.format(saldo)}</p>
          {cliente.telefono ? <p className="mt-2 text-sm text-[var(--text-muted)]">Telefono: {cliente.telefono}</p> : null}
        </div>
        {isAdmin ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ShareStatementButton cliente={cliente.nombre} telefono={cliente.telefono} />
            <Link className="ui-button-secondary min-h-11 px-4" href="/clientes">
              Volver
            </Link>
          </div>
        ) : null}
      </header>

      <section className="ui-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="ui-label">Datos para deposito</p>
            <h2 className="mt-1 text-2xl font-bold text-[var(--brand)]">{config.banco}</h2>
          </div>
          {config.logoDataUrl ? <Image alt="" className="size-12 rounded-xl object-cover opacity-90" height={48} src={config.logoDataUrl} unoptimized width={48} /> : null}
        </div>
        {[
          ["A nombre de", config.titular],
          ["CLABE", config.clabe],
          ["Cuenta", config.cuenta]
        ].map(([label, value]) => (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] px-4 py-3" key={label}>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-[var(--text-muted)]">{label}</p>
              <p className="break-words text-base font-semibold text-[var(--text-main)]">{value}</p>
            </div>
            <CopyButton value={value} />
          </div>
        ))}
      </section>

      <section className="grid gap-3">
        <div>
          <p className="ui-label">Estado de cuenta</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-[var(--brand)]">Movimientos</h2>
            <div className="flex gap-2 text-xs font-bold">
              <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">Verde: pagos</span>
              <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">Rojo: deuda</span>
            </div>
          </div>
        </div>
        {pageMovimientos.length === 0 ? (
          <p className="ui-card ui-label">Todavia no hay movimientos registrados.</p>
        ) : (
          pageMovimientos.map((movimiento) => (
            <article className="ui-card" key={movimiento.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-bold text-[var(--text-main)]">{movimiento.folio}</p>
                  <p className="text-sm text-[var(--text-main)]">{movimiento.concepto}</p>
                  <p className="ui-label">
                    {date.format(movimiento.fecha)} - {movimiento.detalle}
                  </p>
                </div>
                <p className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${movimiento.tipo === "abono" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {money.format(Math.abs(movimiento.monto))}
                </p>
              </div>
            </article>
          ))
        )}
        <Pagination basePath={`/estado/${token}`} page={Math.min(page, totalPages)} q="" totalPages={totalPages} />
      </section>
    </main>
  );
}
