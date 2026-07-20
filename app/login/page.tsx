import Image from "next/image";
import { login } from "./actions";
import { getConfiguracion } from "@/lib/configuracion";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  const config = await getConfiguracion();

  return (
    <main className="app-page justify-center">
      <form action={login} className="grid gap-5 rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-[1.75rem] bg-[var(--primary-soft)] shadow-sm">
            {config.logoDataUrl ? (
              <Image alt={config.negocioNombre} className="size-20 object-cover" height={80} src={config.logoDataUrl} unoptimized width={80} />
            ) : (
              <span className="text-4xl" aria-hidden="true">
                🏪
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="ui-label">Acceso administrador</p>
            <h1 className="truncate text-3xl font-bold text-[var(--brand)]">{config.negocioNombre}</h1>
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-[var(--app-bg)] p-4">
          <p className="text-lg font-bold text-[var(--text-main)]">Bienvenido</p>
          <p className="ui-label mt-1">Ingresa para registrar ventas, créditos y pagos.</p>
        </div>

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">Usuario o contrasena incorrectos.</p> : null}
        <input name="next" type="hidden" value={next || "/"} />

        <label className="grid gap-2">
          <span className="ui-label">Usuario</span>
          <input autoComplete="username" className="ui-input" name="usuario" required />
        </label>

        <label className="grid gap-2">
          <span className="ui-label">Contrasena</span>
          <input autoComplete="current-password" className="ui-input" name="password" required type="password" />
        </label>

        <button className="ui-button-primary gap-2" type="submit">
          <span aria-hidden="true">🔑</span>
          Entrar
        </button>
      </form>
    </main>
  );
}
