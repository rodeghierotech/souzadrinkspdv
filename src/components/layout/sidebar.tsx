"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  LayoutGrid,
  ClipboardList,
  Package,
  LogOut,
  Wine,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  user: { name: string; email: string };
}

const navItems = [
  { href: "/pdv", label: "PDV", icon: LayoutGrid, description: "Caixa" },
  { href: "/comandas", label: "Comandas", icon: ClipboardList, description: "Histórico" },
  { href: "/produtos", label: "Produtos", icon: Package, description: "Cadastro" },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    toast.success("Sessão encerrada");
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-[220px] bg-surface border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
            <Wine className="w-5 h-5 text-gold" />
          </div>
          <div className="min-w-0">
            <h1
              className="text-sm font-bold gold-text leading-tight truncate"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Santa Adega
            </h1>
            <p className="text-[10px] text-text-muted">PDV Sistema</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group",
                isActive
                  ? "bg-gold/10 text-gold border border-gold/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive ? "text-gold" : "text-text-muted group-hover:text-text-secondary"
                )}
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block truncate">{item.label}</span>
                <span
                  className={cn(
                    "text-[10px] block truncate",
                    isActive ? "text-gold/60" : "text-text-muted"
                  )}
                >
                  {item.description}
                </span>
              </div>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-gold/60 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg mb-1">
          <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center shrink-0">
            <span className="text-gold text-xs font-bold uppercase">
              {user.name?.charAt(0) || "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-text-primary text-xs font-medium truncate">{user.name}</p>
            <p className="text-text-muted text-[10px] truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-text-muted hover:text-danger hover:bg-danger/5 rounded-lg transition-all duration-150 text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
