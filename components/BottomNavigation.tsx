"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Inicio", icon: "M3 12h18M5 12l7-7 7 7M6 10v10h12V10" },
  { href: "/fiados", label: "Crédito", icon: "M4 7h16M4 12h16M4 17h10" },
  { href: "/clientes", label: "Clientes", icon: "M16 11a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0" },
  { href: "/mas", label: "Mas", icon: "M5 12h.01M12 12h.01M19 12h.01" }
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="app-bottom-nav" aria-label="Navegacion principal">
      <div className="grid grid-cols-[1fr_1fr_72px_1fr_1fr] items-end gap-1">
        {navItems.slice(0, 2).map((item) => (
          <NavItem active={pathname === item.href} key={item.href} {...item} />
        ))}
        <Link className="app-fab" href="/ventas" aria-label="Nueva venta">
          <svg aria-hidden="true" className="size-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
        {navItems.slice(2).map((item) => (
          <NavItem active={pathname === item.href || (item.href === "/mas" && ["/productos", "/reportes", "/configuracion"].includes(pathname))} key={item.href} {...item} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({ active, href, icon, label }: { active: boolean; href: string; icon: string; label: string }) {
  return (
    <Link className={`app-nav-item ${active ? "text-[var(--primary)]" : "text-[var(--text-muted)]"}`} href={href}>
      <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
        <path d={icon} />
      </svg>
      <span>{label}</span>
    </Link>
  );
}
