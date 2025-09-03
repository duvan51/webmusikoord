"use client";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    songs: 0,
    categorias: 0,
    usuarios: 0,
    registros: 0,
    grupos: 0,
  });

  useEffect(() => {
    getStats();
  }, []);

  const getStats = async () => {
    try {
      // Aquí deberías llamar a tu API para obtener los datos reales
      const data = await fetch("/api/stats").then(res => res.json());

      setStats({
        songs: data.totalSongs,
        categorias: data.totalCategorias,
        usuarios: data.totalUsuarios,
        registros: data.totalRegistros,
        grupos: data.totalGrupos,
      });
    } catch (err) {
      toast.error("Error al obtener las estadísticas");
    }
  };

  const Card = ({ title, value }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full sm:w-1/2 md:w-1/3 lg:w-1/5 text-white">
      <h3 className="text-sm uppercase text-black font-bold">{title}</h3>
      <p className="text-black text-3xl ">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black p-6"
    style={{
        background: "linear-gradient(180deg, #251a4e 0%, #100929 100%)",
      }}
    >
      <ToastContainer />

      <h1 className="text-white text-3xl font-bold mb-6">Dashboard</h1>

      <div className="flex flex-wrap gap-4">
        <Card title="Canciones" value={stats.songs} />
        <Card title="Categorías" value={stats.categorias} />
        <Card title="Usuarios" value={stats.usuarios} />
        <Card title="Registros" value={stats.registros} />
        <Card title="Grupos" value={stats.grupos} />
      </div>
    </div>
  );
}
