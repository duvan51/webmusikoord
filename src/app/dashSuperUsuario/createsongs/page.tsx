"use client";
import React, { useState } from "react";
import { createSong } from "@/lib/api";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DashSuperUsuario() {
  const [name, setName] = useState("");
  const [autor, setAutor] = useState("");
  const [texts, setTexts] = useState("");
  const [songComplet, setSongComplet] = useState<
    { type: string; lyrics: { text: string; chords: string[] }[] }[]
  >([]);
  const [chordSelector, setChordSelector] = useState<{
    sectionIdx: number;
    lineIdx: number;
    wordIdx: number;
  } | null>(null);
  const [customChord, setCustomChord] = useState("");

  const CHORDS = [
    "C",
    "Cm",
    "D",
    "Dm",
    "E",
    "Em",
    "F",
    "Fm",
    "G",
    "Gm",
    "A",
    "Am",
    "B",
    "Bm",
    "C#",
    "C#m",
    "D#",
    "D#m",
    "F#",
    "F#m",
    "G#",
    "G#m",
    "A#",
    "A#m",
  ];

  const regex = /^(VERSO \d+|CORO|PUENTE|INTRO|OUTRO)/i;

  const handleSong = (text: string) => {
    setTexts(text);
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    let structuredSong: {
      type: string;
      lyrics: { text: string; chords: string[] }[];
    }[] = [];

    let currentSection: any = null;

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

  const addText = (newText: string) => {
    setTexts((prevText) => {
      const updatedText = prevText + `\n${newText}`;
      handleSong(updatedText);
      return updatedText;
    });
  };

  const handleSelectChord = (
    sectionIdx: number,
    lineIdx: number,
    wordIdx: number
  ) => {
    setChordSelector({ sectionIdx, lineIdx, wordIdx });
    setCustomChord("");
  };

  const applyChord = (rawChord: string) => {
    if (!chordSelector) return;

    const chord =
      rawChord.charAt(0).toUpperCase() + rawChord.slice(1).toLowerCase();

    setSongComplet((prev) => {
      const updated = [...prev];
      const { sectionIdx, lineIdx, wordIdx } = chordSelector;
      const lyricsLine = updated[sectionIdx].lyrics[lineIdx];

      const charCount = lyricsLine.text.length;
      if (!lyricsLine.chords || lyricsLine.chords.length !== charCount) {
        lyricsLine.chords = new Array(charCount).fill(null);
      }
      lyricsLine.chords[wordIdx] = chord;
      return updated;
    });

    setChordSelector(null);
  };

  const handleCustomChordSubmit = () => {
    if (customChord.trim() !== "") {
      applyChord(customChord.trim());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await createSong({
      name,
      autor,
      song: songComplet,
    });

    if (result) {
      toast.success("✅ Canción creada con éxito");
      setName("");
      setAutor("");
      setTexts("");
      setSongComplet([]);
    } else {
      toast.error("❌ No se pudo crear la canción");
    }
  };

  return (
    <div>
      <Breadcrumbs />
      <ToastContainer position="top-right" />
      <header className="flex justify-between items-center px-8 py-6">
        <div className="text-white text-2xl font-bold">Musikoord</div>
        <button className="bg-white text-[#251a4e] px-4 py-2 rounded shadow hover:bg-gray-200 transition">
          Iniciar sesión
        </button>
      </header>

      <div className="flex flex-row py-4 gap-3 px-2">
        <main className="w-1/2 p-4 bg-white">
          <div className="bg-white bg-opacity-10 rounded-xl shadow-lg w-full">
            <h2 className="text-xl font-semibold mb-4">¡Explora Musikoord!</h2>
            <p className="mb-6">
              Descubre, organiza y disfruta tu música favorita en una sola app.
            </p>
            <button className="bg-[#251a4e] text-white px-4 py-2 rounded hover:bg-[#100929] transition mb-4">
              Probar ahora
            </button>

            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
              <input
                className="w-full mb-2 px-3 py-2 rounded bg-white text-[#251a4e] border"
                type="text"
                placeholder="Titulo de canción"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="w-full mb-2 px-3 py-2 rounded bg-white text-[#251a4e] border"
                type="text"
                placeholder="Autor"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                required
              />
              <div className="flex gap-2 mb-2">
                {["Verso 1", "Coro", "Puente"].map((label) => (
                  <button
                    type="button"
                    key={label}
                    className="bg-[#251a4e] text-white px-2 py-1 rounded"
                    onClick={() => addText(label)}
                  >
                    Agregar {label}
                  </button>
                ))}
              </div>
              <textarea
                className="w-full mb-4 px-3 py-2 rounded bg-white text-[#251a4e] border"
                rows={6}
                placeholder="Escribe la letra aquí..."
                value={texts}
                onChange={(e) => handleSong(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-[#251a4e] text-white px-4 py-2 rounded hover:bg-[#100929] transition cursor-pointer"
              >
                Guardar Canción
              </button>
            </form>
          </div>
        </main>

        <div className="w-1/2 p-4 bg-white">
          <div className="text-black text-lg font-bold">{name}</div>
          <div className="text-black text-md mb-2">{autor}</div>
          <div className="w-full flex">
            <div className="w-full flex flex-col gap-2 bg-white px-1 overflow-x-auto">
              {songComplet.map((section, sectionIdx) => (
                <div key={sectionIdx} className="mt-4">
                  <div className="text-[#4A90E2] font-bold">{section.type}</div>

                  {section.lyrics.map((lyric, lineIdx) => (
                    <div key={lineIdx} className="mb-2">
                      {/* Línea de acordes solo para escritorio */}
                      <div className="hidden md:flex">
                        {Array.from({ length: lyric.text.length }).map(
                          (_, charIdx) => (
                            <div
                              key={charIdx}
                              className="w-[14px] h-4 text-xs text-purple-700 font-semibold text-center cursor-pointer"
                              onClick={() =>
                                handleSelectChord(sectionIdx, lineIdx, charIdx)
                              }
                            >
                              {lyric.chords?.[charIdx] ?? ""}
                            </div>
                          )
                        )}
                      </div>

                      {/* Línea de texto normal */}
                      <div className="whitespace-pre-wrap text-base">
                        {lyric.text}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {/** 
            <div className="w-1/4 px-2">
              {CHORDS.slice(0, 7).map((chord, idx) => (
                <div key={idx} className="text-[#251a4e] text-xl mb-1">
                  {chord}
                </div>
              ))}
            </div>
*/}
          </div>
        </div>
      </div>

      {chordSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">
              Selecciona o escribe un acorde
            </h2>
            <input
              type="text"
              placeholder="Ej: G#m, Dsus4..."
              className="w-full mb-3 px-3 py-2 border rounded"
              value={customChord}
              onChange={(e) => setCustomChord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCustomChordSubmit();
              }}
            />
            <div className="grid grid-cols-4 gap-2">
              {CHORDS.map((ch) => (
                <button
                  key={ch}
                  onClick={() => applyChord(ch)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
                >
                  {ch}
                </button>
              ))}
            </div>
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
  );
}
