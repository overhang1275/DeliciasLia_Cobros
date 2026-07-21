import Link from "next/link";
import Image from "next/image";
import { ConfigAccordionItem } from "./ConfigAccordionItem";
import { cambiarPasswordAdmin, guardarConfiguracion } from "./actions";
import { CreditCard, Hash, Home, ImageIcon, KeyRound, Landmark, Save, Settings, Store, Tags, User } from "@/components/AppIcon";
import { SuccessNotice } from "@/components/SuccessNotice";
import { getConfiguracion } from "@/lib/configuracion";

export const dynamic = "force-dynamic";

const passwordMessages: Record<string, string> = {
  actual: "La contraseña actual no es correcta.",
  match: "La nueva contraseña no coincide.",
  min: "La nueva contraseña debe tener al menos 8 caracteres.",
  ok: "Contraseña actualizada."
};

export default async function ConfiguracionPage({ searchParams }: { searchParams: Promise<{ guardado?: string; password?: string }> }) {
  const [config, params] = await Promise.all([getConfiguracion(), searchParams]);
  const passwordMessage = params.password ? passwordMessages[params.password] : "";

  return (
    <main className="app-page">
      <header className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]" aria-hidden="true">
          <Settings className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="ui-label">Sistema</p>
          <h1 className="truncate text-3xl font-bold text-[var(--brand)]">Configuración</h1>
        </div>
        <Link className="ui-icon-button" href="/" aria-label="Inicio" title="Inicio">
          <Home aria-hidden="true" className="size-5" />
        </Link>
      </header>

      {params.guardado === "configuracion" ? <SuccessNotice>Configuración guardada correctamente.</SuccessNotice> : null}

      <form action={guardarConfiguracion} className="grid gap-4" id="configuracion-form">
        <ConfigAccordionItem defaultOpen description="Logo y nombre que verá la app." title="Identidad del negocio">
          <div className="flex items-center gap-4">
            {config.logoDataUrl ? <Image alt="Logo del negocio" className="size-20 rounded-3xl object-cover" height={80} src={config.logoDataUrl} unoptimized width={80} /> : <span className="grid size-20 place-items-center rounded-3xl bg-[var(--primary-soft)] text-[var(--primary)]"><Store className="size-9" /></span>}
            <div>
              <p className="ui-label">Identidad</p>
              <h3 className="text-xl font-bold text-[var(--brand)]">Tu negocio</h3>
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
        </ConfigAccordionItem>

        <ConfigAccordionItem description="Claro, oscuro o automático según el sistema." title="Apariencia">
          <div>
            <label className="ui-label" htmlFor="tema">
              Tema
            </label>
            <select className="ui-input mt-2" defaultValue={config.tema} id="tema" name="tema">
              <option value="system">Automático del sistema</option>
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>
        </ConfigAccordionItem>

        <ConfigAccordionItem description="Cuenta que se muestra en estados de cuenta." title="Datos para depósito">
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
              Número de cuenta <CreditCard aria-hidden="true" className="size-4" />
            </label>
            <input className="ui-input mt-2" defaultValue={config.cuenta} id="cuenta" name="cuenta" required />
          </div>
        </ConfigAccordionItem>

      </form>

      <form action={cambiarPasswordAdmin} className="grid gap-4">
        <ConfigAccordionItem defaultOpen={Boolean(passwordMessage)} description="Cambia la contraseña del usuario admin." title="Seguridad">
          {passwordMessage ? (
            <p className={`rounded-2xl px-4 py-3 text-sm font-bold ${params.password === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {passwordMessage}
            </p>
          ) : null}

          <div>
            <label className="ui-label inline-flex items-center gap-1" htmlFor="passwordActual">
              Contraseña actual <KeyRound aria-hidden="true" className="size-4" />
            </label>
            <input autoComplete="current-password" className="ui-input mt-2" id="passwordActual" name="passwordActual" required type="password" />
          </div>

          <div>
            <label className="ui-label inline-flex items-center gap-1" htmlFor="passwordNueva">
              Nueva contraseña <KeyRound aria-hidden="true" className="size-4" />
            </label>
            <input autoComplete="new-password" className="ui-input mt-2" id="passwordNueva" minLength={8} name="passwordNueva" required type="password" />
          </div>

          <div>
            <label className="ui-label inline-flex items-center gap-1" htmlFor="passwordConfirmar">
              Confirmar contraseña <KeyRound aria-hidden="true" className="size-4" />
            </label>
            <input autoComplete="new-password" className="ui-input mt-2" id="passwordConfirmar" minLength={8} name="passwordConfirmar" required type="password" />
          </div>

          <button className="ui-button-primary gap-2" type="submit">
            <Save aria-hidden="true" className="size-5" />
            Cambiar contraseña
          </button>
        </ConfigAccordionItem>
      </form>

      <button className="ui-button-primary gap-2" form="configuracion-form" type="submit">
        <Save aria-hidden="true" className="size-5" />
        Guardar configuración
      </button>
    </main>
  );
}
