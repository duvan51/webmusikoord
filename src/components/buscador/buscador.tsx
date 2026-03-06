"use client";

import { useEffect, useState, useRef } from "react";
import { search } from "@/lib/api";
import { Search } from "lucide-react";

type Props = {
  onSearchTermSubmit: (term: string) => void;
};

export default function Buscador({ onSearchTermSubmit }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<{ songs: any[]; repertorios: any[] }>({
    songs: [],
    repertorios: [],
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 🔍 Buscar con debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length > 1) {
        search(searchTerm)
          .then((data) => {
            setResults(data);
            setShowSuggestions(true);
          })
          .catch((err) => console.error("Error al buscar:", err));
      } else {
        setResults({ songs: [], repertorios: [] });
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // 🖱️ Click fuera → cerrar sugerencias
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ⏎ Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      onSearchTermSubmit(searchTerm);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="flex items-center gap-3 px-6 py-4 bg-transparent">
        <Search className="text-primary w-5 h-5 flex-shrink-0" />
        <input
          type="text"
          placeholder="Buscar canciones o repertorios..."
          className="w-full bg-transparent outline-none text-base font-medium placeholder:text-white/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {showSuggestions &&
        (results.songs.length > 0 || results.repertorios.length > 0) && (
          <div className="absolute left-0 right-0 top-full mt-2 glass-card rounded-3xl z-50 p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* 🎵 Canciones */}
            <div className="flex items-center gap-2 mb-3 text-[var(--text-secondary)] opacity-50">
              <span className="text-[10px] font-black uppercase tracking-widest">Canciones</span>
            </div>

            <div className="space-y-1">
              {results.songs.length === 0 ? (
                <p className="text-[var(--text-secondary)] opacity-30 text-xs italic px-2">No hay resultados</p>
              ) : (
                results.songs.map((song) => {
                  const value = song.title || song.name;
                  return (
                    <div
                      key={song.id}
                      className="group flex items-center gap-3 p-3 hover:bg-primary/10 cursor-pointer rounded-xl transition-all"
                      onClick={() => {
                        setSearchTerm(value);
                        setShowSuggestions(false);
                        onSearchTermSubmit(value);
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Search size={14} />
                      </div>
                      <span className="text-sm font-bold text-[var(--text-primary)] transition-opacity">{value}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* 📁 Repertorios */}
            <div className="flex items-center gap-2 mt-6 mb-3 text-[var(--text-secondary)] opacity-50">
              <span className="text-[10px] font-black uppercase tracking-widest">Repertorios</span>
            </div>

            <div className="space-y-1">
              {results.repertorios.length === 0 ? (
                <p className="text-[var(--text-secondary)] opacity-30 text-xs italic px-2">No hay resultados</p>
              ) : (
                results.repertorios.map((rep) => {
                  const value = rep.nombre || rep.titulo;
                  return (
                    <div
                      key={rep.id}
                      className="group flex items-center gap-3 p-3 hover:bg-secondary/10 cursor-pointer rounded-xl transition-all"
                      onClick={() => {
                        setSearchTerm(value);
                        setShowSuggestions(false);
                        onSearchTermSubmit(value);
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                        <Search size={14} />
                      </div>
                      <span className="text-sm font-bold text-[var(--text-primary)] transition-opacity">{value}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
    </div>
  );
}
