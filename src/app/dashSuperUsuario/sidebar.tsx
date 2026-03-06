"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Music, PlusCircle, Settings, Home } from "lucide-react";

const navItems = [
  { href: "/dashSuperUsuario/dashApp", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashSuperUsuario/songs", label: "Canciones", icon: Music },
  { href: "/dashSuperUsuario/createsongs", label: "Crear canciones", icon: PlusCircle },
  { href: "/dash/settings", label: "Configuración", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-72 hidden md:flex flex-col p-6 sticky top-0 h-screen transition-colors duration-500">
      <div
        className="flex items-center gap-3 mb-10 px-4 cursor-pointer group"
        onClick={() => router.push("/")}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
          M
        </div>
        <span className="text-[var(--text-primary)] text-xl font-black tracking-tight self-center">
          Musikoord<span className="text-accent">.</span>
        </span>
      </div>

      <nav className="flex flex-col gap-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--text-secondary)] font-bold hover:bg-[var(--glass-bg)] hover:text-primary transition-all mb-4"
        >
          <Home size={18} />
          <span>Volver al inicio</span>
        </Link>

        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold ${isActive
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20"
                : "text-[var(--text-secondary)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)]"
                }`}
            >
              <Icon size={20} className={isActive ? "text-white" : "text-primary"} />
              <span className="text-sm tracking-wide">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 bg-primary/5 rounded-3xl border border-primary/10">
        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 text-center">Modo Administrador</p>
        <p className="text-[9px] text-[var(--text-secondary)] text-center opacity-60">Gestiona contenidos y usuarios con precaución.</p>
      </div>
    </aside>
  );
}
