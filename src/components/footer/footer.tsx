'use client';
import React from 'react'
import Link from 'next/link';


const Footer = () => {
  return (
    <footer className=" text-white text-sm p-4 text-center">
      <p>&copy; {new Date().getFullYear()} TuApp. Todos los derechos reservados.</p>
      <div className='flex w-full pt-2'>
        <div className='w-1/3 flex flex-col gap-2'>
            <div className=' font-bold text-base '>Musikoord</div>
            <Link href="/">Login</Link>
            <Link href="/dashSuperUsuario">Login superusuario</Link>
            <div>Canciones</div>
            <div>Repertorios</div>
        </div>
        <div className='w-1/3'>2</div>
        <div className='w-1/3'>3</div>
      </div>
    </footer>
  );
};

export default Footer;
