import Link from "next/link";
import { notFound } from "next/navigation";
import { editarCliente } from "../../actions";
import { ArrowLeft, Pencil, Phone, Save, User } from "@/components/AppIcon";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clienteId = Number(id);
  const cliente = Number.isInteger(clienteId) ? await db.cliente.findUnique({ where: { id: clienteId } }) : null;

  if (!cliente) notFound();

  const guardar = editarCliente.bind(null, cliente.id);

  return (
    <main className="app-page">
      <header className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
          <Pencil className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="ui-label">Clientes</p>
          <h1 className="truncate text-3xl font-bold text-[var(--brand)]">Editar cliente</h1>
        </div>
        <Link className="ui-icon-button" href="/clientes" aria-label="Volver" title="Volver">
          <ArrowLeft aria-hidden="true" className="size-5" />
        </Link>
      </header>

      <form action={guardar} className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm">
        <div>
          <label className="ui-label inline-flex items-center gap-1" htmlFor="nombre">
            Nombre <User aria-hidden="true" className="size-4" />
          </label>
          <input className="ui-input mt-2" defaultValue={cliente.nombre} id="nombre" name="nombre" required minLength={2} />
        </div>

        <div>
          <label className="ui-label inline-flex items-center gap-1" htmlFor="telefono">
            Teléfono <Phone aria-hidden="true" className="size-4" />
          </label>
          <input className="ui-input mt-2" defaultValue={cliente.telefono || ""} id="telefono" name="telefono" inputMode="tel" />
        </div>

        <div>
          <label className="ui-label" htmlFor="notas">
            Notas
          </label>
          <textarea className="ui-input mt-2 min-h-24 py-4" defaultValue={cliente.notas || ""} id="notas" name="notas" />
        </div>

        <button className="ui-button-primary gap-2" type="submit">
          <Save aria-hidden="true" className="size-5" />
          Guardar cambios
        </button>
      </form>
    </main>
  );
}
