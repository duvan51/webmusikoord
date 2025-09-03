"use client";
import React, { useEffect, useState } from "react";
import { songs } from "@/lib/api";


type Song = {
  id: number;
  name: string;
  artist?: string;
  album?: string;
};

const SongsModal = ({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (ids: number[]) => void;
}) => {
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);

  // ✅ Cargar canciones al iniciar
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await songs();
        setAllSongs(res);
      } catch (err) {
        console.error("Error cargando canciones iniciales:", err);
      }
    };
    fetchSongs();
  }, []);

  /*
  useEffect(() => {
    onSelect(selectedSongs.map((s) => s.id));
  }, [selectedSongs, onSelect]);
*/


  if (!open) return null;

  // 🔎 Filtrar canciones por nombre
  const filteredSongs = allSongs.filter((song) =>
    song.name.toLowerCase().includes(search.toLowerCase())
  );

  // ➕ Agregar canción a seleccionadas
  const handleAddSong = (song: Song) => {
    if (!selectedSongs.find((s) => s.id === song.id)) {
      setSelectedSongs([...selectedSongs, song]);
    }
  };
  const removeSong = (id) => {
    setSelectedSongs((prev) => prev.filter((song) => song.id !== id));
  };

   // ✅ Disparar creación desde el botón
  const handleCreate = () => {
    onSelect(selectedSongs.map((s) => s.id));
  };




 // console.log("selectSongs", selectedSongs);


  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          maxHeight: "90vh",
          width: "80%",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Seleccionar Canciones</h2>
          <button
            onClick={handleCreate}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Crear Canciones
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            Cerrar
          </button>
        </div>

        {/* Layout */}
        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Lista de canciones */}
          <div className="w-1/2 flex flex-col">
            {/* Search */}
            <input
              type="text"
              placeholder="Buscar canción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded mb-2"
            />

            {/* Scroll de canciones */}
            <div className="flex-1 overflow-y-auto border rounded">
              {filteredSongs.map((song) => {
                const isAdded = selectedSongs.some((s) => s.id === song.id);
                return (
                  <div
                    key={song.id}
                    className={`p-2 border-b cursor-pointer flex justify-between items-center 
                      ${selectedSong?.id === song.id ? "bg-gray-200" : ""}
                      ${isAdded ? "bg-gray-100 line-through text-gray-500" : ""}
                    `}
                    onClick={() => setSelectedSong(song)}
                  >
                    <span>{song.name}</span>
                    {isAdded && (
                      <span className="text-green-600 font-bold">✔</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview y selección */}
          <div className="w-1/2 border rounded p-3 flex flex-col">
            {selectedSong ? (
             
              (
                <div className="">
                  <h3 className="text-lg font-semibold">{selectedSong.name}</h3>
                  <p className="text-gray-600">
                    {selectedSong.artist || "Artista desconocido"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {selectedSong.album || "Sin álbum"}
                  </p>

                  <div className="min-h-[200px] max-h-[200px] overflow-y-auto mt-2">
                    {selectedSong.song.map((section, sectionIdx) => (
                      <div key={sectionIdx} className="transform scale-75">
                        <div className="text-[#4A90E2] font-bold text-lg mb-1">
                          {section.type}
                        </div>
                        {section.lyrics.map((lyric, lineIdx) => (
                          <div key={lineIdx} className="">
                            {/* Fila de acordes (cada carácter tiene su propia celda) */}
                            <div className="hidden md:flex">
                              {Array.from({ length: lyric.text.length }).map(
                                (_, charIdx) => (
                                  <div
                                    key={charIdx}
                                    className="relative w-[10px] h-4 text-xm text-purple-700 font-semibold text-center cursor-pointer overflow-visible"
                                  >
                                    {lyric.chords?.[charIdx] ?? ""}
                                  </div>
                                )
                              )}
                            </div>

                            {/* Línea de texto completa */}
                            <div className="whitespace-pre-wrap  leading-5 font-sans text-lg pt-1">
                              {lyric.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleAddSong(selectedSong)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    ➕ Agregar
                  </button>
                </div>
              )
            ) : (
              <p className="text-gray-500">
                Selecciona una canción para ver el preview
              </p>
            )}

            {/* Lista de seleccionadas */}
            {selectedSongs.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold">Seleccionadas:</h4>
                <ul className="list-disc pl-5 max-h-[100px] overflow-y-auto">
                  {selectedSongs.map((song) => (
                    <li
                      key={song.id}
                      className="flex justify-between items-center"
                    >
                      <span>{song.name}</span>
                      <button
                        className="ml-2 text-red-500 hover:text-red-700 text-sm"
                        onClick={() => removeSong(song.id)}
                      >
                        ❌
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SongsModal;
