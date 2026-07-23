import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList, Landmark, Store, Wallet } from "@/components/AppIcon";
import { CopyButton } from "@/components/CopyButton";
import { EstadoMovimientosAccordion } from "@/components/EstadoMovimientosAccordion";
import { Pagination } from "@/components/Pagination";
import { PrintButton } from "@/components/PrintButton";
import { ShareStatementButton } from "@/components/ShareStatementButton";
import { getConfiguracion } from "@/lib/configuracion";
import { db } from "@/lib/db";
import { isValidSessionToken, SESSION_COOKIE } from "@/lib/session";
import { appDateFormatter, dateInputValue } from "@/lib/timezone";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });
const date = appDateFormatter({ dateStyle: "medium" });
const time = appDateFormatter({ hour: "2-digit", minute: "2-digit" });
const generatedAt = appDateFormatter({ dateStyle: "medium", timeStyle: "short" });
const pageSize = 5;
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
      tipo: "cargo" as const
    })),
    ...pagos.map((pago) => ({
      id: `pago-${pago.id}`,
      fecha: pago.fecha,
      folio: `Ref. pago ID ${ticketId(pago.id)} - ticket ID ${ticketId(pago.ventaId)}`,
      concepto: pago.venta.detalles[0]?.producto.nombre || pago.venta.observaciones || "Pago",
      detalle: `Abono - ${pago.metodo.toLowerCase()}`,
      monto: -Number(pago.monto),
      tipo: "abono" as const
    }))
  ].sort((a, b) => a.fecha.getTime() - b.fecha.getTime() || a.id.localeCompare(b.id));
  const gruposMap = new Map<
    string,
    {
      cargos: number;
      fecha: string;
      key: string;
      movimientos: { concepto: string; detalle: string; folio: string; hora: string; id: string; importe: string; tipo: "abono" | "cargo" }[];
      pagos: number;
    }
  >();

  for (const movimiento of movimientos) {
    const key = dateInputValue(movimiento.fecha);
    const grupo = gruposMap.get(key) || { cargos: 0, fecha: date.format(movimiento.fecha), key, movimientos: [], pagos: 0 };
    grupo.cargos += movimiento.tipo === "cargo" ? movimiento.monto : 0;
    grupo.pagos += movimiento.tipo === "abono" ? Math.abs(movimiento.monto) : 0;
    grupo.movimientos.push({
      concepto: movimiento.concepto,
      detalle: movimiento.detalle,
      folio: movimiento.folio,
      hora: time.format(movimiento.fecha),
      id: movimiento.id,
      importe: money.format(Math.abs(movimiento.monto)),
      tipo: movimiento.tipo
    });
    gruposMap.set(key, grupo);
  }

  const gruposMovimientos = Array.from(gruposMap.values())
    .sort((a, b) => b.key.localeCompare(a.key))
    .map((grupo) => ({
      ...grupo,
      cargos: money.format(grupo.cargos),
      pagos: money.format(grupo.pagos),
      saldo: money.format(grupo.cargos - grupo.pagos)
    }));
  const totalPages = Math.max(1, Math.ceil(gruposMovimientos.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageGruposMovimientos = gruposMovimientos.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const isAdmin = await isValidSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  const fechaGenerado = generatedAt.format(new Date());

  return (
    <main className="app-page">
      <header className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {config.logoDataUrl ? (
              <Image alt={config.negocioNombre} className="size-16 shrink-0 rounded-3xl object-cover" height={64} src={config.logoDataUrl} unoptimized width={64} />
            ) : (
              <span className="grid size-16 shrink-0 place-items-center rounded-3xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
                <Store className="size-8" />
              </span>
            )}
            <div className="min-w-0">
              <p className="ui-label">Estado de cuenta</p>
              <h1 className="break-words text-3xl font-bold text-[var(--brand)]">{cliente.nombre}</h1>
              <p className="ui-label mt-1">{config.negocioNombre}</p>
              <p className="ui-label mt-1">Generado el {fechaGenerado}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 rounded-[1.75rem] bg-[var(--app-bg)] p-4">
          <div className="min-w-0">
            <p className="ui-label">Crédito por cobrar</p>
            <p className="mt-1 text-4xl font-bold text-[var(--brand)]">{money.format(saldo)}</p>
            {cliente.telefono ? <p className="mt-2 text-sm text-[var(--text-muted)]">Teléfono: {cliente.telefono}</p> : null}
          </div>
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
            <Wallet className="size-6" />
          </span>
        </div>
        {isAdmin ? (
          <div className="mt-4 flex flex-wrap gap-2 no-print">
            <ShareStatementButton cliente={cliente.nombre} telefono={cliente.telefono} />
            <PrintButton />
            <Link className="ui-button-compact" href="/clientes">
              Volver
            </Link>
          </div>
        ) : null}
      </header>

      <section className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
            <Landmark className="size-6" />
          </span>
          <div>
            <p className="ui-label">Datos para depósito</p>
            <h2 className="mt-1 text-2xl font-semibold text-[var(--brand)]">{config.banco}</h2>
          </div>
        </div>
        {[
          ["A nombre de", config.titular],
          ["CLABE", config.clabe],
          ["Cuenta", config.cuenta]
        ].map(([label, value]) => (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[var(--app-bg)] px-4 py-3" key={label}>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[var(--brand)]">{label}</p>
              <p className="break-words text-base text-[var(--text-main)]">{value}</p>
            </div>
            <span className="no-print">
              <CopyButton value={value} />
            </span>
          </div>
        ))}
      </section>

      <section className="grid gap-3">
        <div>
          <p className="ui-label">Estado de cuenta</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-2xl font-bold text-[var(--brand)]">
              <ClipboardList aria-hidden="true" className="size-6 text-[var(--primary)]" />
              Movimientos
            </h2>
            <div className="flex gap-3 text-xs font-bold">
              <span className="text-green-700">Verde: pagos</span>
              <span className="text-red-700">Rojo: crédito</span>
            </div>
          </div>
        </div>
        {gruposMovimientos.length === 0 ? (
          <p className="rounded-[1.75rem] bg-white p-4 text-[var(--text-muted)] shadow-sm">Todavía no hay movimientos registrados.</p>
        ) : (
          <>
            <EstadoMovimientosAccordion grupos={pageGruposMovimientos} />
            <div className="no-print">
              <Pagination basePath={`/estado/${token}`} page={currentPage} q="" totalPages={totalPages} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
