import Link from "next/link";
import { guardarConfiguracion } from "./actions";
import { getConfiguracion } from "@/lib/configuracion";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const config = await getConfiguracion();

  return (
    <main className="app-page">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="ui-label">Sistema</p>
          <h1 className="text-4xl font-bold text-[var(--brand)]">Configuracion</h1>
        </div>
        <Link className="ui-button-secondary min-h-11 px-4" href="/">
          Inicio
        </Link>
      </header>

      <form action={guardarConfiguracion} className="ui-card grid gap-4">
        {config.logoDataUrl ? <img alt="Logo del negocio" className="size-24 rounded-2xl object-cover" src={config.logoDataUrl} /> : null}

        <div>
          <label className="ui-label" htmlFor="logo">
            Logo
          </label>
          <input className="ui-input mt-2 py-4" id="logo" name="logo" type="file" accept="image/*" />
        </div>

        <div>
          <label className="ui-label" htmlFor="negocioNombre">
            Nombre del negocio
          </label>
          <input className="ui-input mt-2" defaultValue={config.negocioNombre} id="negocioNombre" name="negocioNombre" required />
        </div>

        <div>
          <label className="ui-label" htmlFor="banco">
            Banco
          </label>
          <input className="ui-input mt-2" defaultValue={config.banco} id="banco" name="banco" required />
        </div>

        <div>
          <label className="ui-label" htmlFor="titular">
            A nombre de
          </label>
          <input className="ui-input mt-2" defaultValue={config.titular} id="titular" name="titular" required />
        </div>

        <div>
          <label className="ui-label" htmlFor="clabe">
            CLABE
          </label>
          <input className="ui-input mt-2" defaultValue={config.clabe} id="clabe" name="clabe" required />
        </div>

        <div>
          <label className="ui-label" htmlFor="cuenta">
            Numero de cuenta
          </label>
          <input className="ui-input mt-2" defaultValue={config.cuenta} id="cuenta" name="cuenta" required />
        </div>

        <button className="ui-button-primary" type="submit">
          Guardar configuracion
        </button>
      </form>
    </main>
  );
}
