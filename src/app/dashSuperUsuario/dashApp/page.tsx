"use client";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { songs, getCategorias } from "@/lib/api";

import { Music, FolderTree, Users, FileText, UsersRound } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [Countsongs, setCountsongs] = useState(0);
  const [stats, setStats] = useState({
    categorias: 0,
    usuarios: 0,
    registros: 0,
    grupos: 0,
  });

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await songs();
        setCountsongs(res.length || 0);
      } catch (err) {
        console.error("Error fetching songs:", err);
      }
    };
    fetchSongs();
  }, []);

  useEffect(() => {
    getStats();
  }, []);

  const getStats = async () => {
    try {
      const resp = await fetch("/api/stats");
      if (resp.ok) {
        const data = await resp.json();
        setStats({
          categorias: data.totalCategorias || 0,
          usuarios: data.totalUsuarios || 0,
          registros: data.totalRegistros || 0,
          grupos: data.totalGrupos || 0,
        });
      }
    } catch (err) {
      // toast.error("Error al obtener las estadísticas");
    }
  };

  const Card = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
    <div className="glass-card p-6 rounded-[2rem] flex flex-col gap-4 border border-[var(--glass-border)] hover:border-primary/30 transition-all duration-300 group">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500"
        style={{ backgroundColor: `${color}20`, color: color }}
      >
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 mb-1">{title}</h3>
        <p className="text-3xl font-black text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      <ToastContainer />

      <div>
        <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight mb-2">
          Bienvenido, <span className="text-gradient">Administrador</span>
        </h1>
        <p className="text-[var(--text-secondary)] font-medium">
          Aquí tienes un resumen del estado actual de tu plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Card title="Canciones" value={Countsongs} icon={Music} color="#6366f1" />
        <Card title="Categorías" value={stats.categorias} icon={FolderTree} color="#a855f7" />
        <Card title="Usuarios" value={stats.usuarios} icon={Users} color="#f43f5e" />
        <Card title="Registros" value={stats.registros} icon={FileText} color="#06b6d4" />
        <Card title="Grupos" value={stats.grupos} icon={UsersRound} color="#10b981" />
      </div>

      {/* Placeholder for future charts or detailed lists */}
      <div className="grid lg:grid-cols-2 gap-8 mt-12">
        <div className="glass-card p-8 rounded-[2.5rem] min-h-[300px] flex items-center justify-center border-dashed border-2 border-[var(--glass-border)] opacity-50">
          <p className="text-[var(--text-secondary)] font-bold italic">Gráfica de actividad (Próximamente)</p>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] min-h-[300px] flex items-center justify-center border-dashed border-2 border-[var(--glass-border)] opacity-50">
          <p className="text-[var(--text-secondary)] font-bold italic">Últimos registros (Próximamente)</p>
        </div>
      </div>
    </div>
  );
}
