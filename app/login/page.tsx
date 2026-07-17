import { login } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;

  return (
    <main className="app-page justify-center">
      <form action={login} className="ui-card grid gap-5">
        <div>
          <p className="ui-label">Acceso ADMIN</p>
          <h1 className="text-4xl font-bold text-[var(--brand)]">Delicias Lia</h1>
        </div>
        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">Usuario o contraseña incorrectos.</p> : null}
        <input name="next" type="hidden" value={next || "/"} />
        <label className="grid gap-2">
          <span className="ui-label">Usuario</span>
          <input autoComplete="username" className="ui-input" name="usuario" required />
        </label>
        <label className="grid gap-2">
          <span className="ui-label">Contraseña</span>
          <input autoComplete="current-password" className="ui-input" name="password" required type="password" />
        </label>
        <button className="ui-button-primary" type="submit">
          Entrar
        </button>
      </form>
    </main>
  );
}
