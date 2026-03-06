"use client";
import React, { useEffect, useState } from "react";
import Buscador from "@/components/buscador/buscador";
import { songs, repertorios } from "@/lib/api";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import { Filter, Music, ListMusic, ChevronRight } from "lucide-react";

interface Song {
  id: number;
  name: string;
  autor?: string;
  categories?: { name: string }[];
  tono?: string;
  title?: string;
}

interface Repertorio {
  id: number;
  nombre: string;
  fecha?: string;
  privado?: boolean;
  titulo?: string;
}

const filters = {
  categorías: ["Cristiana", "Infantil", "Adoración", "Alabanza"],
  tono: ["C", "D", "E", "F", "G", "A", "B"],
  dificultad: ["Fácil", "Media", "Difícil"],
};

const Page = () => {
  const router = useRouter();

  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [repertorioResults, setRepertorioResults] = useState<Repertorio[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [allRepertorios, setAllRepertorios] = useState<Repertorio[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [songsRes, repertoriosRes] = await Promise.all([songs(), repertorios()]);
        setAllSongs(songsRes);
        setAllRepertorios(repertoriosRes);
      } catch (err) {
        console.error("Error cargando datos iniciales:", err);
      }
    };
    fetchData();
  }, []);

  const handleSearchTermSubmit = (term: string) => {
    setHasSearched(true);
    if (!term || term.trim().length === 0) {
      setSearchResults([]);
      setRepertorioResults([]);
      return;
    }

    const termLower = term.toLowerCase();

    const filteredSongs = allSongs.filter((song) =>
      (song.title || song.name)?.toLowerCase().includes(termLower)
    );

    const filteredRepertorios = allRepertorios.filter((rep) =>
      (rep.nombre || rep.titulo)?.toLowerCase().includes(termLower)
    );

    setSearchResults(filteredSongs);
    setRepertorioResults(filteredRepertorios);
  };

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return (
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto w-full transition-colors duration-500 text-[var(--text-primary)]">
      <Header />

      <div className="flex flex-1 flex-col md:flex-row px-4 md:px-8 py-8 gap-8">
        {/* Sidebar Filtros */}
        <aside className="w-full md:w-80 space-y-6">
          <div className="glass-card rounded-[2.5rem] p-8 sticky top-24 border border-[var(--glass-border)] shadow-xl shadow-black/5">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-primary">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Filter size={20} className="animate-pulse" />
                </div>
                <h2 className="text-2xl font-black tracking-tighter">Filtros</h2>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-primary transition-colors cursor-pointer">
                Reiniciar
              </button>
            </div>

            <div className="space-y-8">
              {Object.entries(filters).map(([key, values]) => (
                <div key={key} className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-80">{key}</h3>
                    <div className="h-[1px] flex-1 bg-[var(--glass-border)]"></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {values.map((v) => (
                      <label key={v} className="relative group cursor-pointer inline-flex">
                        <input type="checkbox" className="peer hidden" />
                        <span className="px-4 py-2 rounded-xl text-xs font-bold border-2 border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white transition-all duration-300 hover:border-primary/30">
                          {v}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-10 py-4 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all duration-500">
              Aplicar Filtros
            </button>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Breadcrumbs />
              <h1 className="text-3xl md:text-4xl font-black mt-2 tracking-tight">
                Biblioteca de <span className="text-gradient">Alabanza</span>
              </h1>
            </div>
          </div>

          <div className="glass-card rounded-full p-1 max-w-2xl">
            <Buscador onSearchTermSubmit={handleSearchTermSubmit} />
          </div>

          {hasSearched && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3 mb-8">
                <span className="w-2 h-8 bg-accent rounded-full"></span>
                <h2 className="text-2xl font-black tracking-tight">Resultados de búsqueda</h2>
              </div>

              {/* Resultados Canciones */}
              <div className="space-y-4 mb-12">
                <div className="flex items-center gap-2 mb-4 text-[var(--text-secondary)] opacity-50">
                  <Music size={18} />
                  <span className="text-sm font-bold uppercase tracking-widest">Canciones</span>
                </div>
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map((cancion) => (
                      <SongCard
                        key={cancion.id}
                        cancion={cancion}
                        onClick={() => router.push(`/songs/${slugify(cancion.name)}-${cancion.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-secondary)] opacity-50 italic">No se encontraron canciones.</p>
                )}
              </div>

              {/* Resultados Repertorios */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4 text-[var(--text-secondary)] opacity-50">
                  <ListMusic size={18} />
                  <span className="text-sm font-bold uppercase tracking-widest">Repertorios</span>
                </div>
                {repertorioResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {repertorioResults.map((rep) => (
                      <RepertorioCard
                        key={rep.id}
                        rep={rep}
                        onClick={() => router.push(`/repertorios/${rep.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-secondary)] opacity-50 italic">No se encontraron repertorios.</p>
                )}
              </div>
            </div>
          )}

          {/* Secciones permanentes */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2 h-8 bg-primary rounded-full"></span>
                <h2 className="text-2xl font-black tracking-tight">
                  {hasSearched ? "Otras canciones" : "Todas las canciones"}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allSongs.map((cancion) => (
                <SongCard
                  key={cancion.id}
                  cancion={cancion}
                  onClick={() => router.push(`/songs/${slugify(cancion.name)}-${cancion.id}`)}
                />
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="w-2 h-8 bg-secondary rounded-full"></span>
              <h2 className="text-2xl font-black tracking-tight">Repertorios Destacados</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {allRepertorios.map((rep) => (
                <RepertorioCard
                  key={rep.id}
                  rep={rep}
                  onClick={() => router.push(`/repertorios/${rep.id}`)}
                />
              ))}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
};

const SongCard = ({ cancion, onClick }: { cancion: Song; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="glass-card rounded-[2rem] p-6 group cursor-pointer border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all duration-500 shadow-lg shadow-black/5"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
        <Music size={24} />
      </div>
      {cancion?.tono && (
        <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[10px] font-black text-secondary tracking-widest uppercase border border-slate-200 dark:border-white/5">
          Tono: {cancion.tono}
        </span>
      )}
    </div>

    <h3 className="text-xl font-black mb-1 text-[var(--text-primary)] group-hover:text-primary transition-colors line-clamp-1">
      {cancion.name || cancion.title}
    </h3>
    <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-1">{cancion.autor || "Autor Desconocido"}</p>

    <div className="flex items-center justify-between mt-auto">
      <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-60 uppercase tracking-widest bg-[var(--glass-bg)] px-2 py-1 rounded">
        {cancion?.categories?.[0]?.name || "General"}
      </span>
      <ChevronRight className="text-[var(--text-secondary)] opacity-30 group-hover:text-primary group-hover:translate-x-1 transition-all" size={20} />
    </div>
  </div>
);

const RepertorioCard = ({ rep, onClick }: { rep: Repertorio; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="glass-card rounded-[2rem] p-6 group cursor-pointer border-l-4 border-l-secondary hover:border-l-primary border-y border-r border-slate-200 dark:border-white/10 transition-all duration-500 flex items-center gap-6 shadow-lg shadow-black/5"
  >
    <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
      <ListMusic size={28} />
    </div>

    <div className="flex-1">
      <h3 className="text-lg font-black tracking-tight text-[var(--text-primary)] group-hover:text-primary transition-colors">
        {rep.nombre || rep.titulo}
      </h3>
      <div className="flex items-center gap-4 mt-1">
        <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-60 uppercase">Fecha: {rep.fecha || "Reciente"}</span>
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${rep.privado ? 'bg-accent/10 text-accent' : 'bg-green-500/10 text-green-500'}`}>
          {rep.privado ? 'Privado' : 'Público'}
        </span>
      </div>
    </div>

    <ChevronRight className="text-[var(--text-secondary)] opacity-30 group-hover:text-primary transition-colors" size={24} />
  </div>
);

export default Page;
