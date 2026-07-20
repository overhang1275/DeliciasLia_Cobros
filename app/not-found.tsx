import Link from "next/link";

export default function NotFound() {
  return (
    <main className="app-page justify-center">
      <section className="grid gap-5 rounded-[2rem] bg-white p-6 text-center shadow-sm">
        <span className="mx-auto grid size-20 place-items-center rounded-[1.75rem] bg-[var(--primary-soft)] text-4xl" aria-hidden="true">
          🧭
        </span>
        <div>
          <p className="ui-label">Pagina no encontrada</p>
          <h1 className="mt-1 text-4xl font-bold text-[var(--brand)]">404</h1>
          <p className="mt-2 text-[var(--text-muted)]">La ruta que abriste no existe o ya no esta disponible.</p>
        </div>
        <Link className="ui-button-primary" href="/">
          🏠 Volver al inicio
        </Link>
      </section>
    </main>
  );
}
