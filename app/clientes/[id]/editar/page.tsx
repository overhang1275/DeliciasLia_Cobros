import Link from "next/link";
import { notFound } from "next/navigation";
import { editarCliente } from "../../actions";
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
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="ui-label">Clientes</p>
          <h1 className="text-4xl font-bold text-[var(--brand)]">Editar cliente</h1>
        </div>
        <Link className="ui-button-secondary min-h-11 px-4" href="/clientes">
          Volver
        </Link>
      </header>

      <form action={guardar} className="ui-card grid gap-4">
        <div>
          <label className="ui-label" htmlFor="nombre">
            Nombre
          </label>
          <input className="ui-input mt-2" defaultValue={cliente.nombre} id="nombre" name="nombre" required minLength={2} />
        </div>

        <div>
          <label className="ui-label" htmlFor="telefono">
            Telefono
          </label>
          <input className="ui-input mt-2" defaultValue={cliente.telefono || ""} id="telefono" name="telefono" inputMode="tel" />
        </div>

        <div>
          <label className="ui-label" htmlFor="notas">
            Notas
          </label>
          <textarea className="ui-input mt-2 min-h-24 py-4" defaultValue={cliente.notas || ""} id="notas" name="notas" />
        </div>

        <button className="ui-button-primary" type="submit">
          Guardar cambios
        </button>
      </form>
    </main>
  );
}
