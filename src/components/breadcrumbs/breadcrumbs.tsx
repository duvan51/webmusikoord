'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

// Diccionario de nombres legibles
const pathNameMap: Record<string, string> = {
  songs: 'Canciones',
  dashSuperUsuario: 'Panel Principal',
  users: 'Usuarios',
  new: 'Nuevo',
  edit: 'Editar',
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Partes de la ruta
  const pathParts = pathname.split('/').filter(Boolean); // quita vacíos

  return (
    <nav className="flex items-center text-sm text-gray-600 space-x-1">
      {/* HOME siempre clickeable */}
      <Link href="/" className="hover:underline text-blue-600 font-medium">
        Home
      </Link>

      {pathParts.map((part, index) => {
        const isLast = index === pathParts.length - 1;
        const isNumber = !isNaN(Number(part));
        const label = pathNameMap[part] || part;
        const href = '/' + pathParts.slice(0, index + 1).join('/');

        // /songs => "Canciones" no clickeable si es último
        if (isLast) {
          return (
            <span key={index} className="flex items-center space-x-1">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="capitalize">
                {label}
              </span>
            </span>
          );
        }

        // Si no es el último, entonces clickeable
        return (
          <span key={index} className="flex items-center space-x-1">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link
              href={href}
              className="hover:underline text-blue-600 font-medium capitalize"
            >
              {label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
