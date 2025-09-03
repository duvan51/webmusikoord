"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Youtube from "@/components/videos/youtube";

export default function RepertorioPage() {
  const { id } = useParams();
  const [repertorio, setRepertorio] = useState(null);
  const [selectSong, setSelectedSong] = useState(null);

  useEffect(() => {
    if (id) {
      axios
        .get(`https://api.musikoord.com/api/repertorios/${id}`)
        .then((res) => {
          setRepertorio(res.data);
        })
        .catch((err) => {
          console.error("Error al cargar repertorio:", err);
        });
    }
  }, [id]);

  if (!repertorio) return <p>Cargando repertorio...</p>;

  console.log(selectSong);

  return (
    <div
      className="p-6 min-h-screen text-white"
      style={{
        background: "linear-gradient(180deg, #251a4e 0%, #100929 100%)",
      }}
    >
      <h1 className="text-3xl font-bold">{repertorio.nombre}</h1>
      <p className="text-gray-300">Fecha: {repertorio.fecha}</p>

      <div className="mt-4">
        <h2 className="text-xl font-semibold">Grupo:</h2>
        <p>{repertorio.group?.nombre}</p>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Categorías y Canciones:</h2>

        <div className="w-full flex gap-4">
          <div className="w-2/3">
            <div className="w-full flex gap-2">
              <div className="w-4/5 bg-white rounded-lg text-black">
                {selectSong ? (
          <div>
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">
              {selectSong.title}
            </h2>

            {(JSON.parse(selectSong.lyrics || "[]")).map(
              (section, sectionIdx) => (
                <div key={sectionIdx} className="mb-6">
                  <div className="text-[#4A90E2] font-bold text-lg mb-2">
                    {section.type}
                  </div>

                  {section.lyrics.map((lyric, lineIdx) => (
                    <div key={lineIdx} className="mb-2">
                      {/* Acordes arriba */}
                      <div className="hidden md:flex">
                        {Array.from({ length: lyric.text.length }).map(
                          (_, charIdx) => (
                            <div
                              key={charIdx}
                              className="text-xm relative w-[10px] h-4 text-purple-700 font-semibold text-center overflow-visible"
                            >
                              {lyric.chords?.[charIdx] ?? ""}
                            </div>
                          )
                        )}
                      </div>

                      {/* Letra */}
                      <div className="pt-2 whitespace-pre-wrap leading-5 font-sans text-xm max-h-[200px] overflow-y-auto">
                        {lyric.text}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            Selecciona una canción para ver su contenido
          </p>
        )}
              </div>
              <div className="w-1/5">
                {repertorio.repertorio_song_category?.map((cat) => (
                  <div
                    key={cat.id}
                    className="mb-4 text-black border border-white p-4 rounded shadow bg-white bg-opacity-10"
                  >
                    <h3 className="text-lg font-bold mb-2">{cat.nombre}</h3>

                    {cat.customSongs?.length > 0 ? (
                      <ul className="list-disc ml-5">
                        {cat.customSongs.map((versionsArray, i) => {
                          const firstVersion = versionsArray[0];
                          return (
                            <li
                              key={i}
                              className="cursor-pointer hover:text-yellow-300"
                              onClick={() => setSelectedSong(firstVersion)} // Solo guardamos la versión que se muestra
                            >
                              <strong>{firstVersion.title}</strong>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-gray-400">
                        No hay canciones en esta categoría.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-1/3">
            <Youtube />
          </div>
        </div>
      </div>
    </div>
  );
}
