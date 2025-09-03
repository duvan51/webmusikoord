'use client';

import Link from 'next/link';


export default function DashNav() {
  return (
    <nav>
      <Link href="/dashSuperUsuario">Inicio</Link>
      <Link href="/dashSuperUsuario/songs">Canciones</Link>
      <Link href="/dashSuperUsuario/createsongs">Crear Canciones</Link>
    </nav>
  );
}