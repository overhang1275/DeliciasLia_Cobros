import Link from "next/link";
import { logout } from "@/app/login/actions";

const items = [
  ["🗓️", "Pedidos", "Encargos para entregar despues", "/pedidos"],
  ["📦", "Productos", "Catalogo y precios de venta", "/productos"],
  ["📊", "Reportes", "Ventas, cobros y deudores", "/reportes"],
  ["⚙️", "Configuracion", "Logo, negocio y datos bancarios", "/configuracion"]
];

export default function MasPage() {
  return (
    <main className="app-page">
      <header className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-3xl" aria-hidden="true">
          🧰
        </span>
        <div className="min-w-0 flex-1">
          <p className="ui-label">Mas opciones</p>
          <h1 className="truncate text-3xl font-bold text-[var(--brand)]">Herramientas</h1>
          <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">Todo lo que no usas a cada minuto.</p>
        </div>
        <Link className="grid size-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-xl text-[var(--primary)]" href="/" aria-label="Inicio">
          <span aria-hidden="true">🏠</span>
        </Link>
      </header>

      <section className="grid gap-3">
        {items.map(([icon, title, description, href]) => (
          <Link className="flex min-h-24 items-center gap-4 rounded-[1.75rem] bg-white p-4 shadow-sm transition duration-150 active:scale-[0.99]" href={href} key={href}>
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-3xl" aria-hidden="true">
              {icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold text-[var(--text-main)]">{title}</span>
              <span className="ui-label mt-1 block">{description}</span>
            </span>
            <span className="text-2xl font-bold text-[var(--primary)]" aria-hidden="true">
              ➡️
            </span>
          </Link>
        ))}
      </section>

      <form action={logout}>
        <button className="ui-button-secondary w-full gap-2" type="submit">
          <span aria-hidden="true">👋</span>
          Salir
        </button>
      </form>
    </main>
  );
}
