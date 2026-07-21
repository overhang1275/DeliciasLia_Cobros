"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Home, MoreHorizontal, Plus, ReceiptText, Users } from "@/components/AppIcon";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/fiados", label: "Crédito", icon: ReceiptText },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/mas", label: "Mas", icon: MoreHorizontal }
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="app-bottom-nav" aria-label="Navegacion principal">
      <div className="grid grid-cols-[1fr_1fr_72px_1fr_1fr] items-end gap-1">
        {navItems.slice(0, 2).map((item) => (
          <NavItem active={pathname === item.href} key={item.href} {...item} />
        ))}
        <Link className="app-fab" href="/ventas" aria-label="Nueva venta" title="Nueva venta">
          <Plus aria-hidden="true" className="size-7" strokeWidth={2.5} />
        </Link>
        {navItems.slice(2).map((item) => (
          <NavItem active={pathname === item.href || (item.href === "/mas" && ["/productos", "/reportes", "/configuracion"].includes(pathname))} key={item.href} {...item} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({ active, href, icon: Icon, label }: { active: boolean; href: string; icon: LucideIcon; label: string }) {
  return (
    <Link className={`app-nav-item ${active ? "text-[var(--primary)]" : "text-[var(--text-muted)]"}`} href={href}>
      <Icon aria-hidden="true" className="size-5" />
      <span>{label}</span>
    </Link>
  );
}
