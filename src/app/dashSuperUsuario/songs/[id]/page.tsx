"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSongById } from "@/lib/api";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import GenerateImage from "@/components/generateImage/generateImage";
// Ajusta el tipo correctamente
interface LyricLine {
  text: string;
  chords?: string[];
}

interface Section {
  type: string;
  lyrics: LyricLine[];
}

interface Song {
  id: number;
  autor: string;
  song: Section[];
  categories: { id: number; name: string }[];
  user: { id: number; name: string };
  created_at: string;
}

const ViewSongUnique = () => {
  const params = useParams();
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
      console.log("Canción:", response);
    } catch (error) {
      console.error("Error fetching song:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-6">Cargando canción...</div>;
  }

  if (!songData) {
    return <div className="text-center p-6">No se encontró la canción.</div>;
  }

  return (
    <div className="w-full text-white rounded-lg shadow-md p-4 sm:p-6 bg-gray-900">
      <Breadcrumbs />

      {/* Encabezado y botón de editar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">{songData?.name}</h1>
        <Link
          href={`/dashSuperUsuario/songs/${songData.id}/edit`}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm text-center"
        >
          Editar Canción
        </Link>
      </div>

      {/* Categorías */}
      <div className="mb-2">
        <strong>Categorías:</strong>
        <ul className="list-disc list-inside ml-4">
          {songData.categories.map((cat) => (
            <li key={cat.id}>{cat.name}</li>
          ))}
        </ul>
      </div>

      {/* Autor y Usuario */}
      <div className="mb-2">
        <strong>Autor:</strong> {songData.autor}
      </div>
      <div className="mb-2">
        <strong>Usuario:</strong> {songData.user?.name}
      </div>

      {/* Fecha */}
      <div className="mb-4">
        <strong>Fecha de creación:</strong>{" "}
        {new Date(songData.created_at).toLocaleDateString()}
      </div>

      {/* Letra y acordes adaptados a estilo web exacto */}
      <div className="w-full overflow-x-auto">
        <div className="w-full flex flex-col gap-4 bg-white px-4 py-4 rounded text-black font-mono">
          {songData.song.map((section, sectionIdx) => (
            <div key={sectionIdx}>
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
      </div>

      {/* Imagen generada */}
      <GenerateImage
        name={songData.name}
        author={songData.autor}
        song={songData.song}
      />
    </div>
  );
};

export default ViewSongUnique;
