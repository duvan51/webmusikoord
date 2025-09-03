"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSongById, updateSong } from "@/lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";

export default function EditSongPage() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [autor, setAutor] = useState("");
  const [texts, setTexts] = useState("");
  const [songComplet, setSongComplet] = useState([]);
  const [chordSelector, setChordSelector] = useState(null);
  const [customChord, setCustomChord] = useState("");

  const CHORDS = [
    "C", "Cm", "D", "Dm", "E", "Em", "F", "Fm",
    "G", "Gm", "A", "Am", "B", "Bm",
    "C#", "C#m", "D#", "D#m", "F#", "F#m", "G#", "G#m", "A#", "A#m"
  ];

  const regex = /^(VERSO \d+|CORO|PUENTE|INTRO|OUTRO)/i;

  useEffect(() => {
    if (id) fetchSong();
  }, [id]);

  const fetchSong = async () => {
    try {
      const data = await getSongById(Number(id));
      setName(data.name);
      setAutor(data.autor);
      setSongComplet(data.song);

      let textRebuild = "";
      data.song.forEach((section) => {
        textRebuild += `\n${section.type}\n`;
        section.lyrics.forEach((line) => {
          textRebuild += `${line.text}\n`;
        });
      });
      setTexts(textRebuild.trim());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSong = (text) => {
    setTexts(text);
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    let structuredSong = [];
    let currentSection = null;

    lines.forEach((line) => {
      if (regex.test(line)) {
        const upperLine = line
          .toLowerCase()
          .replace(/^verso \d+/i, (match) => match.toUpperCase())
          .replace(/^coro/i, "CORO")
          .replace(/^puente/i, "PUENTE")
          .replace(/^intro/i, "INTRO")
          .replace(/^outro/i, "OUTRO");
        currentSection = { type: upperLine, lyrics: [] };
        structuredSong.push(currentSection);
      } else if (currentSection) {
        currentSection.lyrics.push({ text: line, chords: [] });
      }
    });

    setSongComplet(structuredSong);
  };

  const handleChordClick = (sectionIdx, lineIdx, charIdx) => {
    setChordSelector({ sectionIdx, lineIdx, charIdx });
    setCustomChord("");
  };

const applyChord = (rawChord) => {
  if (!chordSelector) return;

  setSongComplet((prev) => {
    const updated = [...prev];
    const { sectionIdx, lineIdx, charIdx } = chordSelector;
    const line = updated[sectionIdx].lyrics[lineIdx];

    if (!line.chords || line.chords.length < line.text.length) {
      line.chords = new Array(line.text.length).fill("");
    }

    if (rawChord === null) {
      // Eliminar acorde
      line.chords[charIdx] = "";
    } else {
      // Agregar acorde con formato
      const chord = rawChord.charAt(0).toUpperCase() + rawChord.slice(1);
      line.chords[charIdx] = chord;
    }

    return updated;
  });

  setChordSelector(null);
};

  const handleCustomChordSubmit = () => {
    if (customChord.trim() !== "") {
      applyChord(customChord.trim());
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const result = await updateSong(Number(id), {
        name,
        autor,
        song: songComplet,
      });

      if (result) {
        toast.success("✅ Canción actualizada con éxito");
      } else {
        toast.error("❌ No se pudo actualizar la canción");
      }
    } catch (error) {
      toast.error("❌ Error al actualizar la canción");
      console.error("Update error:", error);
    }
  };

  return (
    <div className="w-full p-4">
      <ToastContainer position="top-right" />
      <Breadcrumbs />

      <div className="flex flex-row py-4 gap-3">
        {/* Formulario */}
        <main className="w-1/2 p-4 bg-white">
          <form onSubmit={handleUpdate} className="flex flex-col gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Título"
              className="px-2 py-1 border rounded"
              required
            />
            <input
              type="text"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              placeholder="Autor"
              className="px-2 py-1 border rounded"
              required
            />
            <textarea
              value={texts}
              onChange={(e) => handleSong(e.target.value)}
              rows={10}
              className="px-2 py-1 border rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded cursor-pointer"
            >
              Actualizar Canción
            </button>
          </form>
        </main>

        {/* Vista previa */}
        <div className="w-1/2 p-4 bg-white overflow-y-auto max-h-[80vh]">
          <div className="text-black text-xl font-bold">{name}</div>
          <div className="text-black text-md mb-2">{autor}</div>

          {songComplet.map((section, sectionIdx) => (
            <div key={sectionIdx} className="mt-4">
              <div className="text-blue-400 font-bold">{section.type}</div>

              {section?.lyrics?.map((lyric, lineIdx) => (
                <div key={lineIdx} className="mb-4">
                  {/* Acordes (bloques de 10px) */}
                  <div className="flex">
                    {Array.from({ length: lyric.text.length }).map((_, charIdx) => (
                      <div
                        key={charIdx}
                        className="w-[10px] h-5 text-xs text-purple-700 font-semibold text-center cursor-pointer border-b hover:text-gray-200"
                        onClick={() =>
                          handleChordClick(sectionIdx, lineIdx, charIdx)
                        }
                      >
                        {lyric.chords?.[charIdx] ?? ""}
                      </div>
                    ))}
                  </div>

                  {/* Letra */}
                  <div className="whitespace-pre-wrap text-gray-800 text-sm font-mono tracking-tight">
                    {lyric.text}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Selector de acordes */}
        {chordSelector && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded max-w-sm w-full">
              <input
                type="text"
                value={customChord}
                onChange={(e) => setCustomChord(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleCustomChordSubmit()
                }
                className="w-full mb-4 px-2 py-1 border rounded"
                placeholder="Ej: G#m"
              />
              <div className="grid grid-cols-4 gap-2">
                {CHORDS.map((ch) => (
                  <button
                    key={ch}
                    onClick={() => applyChord(ch)}
                    className="
                    bg-blue-500 
                    hover:bg-blue-600 
                    text-white 
                    py-1 
                    px-2 
                    rounded"
                  >
                    {ch}
                  </button>
                ))}
              </div>
               <button
                 onClick={() => {
                  applyChord(null); // o removeChord() si quieres manejarlo aparte
                    }}
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded w-full"
                  >
                  Eliminar acorde
                </button>

              <button
                onClick={() => setChordSelector(null)}
                className="mt-4 text-sm text-gray-600 underline"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
