"use client";

import React, { useState, useEffect } from "react";
import { repertoriosById } from "@/lib/api";
import Canciones from "./songOriginal";
import Link from "next/link";
import { ChevronDown, ChevronUp, Clock, MessageSquare, Music, ExternalLink, Send } from "lucide-react";

interface RepertProps {
  IdRepertorio: number;
}

const Repert: React.FC<RepertProps> = ({ IdRepertorio }) => {
  const [data, setData] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (IdRepertorio) {
      repertoriosById(IdRepertorio)
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          console.error("Error al obtener Repertorio", err);
          setData(null);
        });
    }
  }, [IdRepertorio]);

  const toggleOpen = () => setIsOpen(!isOpen);

  if (!data) return null;

  return (
    <div className={`glass-card rounded-[2rem] border border-[var(--glass-border)] transition-all duration-500 overflow-hidden ${isOpen ? 'shadow-2xl' : 'hover:bg-[var(--glass-hover-bg)]'}`}>
      {/* Header clickable to expand */}
      <div
        onClick={toggleOpen}
        className="p-6 md:p-8 cursor-pointer flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary shadow-inner">
            <Music size={28} />
          </div>
          <div>
            <h4 className="text-xl font-black text-[var(--text-primary)] tracking-tight">{data?.nombre}</h4>
            <div className="flex items-center gap-4 mt-1 text-xs font-bold text-[var(--text-secondary)] opacity-60">
              <span className="flex items-center gap-1">
                <Clock size={12} /> Hace 2 días
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={12} /> {data?.comentarios?.length || 0} Comentarios
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/dashuser/grupos/repertorio/${data?.id}`}
            onClick={(e) => e.stopPropagation()}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
          >
            <ExternalLink size={14} /> Detalle
          </Link>
          <div className={`p-2 rounded-xl bg-[var(--glass-bg)] text-[var(--text-primary)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown size={20} />
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100 border-t border-[var(--glass-border)]' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        <div className="p-6 md:p-8 space-y-8 bg-gradient-to-b from-transparent to-[var(--glass-bg)]/30">

          {/* Categorías de Canciones */}
          <div className="space-y-6">
            {data?.repertorio_song_category?.map((songCategory: any) => (
              <div key={songCategory.id} className="space-y-4">
                <h5 className="text-sm font-black uppercase tracking-[0.2em] text-primary px-2 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                  {songCategory?.nombre}
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.isArray(songCategory?.customSongs) && songCategory.customSongs.length > 0 ? (
                    songCategory.customSongs.map((cancionArray: any[], index: number) => {
                      const firstSong = cancionArray[0];
                      return firstSong?.original_song_id ? (
                        <div key={firstSong.id ?? `${songCategory.id}-${index}`} className="glass-card-sm p-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]/50">
                          <Canciones song={firstSong} />
                        </div>
                      ) : null;
                    })
                  ) : (
                    <p className="text-xs text-[var(--text-secondary)] italic opacity-40 px-4">No hay canciones en esta sección.</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sección de Comunitat (Comentarios) */}
          <div className="space-y-6 pt-8 border-t border-[var(--glass-border)]">
            <h5 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-primary)] flex items-center gap-2">
              <MessageSquare size={16} /> Comunidad del Repertorio
            </h5>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {data?.comentarios?.map((comentario: any) => (
                <div key={comentario.id} className="flex gap-4 p-4 rounded-2xl bg-[var(--glass-bg)]/30 border border-[var(--glass-border)]/50">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {comentario?.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[var(--text-primary)]">{comentario?.user?.name}</span>
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50">{comentario?.created_at}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{comentario?.contenido}</p>
                  </div>
                </div>
              ))}

              {(!data?.comentarios || data.comentarios.length === 0) && (
                <p className="text-center text-xs text-[var(--text-secondary)] opacity-40 italic py-4">No hay comentarios aún. Da el primer paso.</p>
              )}
            </div>

            {/* Input para nuevo comentario */}
            <div className="relative group">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe un mensaje para el equipo..."
                className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-4 md:p-6 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[100px] resize-none pr-16 font-medium"
              />
              <button
                className="absolute bottom-4 right-4 p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                title="Enviar comentario"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Repert;
