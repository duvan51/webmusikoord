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
    <footer className="text-[var(--text-secondary)] text-sm p-8 text-center border-t border-[var(--glass-border)] transition-colors duration-500">
      <p>&copy; {new Date().getFullYear()} Musikoord. Todos los derechos reservados.</p>

      <div className="flex flex-col md:flex-row w-full pt-8 gap-8 items-center md:items-start justify-center">
        <div className="flex flex-col gap-3">
          <div className="font-black text-xl text-[var(--text-primary)] mb-2">Musikoord<span className="text-accent">.</span></div>

          <div className="flex flex-wrap justify-center gap-6 font-bold uppercase tracking-widest text-[10px]">
            <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
            <Link href="/songs" className="hover:text-primary transition-colors">Canciones</Link>
            <Link href="/repertorios" className="hover:text-primary transition-colors">Repertorios</Link>

            {/* 👑 SOLO SUPER USUARIO */}
            {isSuperUser && (
              <Link
                href="/dashSuperUsuario"
                className="text-yellow-500 hover:text-yellow-600 transition-colors"
              >
                Panel Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;