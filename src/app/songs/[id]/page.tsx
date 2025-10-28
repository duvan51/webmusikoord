"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSongById } from "@/lib/api";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import CardSongs from "@/components/cardSongs/cardSongs";
import MultitrackAudioEditor from "@/components/MultitrackPlayers/MultiTrackPlayer";
import "./ViewSongUnique.css"; // 🎭 Estilos del modo teatro aquí

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
  tracks: Track[];
}

const ViewSongUnique = () => {
  const router = useRouter();
  const params = useParams();
  const songId = params?.id as string;

  const [songID, setSongId] = useState<string | null>(null);
  const [songData, setSongData] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [multitrackCenter, setMultitrackCenter] = useState(false);
  const [showRightSection, setShowRightSection] = useState(true);
  const [modoTeatro, setModoTeatro] = useState(false); // 🎭 NUEVO estado
  const teatroRef = useRef<HTMLDivElement>(null); // 🔁 referencia para fullscreen

  useEffect(() => {
    if (songId) fetchSong();
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

  // 🧠 Fullscreen control
  const toggleFullScreen = async () => {
    if (!document.fullscreenElement && teatroRef.current) {
      // Entra al modo fullscreen
      if (teatroRef.current.requestFullscreen) {
        await teatroRef.current.requestFullscreen();
      } else if ((teatroRef.current as any).webkitRequestFullscreen) {
        (teatroRef.current as any).webkitRequestFullscreen();
      }
    } else if (document.exitFullscreen) {
      // Sale del modo fullscreen
      await document.exitFullscreen();
    }
  };

  // 🎭 Función para alternar modo teatro + fullscreen
  const toggleModoTeatro = async () => {
    const nuevoEstado = !modoTeatro;
    setModoTeatro(nuevoEstado);
    if (nuevoEstado) {
      await toggleFullScreen();
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  // 🎭 Doble clic en el multitrack también activa el modo teatro
  const handleDoubleClick = async () => {
    setModoTeatro(true);
    await toggleFullScreen();
  };

  if (loading)
    return <div className="text-center p-6">Cargando canción...</div>;
  if (!songData)
    return <div className="text-center p-6">No se encontró la canción.</div>;

  return (
    <div
      ref={teatroRef}
      className={`w-full min-h-screen text-black rounded-lg shadow-md p-4 sm:p-6 md:p-8 flex flex-col ${
        modoTeatro ? "modo-teatro" : ""
      }`}
      style={{
        background: modoTeatro
          ? "#000"
          : "linear-gradient(180deg, #251a4e 0%, #100929 100%)",
      }}
    >
      {/* Header */}
      {!modoTeatro && (
        <div className="mb-4 flex justify-between items-center">
          <Breadcrumbs />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMultitrackCenter(!multitrackCenter)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm sm:text-base transition"
            >
              {multitrackCenter
                ? "📜 Ver Letra en el centro"
                : "🎚️ Ver Multitrack en el centro"}
            </button>

            <button
              onClick={() => setShowRightSection(!showRightSection)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md text-sm sm:text-base transition"
            >
              {showRightSection
                ? "➖ Ocultar Sección Derecha"
                : "➕ Mostrar Sección Derecha"}
            </button>

            {/* 🎭 BOTÓN MODO TEATRO */}
            <button
              onClick={toggleModoTeatro}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm sm:text-base transition"
            >
              🎬 Modo Teatro
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {!modoTeatro ? (
        <>
          <div
            className={`flex flex-col ${
              showRightSection ? "lg:flex-row" : "lg:flex-row"
            } gap-4 min-h-[calc(100vh-96px)] transition-all duration-500`}
          >
            {/* 🧭 Sección izquierda */}
            <div
              className={`${
                showRightSection ? "lg:w-1/4" : "lg:w-1/2"
              } bg-white p-4 rounded-xl overflow-y-auto`}
              style={{ maxHeight: "calc(100vh - 96px)" }}
            >
              <div className="w-full">
                <div className="mb-4 text-sm text-gray-600">
                  <strong>Fecha de creación:</strong>{" "}
                  {new Date(songData.created_at).toLocaleDateString()}
                </div>

                <h1 className="text-2xl font-bold mb-2">{songData?.name}</h1>
                <div className="mb-2 text-sm">
                  <strong>Autor:</strong> {songData.autor}
                </div>
                <div className="mb-2 text-sm">
                  <strong>Usuario:</strong> {songData.user?.name}
                </div>

                <div className="mb-4 text-sm">
                  <strong>Categorías:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {songData.categories.map((cat) => (
                      <li key={cat.id}>{cat.name}</li>
                    ))}
                  </ul>
                </div>

                {/* 🎧 Multitrack o Letra */}
                {multitrackCenter ? (
                  <div className="w-full flex flex-col gap-2 bg-white px-3 py-2 rounded">
                    {songData.song.map((section, sectionIdx) => (
                      <div key={sectionIdx}>
                        <div className="text-[#4A90E2] font-bold text-lg mb-1">
                          {section.type}
                        </div>
                        {section.lyrics.map((lyric, lineIdx) => (
                          <div key={lineIdx}>
                            <div className="hidden md:flex">
                              {Array.from({ length: lyric.text.length }).map(
                                (_, charIdx) => (
                                  <div
                                    key={charIdx}
                                    className="relative w-[10px] h-4 text-xs text-purple-700 font-semibold text-center"
                                  >
                                    {lyric.chords?.[charIdx] ?? ""}
                                  </div>
                                )
                              )}
                            </div>
                            <div className="whitespace-pre-wrap leading-5 text-lg pt-1">
                              {lyric.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-2" onDoubleClick={handleDoubleClick}>
                    <strong>Multitrack:</strong>
                    <div className="mt-2">
                      <MultitrackAudioEditor tracks={songData.tracks || []} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 🎵 Sección central */}
            <div
              className={`${
                showRightSection ? "flex-1" : "lg:w-1/2"
              } bg-white p-4 rounded-xl overflow-y-auto transition-all duration-500`}
              style={{ maxHeight: "calc(100vh - 96px)" }}
            >
              {multitrackCenter ? (
                <div className="h-full" onDoubleClick={handleDoubleClick}>
                  <MultitrackAudioEditor tracks={songData.tracks || []} />
                </div>
              ) : (
                <div className="w-full flex flex-col gap-2 bg-white px-3 py-2 rounded">
                  {songData.song.map((section, sectionIdx) => (
                    <div key={sectionIdx}>
                      <div className="text-[#4A90E2] font-bold text-lg mb-1">
                        {section.type}
                      </div>
                      {section.lyrics.map((lyric, lineIdx) => (
                        <div key={lineIdx}>
                          <div className="hidden md:flex">
                            {Array.from({ length: lyric.text.length }).map(
                              (_, charIdx) => (
                                <div
                                  key={charIdx}
                                  className="relative w-[10px] h-4 text-xs text-purple-700 font-semibold text-center"
                                >
                                  {lyric.chords?.[charIdx] ?? ""}
                                </div>
                              )
                            )}
                          </div>
                          <div className="whitespace-pre-wrap leading-5 text-lg pt-1">
                            {lyric.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 🎶 Sección derecha */}
            {showRightSection && (
              <div
                className="lg:w-1/4 p-2 rounded-xl overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent"
                style={{ maxHeight: "calc(100vh - 96px)" }}
              >
                <CardSongs
                  onSelectSong={(id) => {
                    setSongId(id.toString());
                    router.replace(`/songs/${id}`);
                  }}
                />
              </div>
            )}
          </div>

          {!showRightSection && (
            <div className="w-full mt-4 p-2 rounded-xl bg-white">
              <CardSongs
                onSelectSong={(id) => {
                  setSongId(id.toString());
                  router.replace(`/songs/${id}`);
                }}
              />
            </div>
          )}
        </>
      ) : (
        /* 🎭 MODO TEATRO FULLSCREEN */
        <div className="modo-teatro-contenedor">
          <button onClick={toggleModoTeatro} className="salir-teatro">
            ✖ Salir del modo teatro
          </button>

          <div className="teatro-col izquierda">
            <MultitrackAudioEditor tracks={songData.tracks || []} />
          </div>

          <div className="teatro-col derecha">
            {songData.song.map((section, idx) => (
              <div key={idx} className="mb-3">
                <div className="text-[#4A90E2] font-bold text-lg mb-1">
                  {section.type}
                </div>
                {section.lyrics.map((line, lineIdx) => (
                  <div key={lineIdx}>
                    <div className="hidden md:flex">
                      {Array.from({ length: line.text.length }).map((_, i) => (
                        <div
                          key={i}
                          className="relative w-[10px] h-4 text-xs text-purple-700 font-semibold text-center"
                        >
                          {line.chords?.[i] ?? ""}
                        </div>
                      ))}
                    </div>
                    <div className="whitespace-pre-wrap leading-5 text-lg pt-1 text-white">
                      {line.text}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSongUnique;
