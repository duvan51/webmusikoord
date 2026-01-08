'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashuser/dashApp", label: "Dashboard" },
  { href: "/dashuser/grupos", label: "Grupos" },
  { href: "/dashuser/setting", label: "setting" },
 
  { href: "/dashuser/createsongs", label: "Crear canciones" },
  { href: "/dashuser/settings", label: "Configuración" },
  { href: "/", label: "Inicio" },
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
