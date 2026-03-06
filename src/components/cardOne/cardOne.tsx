"use client";

import React, { useState, useEffect } from "react";
import { songs, deleteSong } from "@/lib/api";
import { useRouter } from 'next/navigation';




const CardSongOne = () => {
  const [data, setData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const song = await songs();
        setData(song);
        //console.log(song);
      } catch (error) {
        console.error("Error al obtener las canciones:", error);
      }
    };

    fetchSongs();
  }, []);


  const handleSelectSong = (id: string) => {
    router.push(`/songs/${id}`); // ✅ así navegas en Next.js
  };



  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-5">
      {data.slice(0, 8).map((song: any, index: number) => (
        <div
          key={song.id}
          onClick={() => handleSelectSong(song.id)}
          className="glass-card group overflow-hidden rounded-3xl cursor-pointer flex h-28 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-black/5"
        >
          {/* Izquierda (Número) */}
          <div className="flex-1 bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-3xl shadow-inner group-hover:brightness-110 transition-all">
            {index + 1}
          </div>

          {/* Centro (Detalles canción) */}
          <div className="flex-[3] p-4 flex flex-col justify-between overflow-hidden">
            <div className="space-y-1">
              <strong className="text-[var(--text-primary)] text-sm font-black block truncate group-hover:text-primary transition-colors">
                {song.name || "Título no disponible"}
              </strong>
              <p className="text-[10px] text-[var(--text-secondary)] line-clamp-2 leading-tight font-medium italic">
                {song?.song?.[0]?.lyrics?.[0]?.text || "Sin letra disponible"}...
              </p>
            </div>

            <div className="flex items-center gap-3 text-[9px] font-bold text-[var(--text-secondary)] opacity-50 uppercase tracking-widest">
              <span className="truncate max-w-[60px]">{song.autor || "Autor"}</span>
              <span className="w-1 h-1 bg-[var(--text-secondary)] rounded-full opacity-20"></span>
              <span className="truncate max-w-[60px]">{song?.categories?.[0]?.name || "Género"}</span>
            </div>
          </div>

          {/* Derecha (Acorde principal) */}
          <div className="flex-1 flex items-center justify-center text-secondary font-black text-2xl bg-[var(--glass-bg)] border-l border-[var(--glass-border)] group-hover:bg-primary/5 transition-colors">
            {song?.song?.[0]?.lyrics?.[0]?.chords?.[0] || "🎹"}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardSongOne;
