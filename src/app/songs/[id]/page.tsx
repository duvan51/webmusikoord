"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSongById } from "@/lib/api";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import GenerateImage from "@/components/generateImage/generateImage";
import CardSongs from "@/components/cardSongs/cardSongs";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const params = useParams();
  const songId = params?.id as string;

  const [songID, setSongId] = useState<string | null>(null);
  const [songData, setSongData] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  //console.log("songID--->", songID);

  useEffect(() => {
    if (songId) {
      fetchSong();
    }
  }, [songId]);

  const fetchSong = async () => {
    try {
      const response = await getSongById(Number(songId));
      setSongData(response);
      // console.log("Canción:", response);
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
    <div
      className="w-full min-h-screen text-black rounded-lg shadow-md p-6 flex flex-col"
      style={{
        background: "linear-gradient(180deg, #251a4e 0%, #100929 100%)",
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <Breadcrumbs />
      </div>

      {/* Contenido principal con scroll si es necesario */}
      <div className="flex gap-4 min-h-[calc(100vh-96px)]">
        {/* Sección izquierda */}
        <div
          className="w-1/4 bg-white p-4 rounded-xl overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 96px)" }}
        >
          <div className="w-full">
            <div className="mb-4">
              <strong>Fecha de creación:</strong>{" "}
              {new Date(songData.created_at).toLocaleDateString()}
            </div>

            <div className="flex">
              <div className="w-full">
                <h1 className="text-3xl font-bold mb-2">{songData?.name}</h1>
              </div>
            </div>
            <div className="mb-2">
              <strong>Autor:</strong> {songData.autor}
            </div>
            <div className="mb-2">
              <strong>Usuario:</strong> {songData.user?.name}
            </div>

            <div className="mb-2">
              <strong>Categorías:</strong>
              <ul className="list-disc list-inside ml-4">
                {songData.categories.map((cat) => (
                  <li key={cat.id}>{cat.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sección central */}
        <div
          className="w-2/4 bg-white p-4 rounded-xl overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 96px)" }}
        >
          <div className="w-full flex flex-col gap-2 bg-white px-3 py-2 rounded">
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

        {/* Sección derecha */}
        <div
          className="w-1/4 p-2 rounded-xl overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent"
          style={{ maxHeight: "calc(100vh - 96px)" }}
        >
          <CardSongs
            onSelectSong={(id: number) => {
              setSongId(id.toString());
              router.replace(`/songs/${id}`); // actualiza la URL sin navegar
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewSongUnique;
