// ConviertoSongViewId.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { repertoriosById } from "@/lib/api";
import AddRepertorios from "./addRepertorios";
import AddSongRepert from "./addSongRepert";



export default function ConviertoSongViewId() {
  const { conciertoId } = useParams();
  const [repertorio, setRepertorio] = useState<any>(null);

  const [selectedCategory, setSelectedCategory] = useState(
    repertorio?.repertorio_song_category?.[0]?.id || null
  );
  const [selectedArrayIndex, setSelectedArrayIndex] = useState(0);
  const [selectedSong, setSelectedSong] = useState<any>(null);

  useEffect(() => {
    reloadRepertorio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conciertoId]);

  const reloadRepertorio = async () => {
    try {
      const data = await repertoriosById(conciertoId);
      setRepertorio(data);
    } catch (error) {
      console.error("Error al recargar repertorio:", error);
    }
  };

  const parseLyrics = (lyricsString: string) => {
    try {
      return JSON.parse(lyricsString); // convierte el string en objeto/array
    } catch (error) {
      console.error("Error al parsear lyrics:", error);
      return [];
    }
  };

  

  return (
    <div className="text-white p-4 rounded-lg">
      {repertorio ? (
        <div>
          <div>
            <h2 className="text-xl font-semibold">{repertorio.nombre}</h2>
            <p className="">Fecha de concierto: {repertorio.fecha}</p>
          </div>
          <div className="bg-white rounded-lg p-4 mt-4">
            {/* header  */}
            <div>
              <div>
                {/* Tabs */}
                <div className="text-black">
                  {/* Pestañas de Categorías */}
                  <div className="flex  pb-2 border-b w-full justify-between">
                    <div className="flex gap-4">
                    {repertorio?.repertorio_song_category?.map(
                      (songCategory: any) => (
                        <button
                          key={songCategory.id}
                          className={`px-4 py-2 rounded-t ${
                            selectedCategory === songCategory.id
                              ? "bg-white border border-b-0"
                              : "bg-gray-200"
                          }`}
                          onClick={() => {
                            setSelectedCategory(songCategory.id);
                            setSelectedArrayIndex(0); // reset al cambiar de categoría
                          }}
                        >
                          {songCategory.nombre}
                        </button>
                      )
                    )}
                    </div>
                    <div className="">
                      
                      <AddRepertorios idRepertorio={selectedCategory} />
                   
                    </div>
                  </div>

                  {/* Subpestañas (índices de los arrays en customSongs) */}
                  <div className="mt-4 flex">
                    <div className="w-5/6">
                    {repertorio?.repertorio_song_category?.find(
                      (cat: any) => cat.id === selectedCategory
                    )?.customSongs?.length > 0 && (
                      <div className="flex gap-2">
                        {repertorio?.repertorio_song_category
                          ?.find((cat: any) => cat.id === selectedCategory)
                          ?.customSongs?.map((_: any, index: number) => (
                            <button
                              key={index}
                              className={`px-3 py-1 rounded ${
                                selectedArrayIndex === index
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200"
                              }`}
                              onClick={() => setSelectedArrayIndex(index)}
                            >
                              {`Grupo ${index + 1}`}
                            </button>
                          ))}
                      </div>
                    )}
                    </div>
                    <div className="w-1/6">
                      <AddSongRepert idRepertorio={conciertoId} />
                    </div>
                  </div>



                  {/* Contenido de la subpestaña seleccionada */}
                  <div className="p-4 border bg-white mt-2">
                    {repertorio?.repertorio_song_category
                      ?.find((cat: any) => cat.id === selectedCategory)
                      ?.customSongs?.[selectedArrayIndex]?.map(
                        (song: any) => (
                          console.log(song),
                          (
                            <div
                              key={song.id}
                              className="p-2 border rounded mb-2 hover:bg-gray-50 cursor-pointer"
                              onClick={() => setSelectedSong(song)}
                            >
                              {song.title}
                            </div>
                          )
                        )
                      )}
                  </div>

                  {/* Vista de letra */}
                  {selectedSong && (
                    <div className="mt-4 p-4 bg-gray-50 rounded border">
                      <h2 className="text-xl font-bold mb-2">
                        {selectedSong.title}
                      </h2>

                      {parseLyrics(selectedSong.lyrics)?.map(
                        (section: any, sectionIdx: number) => (
                          <div key={sectionIdx} className="mb-4">
                            <div className="text-[#4A90E2] font-bold text-lg mb-1">
                              {section.type}
                            </div>

                            {section.lyrics.map(
                              (lyric: any, lineIdx: number) => (
                                <div key={lineIdx}>
                                  {/* Fila de acordes */}
                                  <div className="hidden md:flex">
                                    {Array.from({
                                      length: lyric.text.length,
                                    }).map((_, charIdx) => (
                                      <div
                                        key={charIdx}
                                        className="relative w-[10px] h-4 text-xs text-purple-700 font-semibold text-center"
                                      >
                                        {lyric.chords?.[charIdx] ?? ""}
                                      </div>
                                    ))}
                                  </div>

                                  {/* Línea de texto */}
                                  <div className="whitespace-pre-wrap leading-5 font-sans text-lg pt-1">
                                    {lyric.text}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2"></div>
            </div>
          </div>
        </div>
      ) : (
        <p>Cargando repertorio...</p>
      )}
    </div>
  );
}
