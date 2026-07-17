import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { ShareStatementButton } from "@/components/ShareStatementButton";
import { getConfiguracion } from "@/lib/configuracion";
import { db } from "@/lib/db";
import { isValidSessionToken, SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-MX", { currency: "MXN", style: "currency" });
const date = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" });

export default async function EstadoPublicoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [cliente, config] = await Promise.all([
    db.cliente.findUnique({
      where: { estadoToken: token },
      include: {
        ventas: {
          where: { estado: { in: ["FIADA", "PARCIAL"] } },
          include: { detalles: { include: { producto: true } }, pagos: true },
          orderBy: { fecha: "desc" }
        }
      }
    }),
    getConfiguracion()
  ]);

  if (!cliente) notFound();

  const deudas = cliente.ventas
    .map((venta) => {
      const pagado = venta.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
      return { ...venta, pagado, pendiente: Number(venta.total) - pagado };
    })
    .filter((venta) => venta.pendiente > 0);
  const saldo = deudas.reduce((sum, venta) => sum + venta.pendiente, 0);
  const isAdmin = await isValidSessionToken((await cookies()).get(SESSION_COOKIE)?.value);

  return (
    <main className="app-page">
      <header className="ui-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {config.logoDataUrl ? <img alt={config.negocioNombre} className="size-16 shrink-0 rounded-2xl object-cover" src={config.logoDataUrl} /> : null}
            <div className="min-w-0">
              <p className="ui-label">{config.negocioNombre}</p>
              <h1 className="break-words text-3xl font-bold text-[var(--brand)]">{cliente.nombre}</h1>
            </div>
          </div>
          {isAdmin ? (
            <div className="flex shrink-0 flex-col gap-2">
              <ShareStatementButton cliente={cliente.nombre} />
              <Link className="ui-button-secondary min-h-11 px-4" href="/clientes">
                Volver
              </Link>
            </div>
          ) : null}
        </div>
        <div className="mt-5 rounded-2xl bg-[var(--primary-soft)] p-4">
          <p className="text-sm font-bold text-[var(--primary)]">Saldo por cobrar</p>
          <p className="mt-1 text-4xl font-bold text-[var(--brand)]">{money.format(saldo)}</p>
          {cliente.telefono ? <p className="mt-2 text-sm text-[var(--text-muted)]">Telefono: {cliente.telefono}</p> : null}
        </div>
      </header>

      <section className="ui-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="ui-label">Datos para deposito</p>
            <h2 className="mt-1 text-2xl font-bold text-[var(--brand)]">{config.banco}</h2>
          </div>
          {config.logoDataUrl ? <img alt="" className="size-12 rounded-xl object-cover opacity-90" src={config.logoDataUrl} /> : null}
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
          <h2 className="text-2xl font-bold text-[var(--brand)]">Deudas pendientes</h2>
        </div>
        {deudas.length === 0 ? (
          <p className="ui-card ui-label">Este cliente no tiene saldo pendiente.</p>
        ) : (
          deudas.map((venta) => {
            const detalle = venta.detalles[0];
            return (
              <article className="ui-card" key={venta.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-[var(--text-main)]">{detalle ? `${detalle.producto.nombre} x ${detalle.cantidad}` : venta.observaciones || "Fiado"}</p>
                    <p className="ui-label">{date.format(venta.fecha)} - pagado {money.format(venta.pagado)}</p>
                  </div>
                  <p className="shrink-0 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-bold text-[var(--primary)]">
                    {money.format(venta.pendiente)}
                  </p>
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
