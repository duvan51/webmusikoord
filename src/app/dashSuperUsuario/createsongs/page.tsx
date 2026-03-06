"use client";

import React, { useState } from "react";
import { createSong } from "@/lib/api";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Music,
  Plus,
  Trash2,
  Save,
  Type,
  User,
  Layers,
  Search,
  X,
  ChevronRight,
  Loader2,
  Eye,
  PenTool
} from "lucide-react";

export default function CreateSongPage() {
  const [name, setName] = useState("");
  const [autor, setAutor] = useState("");
  const [texts, setTexts] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [songComplet, setSongComplet] = useState<
    { type: string; lyrics: { text: string; chords: (string | null)[] }[] }[]
  >([]);
  const [chordSelector, setChordSelector] = useState<{
    sectionIdx: number;
    lineIdx: number;
    charIdx: number;
  } | null>(null);
  const [customChord, setCustomChord] = useState("");

  const CHORDS = [
    "C", "Cm", "D", "Dm", "E", "Em", "F", "Fm", "G", "Gm", "A", "Am", "B", "Bm",
    "C#", "C#m", "D#", "D#m", "F#", "F#m", "G#", "G#m", "A#", "A#m"
  ];

  const SECTION_REGEX = /^(VERSO \d+|CORO|PUENTE|INTRO|OUTRO)/i;

  const handleSong = (text: string) => {
    setTexts(text);
    const lines = text.split("\n").map(l => l.trim()).filter(l => l !== "");

    let structuredSong: any[] = [];
    let currentSection: any = null;

    lines.forEach((line) => {
      if (SECTION_REGEX.test(line)) {
        const type = line.toUpperCase();
        currentSection = { type, lyrics: [] };
        structuredSong.push(currentSection);
      } else if (currentSection) {
        currentSection.lyrics.push({ text: line, chords: [] });
      }
    });

    setSongComplet(structuredSong);
  };

  const addSection = (label: string) => {
    const newText = texts ? `${texts}\n\n${label}\n` : `${label}\n`;
    handleSong(newText);
  };

  const applyChord = (chord: string | null) => {
    if (!chordSelector) return;
    const { sectionIdx, lineIdx, charIdx } = chordSelector;

    setSongComplet(prev => {
      const updated = [...prev];
      const lyricsLine = updated[sectionIdx].lyrics[lineIdx];
      const charCount = lyricsLine.text.length;

      if (!lyricsLine.chords || lyricsLine.chords.length !== charCount) {
        lyricsLine.chords = new Array(charCount).fill(null);
      }

      lyricsLine.chords[charIdx] = chord;
      return updated;
    });
    setChordSelector(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !autor || songComplet.length === 0) {
      toast.warning("Por favor completa los datos de la canción");
      return;
    }

    setIsSaving(true);
    try {
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
        toast.error("❌ Error al crear la canción");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error en el servidor");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ToastContainer position="top-right" theme="dark" />
      <Breadcrumbs />

      {/* Header / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary ring-1 ring-primary/20">
              <Plus size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Crear Canción</h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)] opacity-60 font-medium">Define la letra y estructura de acordes para el catálogo maestro.</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Guardar Canción
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Left: Editor */}
        <div className="space-y-6">
          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[2.5rem] p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <Type size={18} className="text-primary" />
              <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40">Metadatos y Letra</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40 ml-4">Título</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary/40 group-focus-within:text-primary transition-colors">
                    <Music size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Ej: Te Amo Dios..."
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl focus:border-primary/40 outline-none transition-all font-bold"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40 ml-4">Autor / Artista</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary/40 group-focus-within:text-primary transition-colors">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Ej: Danilo Montero..."
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl focus:border-primary/40 outline-none transition-all font-bold"
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40 ml-4">Editor de Letra</label>
                <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
                  {["INTRO", "VERSO 1", "CORO", "PUENTE"].map((lbl) => (
                    <button
                      key={lbl}
                      onClick={() => addSection(lbl)}
                      className="px-3 py-1.5 rounded-lg hover:bg-white/10 text-[9px] font-black text-primary uppercase tracking-widest transition-all"
                    >
                      + {lbl}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Escribe o pega la letra aquí. Usa mayúsculas para las secciones (ej: VERSO 1, CORO)..."
                className="w-full h-[350px] p-6 bg-white/5 border border-white/5 rounded-3xl focus:border-primary/40 outline-none transition-all font-mono text-sm leading-relaxed resize-none custom-scrollbar"
                value={texts}
                onChange={(e) => handleSong(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right: Preview & Chord Layering */}
        <div className="space-y-6">
          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[2.5rem] p-8 h-full min-h-[500px] flex flex-col shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Eye size={18} className="text-primary" />
                <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40">Preview Interactivo</h2>
              </div>
              <div className="text-[10px] font-black text-primary uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                Modo Edición Activo
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-8 relative z-10">
              {songComplet.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                  <PenTool size={64} className="mb-4" />
                  <p className="text-sm font-black uppercase tracking-widest">Empieza a escribir letra para poner acordes</p>
                </div>
              ) : (
                songComplet.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                      <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/5 px-4 py-1.5 rounded-xl border border-primary/10">{section.type}</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                    </div>
                    <div className="space-y-8">
                      {section.lyrics.map((line, lIdx) => (
                        <div key={lIdx} className="relative group/line">
                          {/* Chords Layer */}
                          <div className="flex flex-wrap min-h-[1.5rem] mb-1">
                            {line.text.split("").map((char, cIdx) => (
                              <div
                                key={cIdx}
                                onClick={() => setChordSelector({ sectionIdx: sIdx, lineIdx: lIdx, charIdx: cIdx })}
                                className={`w-[1ch] h-6 flex items-center justify-center text-[11px] font-black cursor-pointer rounded-sm hover:bg-primary/20 transition-all ${line.chords?.[cIdx] ? 'text-primary' : 'text-transparent'}`}
                              >
                                {line.chords?.[cIdx] || "|"}
                              </div>
                            ))}
                          </div>
                          {/* Text Layer */}
                          <div className="text-base font-medium tracking-wide text-[var(--text-primary)]">
                            {line.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
          </div>
        </div>
      </div>

      {/* Chord Selector Modal */}
      {chordSelector && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setChordSelector(null)}></div>
          <div className="relative bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[3rem] p-8 md:p-10 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Search size={20} className="text-primary" />
                <h2 className="font-black text-xl text-[var(--text-primary)] tracking-tight">Seleccionar Acorde</h2>
              </div>
              <button onClick={() => setChordSelector(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6">
              <input
                type="text"
                autoFocus
                placeholder="Escribe (ej: G#m7)..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-primary/40 font-bold"
                value={customChord}
                onChange={(e) => setCustomChord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyChord(customChord)}
              />

              <div className="grid grid-cols-4 gap-2">
                {CHORDS.map(ch => (
                  <button
                    key={ch}
                    onClick={() => applyChord(ch)}
                    className="py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-primary hover:text-white transition-all text-xs font-black"
                  >
                    {ch}
                  </button>
                ))}
              </div>

              <button
                onClick={() => applyChord(null)}
                className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 size={14} className="inline mr-2" /> Eliminar Acorde
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
