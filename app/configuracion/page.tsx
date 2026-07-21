import Link from "next/link";
import Image from "next/image";
import { guardarConfiguracion } from "./actions";
import { CreditCard, Hash, Home, ImageIcon, Landmark, Save, Settings, Store, Tags, User } from "@/components/AppIcon";
import { getConfiguracion } from "@/lib/configuracion";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const config = await getConfiguracion();

  return (
    <main className="app-page">
      <header className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
          <Settings className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="ui-label">Sistema</p>
          <h1 className="truncate text-3xl font-bold text-[var(--brand)]">Configuracion</h1>
        </div>
        <Link className="grid size-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-xl text-[var(--primary)]" href="/" aria-label="Inicio" title="Inicio">
          <Home aria-hidden="true" className="size-5" />
        </Link>
      </header>

      <form action={guardarConfiguracion} className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {config.logoDataUrl ? <Image alt="Logo del negocio" className="size-20 rounded-3xl object-cover" height={80} src={config.logoDataUrl} unoptimized width={80} /> : <span className="grid size-20 place-items-center rounded-3xl bg-[var(--primary-soft)] text-[var(--primary)]"><Store className="size-9" /></span>}
          <div>
            <p className="ui-label">Identidad</p>
            <h2 className="text-xl font-bold text-[var(--brand)]">Tu negocio</h2>
          </div>
        </div>

        <div>
          <label className="ui-label inline-flex items-center gap-1" htmlFor="logo">
            Logo <ImageIcon aria-hidden="true" className="size-4" />
          </label>
          <input className="ui-input mt-2 py-4" id="logo" name="logo" type="file" accept="image/*" />
        </div>

        <div>
          <label className="ui-label inline-flex items-center gap-1" htmlFor="negocioNombre">
            Nombre del negocio <Tags aria-hidden="true" className="size-4" />
          </label>
          <input className="ui-input mt-2" defaultValue={config.negocioNombre} id="negocioNombre" name="negocioNombre" required />
        </div>

        <div>
          <label className="ui-label" htmlFor="tema">
            Apariencia
          </label>
          <select className="ui-input mt-2" defaultValue={config.tema} id="tema" name="tema">
            <option value="system">Default del sistema</option>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </div>

        <div>
          <label className="ui-label inline-flex items-center gap-1" htmlFor="banco">
            Banco <Landmark aria-hidden="true" className="size-4" />
          </label>
          <input className="ui-input mt-2" defaultValue={config.banco} id="banco" name="banco" required />
        </div>

        <div>
          <label className="ui-label inline-flex items-center gap-1" htmlFor="titular">
            A nombre de <User aria-hidden="true" className="size-4" />
          </label>
          <input className="ui-input mt-2" defaultValue={config.titular} id="titular" name="titular" required />
        </div>

        <div>
          <label className="ui-label inline-flex items-center gap-1" htmlFor="clabe">
            CLABE <Hash aria-hidden="true" className="size-4" />
          </label>
          <input className="ui-input mt-2" defaultValue={config.clabe} id="clabe" name="clabe" required />
        </div>

        <div>
          <label className="ui-label inline-flex items-center gap-1" htmlFor="cuenta">
            Numero de cuenta <CreditCard aria-hidden="true" className="size-4" />
          </label>
          <input className="ui-input mt-2" defaultValue={config.cuenta} id="cuenta" name="cuenta" required />
        </div>

        <button className="ui-button-primary gap-2" type="submit">
          <Save aria-hidden="true" className="size-5" />
          Guardar
        </button>
      </form>
    </main>
  );
}
