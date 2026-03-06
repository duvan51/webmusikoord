"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSongById } from "@/lib/api";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import GenerateImage from "@/components/generateImage/generateImage";
import MultitrackAudioEditor from "@/components/MultitrackPlayers/MultitrackPlayer";
import {
  Music,
  User,
  Calendar,
  Layers,
  Edit3,
  ChevronLeft,
  Clock,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Ghost,
  Mic2,
  History
} from "lucide-react";

interface LyricLine {
  text: string;
  chords?: (string | null)[];
}

interface Section {
  type: string;
  lyrics: LyricLine[];
}

interface Song {
  id: number;
  name: string;
  autor: string;
  song: Section[];
  categories: { id: number; name: string }[];
  user: { id: number; name: string };
  created_at: string;
  tracks?: any[];
}

const ViewSongUnique = () => {
  const params = useParams();
  const router = useRouter();
  const songId = params?.id as string;

  const [songData, setSongData] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (songId) {
      fetchSong();
    }
  }, [songId]);

  const fetchSong = async () => {
    try {
      const response = await getSongById(Number(songId));
      setSongData(response);
    } catch (error) {
      console.error("Error fetching song:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={48} className="text-primary animate-spin" />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] animate-pulse">Cargando biblioteca...</p>
      </div>
    );
  }

  if (!songData) {
    return (
      <div className="text-center py-20 bg-[var(--glass-bg)] rounded-[3rem] border border-[var(--glass-border)]">
        <Ghost size={64} className="mx-auto text-[var(--text-secondary)] opacity-10 mb-6" />
        <p className="text-lg font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-widest">No se encontró la canción</p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <Breadcrumbs />

      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40 hover:opacity-100 hover:text-primary transition-all"
          >
            <ChevronLeft size={14} />
            Regresar
          </button>
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl font-black text-[var(--text-primary)] tracking-tighter leading-none">{songData.name}</h1>
            <p className="text-lg font-medium text-primary flex items-center gap-2">
              <User size={18} />
              {songData.autor}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/dashSuperUsuario/songs/${songData.id}/edit`}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Edit3 size={18} />
            Editar Canción
          </Link>

          <GenerateImage
            name={songData.name}
            author={songData.autor}
            song={songData.song}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Metadata Cards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-6 rounded-[2rem] space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[var(--text-secondary)] opacity-40 text-[10px] font-black uppercase tracking-widest">
              <Layers size={14} />
              Categorías
            </div>
            <div className="flex flex-wrap gap-2">
              {songData.categories.map((cat) => (
                <span key={cat.id} className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-wider">
                  {cat.name}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-6 rounded-[2rem] space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[var(--text-secondary)] opacity-40 text-[10px] font-black uppercase tracking-widest">
              <Calendar size={14} />
              Información
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[var(--text-secondary)]/50 uppercase">Creado por</span>
                <span className="text-xs font-bold text-[var(--text-primary)]">{songData.user?.name || "Sistema"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[var(--text-secondary)]/50 uppercase">Fecha</span>
                <span className="text-xs font-bold text-[var(--text-primary)]">{new Date(songData.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[var(--text-secondary)]/50 uppercase">Versión</span>
                <span className="text-xs font-bold text-primary">Maestra</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Song Sheet */}
          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-12 relative z-10">
              <div className="flex items-center gap-3">
                <Mic2 size={24} className="text-primary" />
                <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Partitura Digital</h2>
              </div>
            </div>

            <div className="space-y-12 relative z-10">
              {songData.song.map((section, sIdx) => (
                <div key={sIdx} className="space-y-8">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-primary/5 px-6 py-2 rounded-2xl border border-primary/20 shadow-inner">
                      {section.type}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent"></div>
                  </div>

                  <div className="space-y-10 pl-4 md:pl-8">
                    {section.lyrics.map((lyric, lIdx) => (
                      <div key={lIdx} className="relative group">
                        {/* Chords Layer */}
                        <div className="flex flex-wrap min-h-[1.5rem] mb-2">
                          {lyric.text.split("").map((char, cIdx) => (
                            <div
                              key={cIdx}
                              className={`w-[1ch] flex items-center justify-center text-[13px] font-black ${lyric.chords?.[cIdx] ? 'text-primary' : 'text-transparent'}`}
                            >
                              {lyric.chords?.[cIdx] || "|"}
                            </div>
                          ))}
                        </div>
                        {/* Lyrics Layer */}
                        <p className="text-base md:text-lg font-medium tracking-wide text-[var(--text-primary)] opacity-90 leading-relaxed group-hover:opacity-100 transition-all">
                          {lyric.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 blur-[100px] rounded-full -ml-32 -mb-32"></div>
          </div>

          {/* Multitrack Player Section */}
          {songData.tracks && songData.tracks.length > 0 && (
            <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[3rem] p-8 md:p-12 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <History size={24} className="text-primary" />
                <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Mezclador Multipista</h2>
              </div>
              <MultitrackAudioEditor tracks={songData.tracks} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewSongUnique;
