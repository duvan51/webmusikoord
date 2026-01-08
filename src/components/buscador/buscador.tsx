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
    <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto mt-10">
      <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2">
        <Search className="text-gray-400" />
        <input
          type="text"
          placeholder="Buscar canciones o repertorios..."
          className="w-full focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {showSuggestions &&
        (results.songs.length > 0 || results.repertorios.length > 0) && (
          <div className="absolute bg-white shadow-lg rounded-lg w-full mt-2 z-50 p-4">
            {/* 🎵 Canciones */}
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Canciones
            </h4>

            {results.songs.length === 0 && (
              <p className="text-gray-400 text-sm">No hay resultados</p>
            )}

            {results.songs.map((song) => {
              const value = song.title || song.name;
              return (
                <div
                  key={song.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                  onClick={() => {
                    setSearchTerm(value);
                    setShowSuggestions(false);
                    onSearchTermSubmit(value);
                  }}
                >
                  🎵 {value}
                </div>
              );
            })}

            {/* 📁 Repertorios */}
            <h4 className="text-sm font-semibold text-gray-700 mt-4 mb-2">
              Repertorios
            </h4>

            {results.repertorios.length === 0 && (
              <p className="text-gray-400 text-sm">No hay resultados</p>
            )}

            {results.repertorios.map((rep) => {
              const value = rep.nombre || rep.titulo;
              return (
                <div
                  key={rep.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                  onClick={() => {
                    setSearchTerm(value);
                    setShowSuggestions(false);
                    onSearchTermSubmit(value);
                  }}
                >
                  📁 {value}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
