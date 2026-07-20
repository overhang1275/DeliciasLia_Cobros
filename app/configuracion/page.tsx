import Link from "next/link";
import Image from "next/image";
import { guardarConfiguracion } from "./actions";
import { getConfiguracion } from "@/lib/configuracion";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const config = await getConfiguracion();

  return (
    <main className="app-page">
      <header className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-3xl" aria-hidden="true">⚙️</span>
        <div className="min-w-0 flex-1">
          <p className="ui-label">Sistema</p>
          <h1 className="truncate text-3xl font-bold text-[var(--brand)]">Configuracion</h1>
        </div>
        <Link className="grid size-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-xl text-[var(--primary)]" href="/" aria-label="Inicio" title="Inicio">
          <span aria-hidden="true">🏠</span>
        </Link>
      </header>

      <form action={guardarConfiguracion} className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {config.logoDataUrl ? <Image alt="Logo del negocio" className="size-20 rounded-3xl object-cover" height={80} src={config.logoDataUrl} unoptimized width={80} /> : <span className="grid size-20 place-items-center rounded-3xl bg-[var(--primary-soft)] text-4xl">🏪</span>}
          <div>
            <p className="ui-label">Identidad</p>
            <h2 className="text-xl font-bold text-[var(--brand)]">Tu negocio</h2>
          </div>
        </div>

        <div>
          <label className="ui-label" htmlFor="logo">
            Logo 🖼️
          </label>
          <input className="ui-input mt-2 py-4" id="logo" name="logo" type="file" accept="image/*" />
        </div>

        <div>
          <label className="ui-label" htmlFor="negocioNombre">
            Nombre del negocio 🏷️
          </label>
          <input className="ui-input mt-2" defaultValue={config.negocioNombre} id="negocioNombre" name="negocioNombre" required />
        </div>

        <div>
          <label className="ui-label" htmlFor="banco">
            Banco 🏦
          </label>
          <input className="ui-input mt-2" defaultValue={config.banco} id="banco" name="banco" required />
        </div>

        <div>
          <label className="ui-label" htmlFor="titular">
            A nombre de 👤
          </label>
          <input className="ui-input mt-2" defaultValue={config.titular} id="titular" name="titular" required />
        </div>

        <div>
          <label className="ui-label" htmlFor="clabe">
            CLABE 🔢
          </label>
          <input className="ui-input mt-2" defaultValue={config.clabe} id="clabe" name="clabe" required />
        </div>

        <div>
          <label className="ui-label" htmlFor="cuenta">
            Numero de cuenta 💳
          </label>
          <input className="ui-input mt-2" defaultValue={config.cuenta} id="cuenta" name="cuenta" required />
        </div>

        <button className="ui-button-primary gap-2" type="submit">
          <span aria-hidden="true">✓</span>
          Guardar
        </button>
      </form>
    </main>
  );
}
