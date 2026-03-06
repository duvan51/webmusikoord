"use client";

import { useEffect, useState } from "react";
import React from "react";
import { songs, deleteSong } from "@/lib/api";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import Buscador from "@/components/buscador/buscador";
import Breadcrumbs from '@/components/breadcrumbs/breadcrumbs';
import {
  Music,
  Trash2,
  Edit3,
  Layers,
  Plus,
  MoreVertical,
  Search,
  Filter,
  X,
  User,
  ChevronRight,
  Loader2
} from "lucide-react";

const Page = () => {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    setIsLoading(true);
    try {
      const res = await songs();
      setData(res || []);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar las canciones");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredData = data.filter(song =>
    song.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (song.author || song.autor || "").toLowerCase().includes(searchTerm.toLowerCase())
  );


  const deleteSongs = async (songId: number) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta canción?");
    if (!confirmDelete) return;

    const result = await deleteSong(songId);
    if (result) {
      setData(data.filter(song => song.id !== songId));
      toast.success("✅ Canción eliminada con éxito");
    } else {
      toast.error("❌ No se pudo eliminar la canción");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ToastContainer position="top-right" theme="dark" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary ring-1 ring-primary/20">
              <Music size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Gestión de Canciones</h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)] opacity-60 font-medium">Administra el catálogo maestro de música y sus versiones.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashSuperUsuario/createsongs')}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} />
            Nueva Canción
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4 bg-[var(--glass-bg)] p-2 rounded-[2rem] border border-[var(--glass-border)]">
        <div className="flex-1 w-full relative">
          <Buscador onSearchTermSubmit={handleSearch} />
        </div>
        <div className="flex gap-2 p-1">
          <button className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-primary transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-12 px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-40">
          <div className="col-span-12 lg:col-span-5">Canción / Título</div>
          <div className="hidden lg:block lg:col-span-3 text-center">Categorías</div>
          <div className="hidden lg:block lg:col-span-2 text-center">Autor</div>
          <div className="hidden lg:block lg:col-span-2 text-right">Acciones</div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={40} className="text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] animate-pulse">Cargando biblioteca...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-20 bg-[var(--glass-bg)] rounded-[2.5rem] border border-dashed border-[var(--glass-border)]">
            <Music size={48} className="mx-auto text-[var(--text-secondary)] opacity-20 mb-4" />
            <p className="text-sm font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-widest">No hay canciones disponibles</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredData.map((song) => (
              <div
                key={song.id}
                className="group grid grid-cols-12 items-center gap-4 bg-[var(--glass-bg)] hover:bg-[var(--glass-hover-bg)] p-4 lg:p-6 rounded-[2rem] border border-[var(--glass-border)] transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="col-span-12 lg:col-span-5 flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-black shadow-inner ring-1 ring-white/10">
                    {song.name.charAt(0)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-bold text-[var(--text-primary)] truncate group-hover:text-primary transition-colors">{song.name}</span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest opacity-60">ID: #{song.id}</span>
                  </div>
                </div>

                <div className="col-span-6 lg:col-span-3">
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {song.categories && song.categories.length > 0 ? (
                      song.categories.map((cat: any, idx: number) => (
                        <div
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-wider whitespace-nowrap shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]"
                        >
                          {cat.name}
                        </div>
                      ))
                    ) : (
                      <span className="text-[9px] font-black text-[var(--text-secondary)] opacity-30 uppercase tracking-widest">Sin categorías</span>
                    )}
                  </div>
                </div>

                <div className="col-span-6 lg:col-span-2 flex items-center justify-center gap-2">
                  <div className="p-1.5 bg-[var(--glass-bg)] rounded-lg border border-[var(--glass-border)] text-[var(--text-secondary)]">
                    <User size={12} />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-secondary)] truncate max-w-[120px]">{song.author || song.autor || "Desconocido"}</span>
                </div>

                <div className="col-span-12 lg:col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => router.push(`/dashSuperUsuario/songs/${song.id}`)}
                    className="p-3 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                    title="Editar canción"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => deleteSongs(song.id)}
                    className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    title="Eliminar canción"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="lg:hidden ml-2 px-2 py-4 border-l border-[var(--glass-border)]">
                    <ChevronRight size={18} className="text-[var(--text-secondary)]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
