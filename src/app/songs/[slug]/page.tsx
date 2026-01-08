"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSongById } from "@/lib/api";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import CardSongs from "@/components/cardSongs/cardSongs";
import MultitrackAudioEditor from "@/components/MultitrackPlayers/MultiTrackPlayer";
import "./ViewSongUnique.css";

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
  name: string;
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
  const slug = params?.slug as string;
  const songId = slug.split("-").pop(); 

  const [songData, setSongData] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [multitrackCenter, setMultitrackCenter] = useState(false);
  const [showRightSection, setShowRightSection] = useState(true);
  const [modoTeatro, setModoTeatro] = useState(false);
  const teatroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (songId) fetchSong();
  }, [songId]);

  useEffect(() => {
  if (songData?.name) {
    document.title = `${songData.name} | Musikoord`;
  }
}, [songData]);





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

  const toggleFullScreen = async () => {
    if (!document.fullscreenElement && teatroRef.current) {
      if (teatroRef.current.requestFullscreen) {
        await teatroRef.current.requestFullscreen();
      } else if ((teatroRef.current as any).webkitRequestFullscreen) {
        await (teatroRef.current as any).webkitRequestFullscreen();
      }
    } else if (document.exitFullscreen) {
      await document.exitFullscreen();
    }
  };

  const toggleModoTeatro = async () => {
    const nuevoEstado = !modoTeatro;
    setModoTeatro(nuevoEstado);
    if (nuevoEstado) {
      await toggleFullScreen();
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

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
      {!modoTeatro && (
        <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          {/* Breadcrumbs */}
          <div className="w-full sm:w-auto">
            <Breadcrumbs />
          </div>

          {/* Botones */}
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setMultitrackCenter(!multitrackCenter)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm md:text-base transition w-full sm:w-auto"
            >
              {multitrackCenter
                ? "📜 Ver Letra en el centro"
                : "🎚️ Ver Multitrack en el centro"}
            </button>

            <button
              onClick={() => setShowRightSection(!showRightSection)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm md:text-base transition w-full sm:w-auto"
            >
              {showRightSection
                ? "➖ Ocultar Sección Derecha"
                : "➕ Mostrar Sección Derecha"}
            </button>

            <button
              onClick={toggleModoTeatro}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm md:text-base transition w-full sm:w-auto"
            >
              🎬 Modo Teatro
            </button>
          </div>
        </div>
      )}

      {!modoTeatro ? (
        <div
          className={`flex flex-col ${
            showRightSection ? "lg:flex-row" : "lg:flex-row"
          } gap-4 min-h-[calc(100vh-96px)] transition-all duration-500`}
        >
          {/* 📄 Panel Izquierdo */}
          <div
            className={`${
              showRightSection ? "lg:w-1/4" : "lg:w-1/2"
            } bg-white p-4 rounded-xl overflow-y-auto`}
            style={{ maxHeight: "calc(100vh - 96px)" }}
          >
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

            {/* 🎵 Letra con acordes */}
            <div className="song-scroll-container bg-white rounded">
              {songData.song.map((section, sectionIdx) => (
                <div key={sectionIdx} className="song-section">
                  <div className="text-[#4A90E2] font-bold text-lg mb-1">
                    {section.type}
                  </div>

                  {section.lyrics.map((lyric, lineIdx) => (
                    <div key={lineIdx} className="mb-4">
                      <div className="song-line">
                        {Array.from({ length: lyric.text.length }).map(
                          (_, charIdx) => (
                            <div key={charIdx} className="chord-block">
                              {lyric.chords?.[charIdx] ?? ""}
                            </div>
                          )
                        )}
                      </div>
                      <div className="lyric-text">{lyric.text}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 🎧 Panel derecho */}
          <div
            className={`${
              showRightSection ? "flex-1" : "lg:w-1/2"
            } bg-white p-4 rounded-xl overflow-y-auto transition-all duration-500`}
            style={{ maxHeight: "calc(100vh - 96px)" }}
          >
            <div className="h-full" onDoubleClick={handleDoubleClick}>
              <MultitrackAudioEditor tracks={songData.tracks || []} />
            </div>
          </div>

          {/* 🎵 Canciones relacionadas */}
          {showRightSection && (
            <div
              className="lg:w-1/4 p-2 rounded-xl overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent"
              style={{ maxHeight: "calc(100vh - 96px)" }}
            >
              <CardSongs
                onSelectSong={(id) => {
                  router.replace(`/songs/${id}`);
                }}
              />
            </div>
          )}
        </div>
      ) : (
        /* 🎭 MODO TEATRO */
        <div className="modo-teatro-contenedor">
          <button onClick={toggleModoTeatro} className="salir-teatro">
            ✖ Salir del modo teatro
          </button>

          <div className="teatro-col izquierda">
            <MultitrackAudioEditor tracks={songData.tracks || []} />
          </div>

          <div className="teatro-col derecha ">
            {songData.song.map((section, idx) => (
              <div key={idx} className="song-section">
                <div className="text-[#4A90E2] font-bold text-lg mb-1">
                  {section.type}
                </div>
                {section.lyrics.map((line, lineIdx) => (
                  <div key={lineIdx} className="mb-4">
                    <div className="song-line">
                      {Array.from({ length: line.text.length }).map((_, i) => (
                        <div key={i} className="chord-block">
                          {line.chords?.[i] ?? ""}
                        </div>
                      ))}
                    </div>
                    <div className="lyric-text">{line.text}</div>
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
