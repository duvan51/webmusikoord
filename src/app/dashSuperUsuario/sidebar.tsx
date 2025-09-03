'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashSuperUsuario/dashApp", label: "Dashboard" },
  { href: "/dashSuperUsuario/songs", label: "Canciones" },
 
  { href: "/dashSuperUsuario/createsongs", label: "Crear canciones" },
  { href: "/dash/settings", label: "Configuración" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-md">
      <nav className="flex flex-col p-4 gap-2">
        {navItems.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-4 py-2 rounded hover:bg-gray-100 ${
              pathname === href ? "bg-gray-200 font-bold" : ""
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
