"use client";

import { useEffect, useState } from "react";
import { search } from "@/lib/api"; // Asegúrate que está bien exportado
import { Search } from "lucide-react";

type Props = {
  onSearchTermSubmit: (data: any) => void; // usa el mismo nombre que en el padre
};

export default function Buscador({ onSearchTermSubmit }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<{ songs: any[]; repertorios: any[] }>({
    songs: [],
    repertorios: [],
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length > 1) {
        search(searchTerm)
          .then((data) => {
            setResults(data); // ← Aquí llega el { songs: [], repertorios: [] }
            setShowSuggestions(true);
            onSearchTermSubmit(data);
          })
          .catch((err) => console.error("Error al buscar:", err));
      } else {
        setResults({ songs: [], repertorios: [] });
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto mt-10">
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
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Canciones
            </h4>
            {results.songs.length === 0 && (
              <p className="text-gray-400 text-sm">No hay resultados</p>
            )}
            {results.songs.map((song) => (
              <div
                key={song.id}
                className="p-2 hover:bg-gray-100 cursor-pointer rounded"
              >
                🎵 {song.title || song.name}
              </div>
            ))}

            <h4 className="text-sm font-semibold text-gray-700 mt-4 mb-2">
              Repertorios
            </h4>
            {results.repertorios.length === 0 && (
              <p className="text-gray-400 text-sm">No hay resultados</p>
            )}
            {results.repertorios.map((rep) => (
              <div
                key={rep.id}
                className="p-2 hover:bg-gray-100 cursor-pointer rounded"
              >
                📁 {rep.nombre || rep.titulo}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
