'use client';
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { getFromStorage } from "@/utils/storage"



const SUPER_EMAIL = "duvanaponteramirez@gmail.com";


const Footer = () => {
  const [isSuperUser, setIsSuperUser] = useState(false);

  useEffect(() => {
    const data = getFromStorage<any>("user");
    const email = data?.user?.email;

    if (email === SUPER_EMAIL) {
      setIsSuperUser(true);
    }
  }, []);

  return (
    <footer className="text-white text-sm p-4 text-center">
      <p>&copy; {new Date().getFullYear()} Musikoord. Todos los derechos reservados.</p>

      <div className="flex w-full pt-4">
        <div className="w-1/3 flex flex-col gap-2">
          <div className="font-bold text-base">Musikoord</div>

          <Link href="/">Login</Link>

          {/* 👑 SOLO SUPER USUARIO */}
          {isSuperUser && (
            <Link
              href="/dashSuperUsuario"
              className="text-yellow-400 font-semibold hover:underline"
            >
              Panel Superusuario
            </Link>
          )}

          <Link href="/songs">Canciones</Link>
          <Link href="/repertorios">Repertorios</Link>
        </div>

        <div className="w-1/3">2</div>
        <div className="w-1/3">3</div>
      </div>
    </footer>
  );
};

export default Footer;