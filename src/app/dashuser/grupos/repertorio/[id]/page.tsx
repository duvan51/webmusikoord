"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { repertoriosById, createCustomSong, updateCustomSong } from "@/lib/api";
import { getFromStorage } from "@/utils/storage";
import {
    Music,
    ChevronLeft,
    Calendar,
    Users,
    ChevronDown,
    ChevronRight,
    Maximize2,
    Minimize2,
    Video,
    Plus,
    UserCircle,
    CheckCircle2,
    Copy,
    Loader2,
    Edit2,
    Save,
    X,
    Settings
} from "lucide-react";
import Youtube from "@/components/videos/youtube";
import { toast } from "react-toastify";

const CHORDS = [
    "C", "Cm", "D", "Dm", "E", "Em", "F", "Fm",
    "G", "Gm", "A", "Am", "B", "Bm",
    "C#", "C#m", "D#", "D#m", "F#", "F#m", "G#", "G#m", "A#", "A#m",
    "7", "maj7", "m7", "sus2", "sus4", "add9", "/"
];

const SECTION_REGEX = /^(VERSO \d+|CORO \d+|CORO|PUENTE|INTRO|OUTRO|SOLO|INSTRUMENTAL)/i;

export default function RepertorioDetallePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [repertorio, setRepertorio] = useState<any>(null);
    const [selectedSongVersions, setSelectedSongVersions] = useState<any[]>([]);
    const [selectedSong, setSelectedSong] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedSongCategoryId, setSelectedSongCategoryId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isCreatingVersion, setIsCreatingVersion] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedLyrics, setEditedLyrics] = useState("");
    const [songComplet, setSongComplet] = useState<any[]>([]);
    const [chordSelector, setChordSelector] = useState<any>(null);
    const [customChord, setCustomChord] = useState("");
    const [editedKey, setEditedKey] = useState("");
    const [editedBpm, setEditedBpm] = useState<number>(0);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        const storedUser = getFromStorage<any>("user");
        if (storedUser) {
            setUserData(storedUser);
            if (id) loadRepertorio(storedUser);
        } else if (id) {
            loadRepertorio();
        }
    }, [id]);

    const loadRepertorio = (currentUser?: any) => {
        setIsLoading(true);
        const activeUser = currentUser || userData || getFromStorage<any>("user");
        const token = activeUser?.access_token;

        repertoriosById(Number(id), token)
            .then((data) => {
                setRepertorio(data);
                if (data.repertorio_song_category?.length > 0) {
                    const firstCat = data.repertorio_song_category[0];
                    setSelectedCategory(Number(firstCat.id));
                    if (firstCat.customSongs?.[0]) {
                        handleSongSelect(firstCat.customSongs[0], Number(firstCat.id), activeUser);
                    }
                }
            })
            .catch((err) => console.error("Error al cargar repertorio:", err))
            .finally(() => setIsLoading(false));
    };

    const rebuildLyricsText = (structuredArray: any[]) => {
        if (!Array.isArray(structuredArray)) return "";
        let textRebuild = "";
        structuredArray.forEach((section) => {
            textRebuild += `${section.type}\n`;
            section.lyrics.forEach((line: any) => {
                textRebuild += `${line.text}\n`;
            });
            textRebuild += "\n";
        });
        return textRebuild.trim();
    };

    const parseLyricsToStructure = (text: string, existingStructure?: any[]) => {
        const lines = text.split("\n").map(l => l.trim()).filter(l => l !== "");
        const existingLinesPool = existingStructure
            ? existingStructure.flatMap(s => s.lyrics.map((l: any) => ({ ...l })))
            : [];

        let structuredSong: any[] = [];
        let currentSection: any = null;
        let poolSearchIndex = 0;

        lines.forEach((line) => {
            if (SECTION_REGEX.test(line)) {
                const type = line.toUpperCase();
                currentSection = { type, lyrics: [] };
                structuredSong.push(currentSection);
            } else if (currentSection) {
                let match = null;
                for (let i = poolSearchIndex; i < existingLinesPool.length; i++) {
                    if (existingLinesPool[i].text === line) {
                        match = existingLinesPool[i];
                        poolSearchIndex = i + 1;
                        break;
                    }
                }
                if (!match) {
                    match = existingLinesPool.find(ex => ex.text === line);
                }

                if (match) {
                    currentSection.lyrics.push({
                        text: line,
                        chords: Array.isArray(match.chords) ? [...match.chords] : []
                    });
                } else {
                    currentSection.lyrics.push({ text: line, chords: [] });
                }
            }
        });
        return structuredSong;
    };

    const handleSongSelect = (songsArray: any[], categoryId: number, currentUser?: any) => {
        if (songsArray && songsArray.length > 0) {
            setSelectedSongVersions(songsArray);
            setSelectedSongCategoryId(categoryId);
            setIsEditing(false);

            const activeUser = currentUser || userData || getFromStorage<any>("user");
            const currentUserId = activeUser?.user?.id;

            const userVersion = songsArray.find(s => {
                const ownerId = s.user_id || s.user?.id;
                return Number(ownerId) === Number(currentUserId);
            });

            const targetSong = userVersion || songsArray[0];
            setSelectedSong(targetSong);

            // Inicializar estados de edición
            let parsed = [];
            try {
                parsed = JSON.parse(targetSong.lyrics);
            } catch (e) {
                parsed = parseLyricsToStructure(targetSong.lyrics || "");
            }

            setSongComplet(parsed);
            setEditedLyrics(rebuildLyricsText(parsed));
            setEditedKey(targetSong.key || "C");
            setEditedBpm(targetSong.bpm || 0);
        }
    };

    const handleCreateMyVersion = async () => {
        if (!selectedSong) return;
        if (!userData?.user?.id) {
            toast.error("Debes iniciar sesión para crear tu versión");
            return;
        }

        setIsCreatingVersion(true);
        try {
            const token = userData.access_token;
            const originalSongId = selectedSong.original_song_id || selectedSong.song_id || selectedSong.id;

            const newVersionData = {
                title: selectedSong.title,
                lyrics: selectedSong.lyrics,
                key: selectedSong.key || "C",
                bpm: selectedSong.bpm || 0,
                user_id: Number(userData.user.id),
                repertorio_id: Number(id),
                repertorio_song_category_id: selectedSongCategoryId ? Number(selectedSongCategoryId) : null,
                song_id: Number(originalSongId),
            };

            const response = await createCustomSong(newVersionData, token);

            // --- GUARDAMOS EN EL "RECUERDO" LOCAL ---
            if (response && response.id) {
                const ownedIds = JSON.parse(localStorage.getItem('my_owned_songs') || '[]');
                ownedIds.push(Number(response.id));
                localStorage.setItem('my_owned_songs', JSON.stringify(ownedIds));
                console.log("💾 ID Guardado en memoria local:", response.id);
            }
            // ----------------------------------------

            toast.success("¡Tu versión ha sido creada con éxito!");
            loadRepertorio();
        } catch (error: any) {
            console.error("❌ Error al crear versión:", error);
            toast.error("No se pudo crear la versión");
        } finally {
            setIsCreatingVersion(false);
        }
    };

    const handleSaveUpdate = async () => {
        if (!selectedSong || !userData?.access_token) return;

        setIsUpdating(true);
        try {
            const updateData = {
                title: selectedSong.title,
                lyrics: JSON.stringify(songComplet),
                key: editedKey,
                bpm: Number(editedBpm),
            };

            await updateCustomSong(selectedSong.id, updateData, userData.access_token);
            toast.success("¡Cambios guardados con éxito!");
            setIsEditing(false);
            loadRepertorio();
        } catch (error) {
            console.error("Error al actualizar:", error);
            toast.error("Error al guardar los cambios");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleTextChange = (text: string) => {
        setEditedLyrics(text);
        // Le pasamos el estado actual (songComplet) para que intente rescatar los acordes
        const structured = parseLyricsToStructure(text, songComplet);
        setSongComplet(structured);
    };

    const handleChordClick = (sectionIdx: number, lineIdx: number, charIdx: number) => {
        setChordSelector({ sectionIdx, lineIdx, charIdx });
        setCustomChord("");
    };

    const applyChord = (rawChord: string | null) => {
        if (!chordSelector) return;

        const { sectionIdx, lineIdx, charIdx } = chordSelector;
        const updated = [...songComplet];
        const line = updated[sectionIdx].lyrics[lineIdx];

        if (!line.chords || line.chords.length < line.text.length) {
            line.chords = new Array(line.text.length).fill("");
        }

        if (rawChord === null) {
            line.chords[charIdx] = "";
        } else {
            line.chords[charIdx] = rawChord;
        }

        setSongComplet(updated);
        setChordSelector(null);
    };

    const parseLyrics = (lyricsString: string) => {
        if (!lyricsString) return [];
        try {
            return JSON.parse(lyricsString);
        } catch (error) {
            console.error("Error al parsear lyrics:", error);
            return [];
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Sincronizando partituras...</p>
            </div>
        );
    }

    if (!repertorio) return <div className="p-20 text-center">Repertorio no encontrado</div>;

    return (
        <div className={`max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${isFullscreen ? 'fixed inset-0 z-50 bg-[var(--background-start)] p-0 m-0 overflow-y-auto' : ''}`}>

            {!isFullscreen && (
                <div className="glass-card rounded-[2.5rem] p-6 md:p-10 border border-[var(--glass-border)] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-primary/10 to-secondary/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <button
                                onClick={() => router.back()}
                                className="w-12 h-12 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-primary)] hover:bg-primary hover:text-white transition-all shadow-md active:scale-90"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <div className="text-center md:text-left space-y-2">
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">Modo Ensayo</span>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--glass-bg)] text-[var(--text-secondary)] rounded-full text-[10px] font-black uppercase tracking-widest border border-[var(--glass-border)]">
                                        <Calendar size={12} /> {repertorio.fecha}
                                    </div>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight">{repertorio.nombre}</h1>
                                <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold text-[var(--text-secondary)] opacity-60">
                                    <span className="flex items-center gap-1.5"><Users size={14} /> {repertorio.group?.nombre}</span>
                                    <span className="w-1.5 h-1.5 bg-[var(--glass-border)] rounded-full"></span>
                                    <span className="flex items-center gap-1.5"><Music size={14} /> {repertorio.repertorio_song_category?.length} Categorías</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {!selectedSongVersions.some(s => s.user_id === userData?.user?.id) && (
                                <button
                                    onClick={handleCreateMyVersion}
                                    disabled={isCreatingVersion || !selectedSong}
                                    className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center gap-3 active:scale-95 ${isCreatingVersion ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-secondary text-white shadow-primary/20 hover:scale-105'}`}
                                >
                                    {isCreatingVersion ? <Loader2 size={18} className="animate-spin" /> : <Copy size={18} />}
                                    {isCreatingVersion ? "Creando..." : "Clonar y Crear Mi Versión"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className={`grid grid-cols-1 lg:grid-cols-4 gap-8 ${isFullscreen ? 'p-6' : ''}`}>

                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card rounded-[2.5rem] border border-[var(--glass-border)] p-6 shadow-lg bg-[var(--glass-bg)]/20">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-6 px-2 opacity-50">Orden del Día</h3>

                        <div className="space-y-4">
                            {repertorio.repertorio_song_category?.map((category: any) => (
                                <div key={category.id} className="space-y-3">
                                    <button
                                        onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${selectedCategory === category.id ? 'bg-primary/10 text-primary border border-primary/20 shadow-inner' : 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--glass-hover-bg)]'}`}
                                    >
                                        <span className="text-[11px] font-black uppercase tracking-wider">{category.nombre}</span>
                                        <ChevronDown size={14} className={`transition-transform duration-300 ${selectedCategory === category.id ? 'rotate-180' : ''}`} />
                                    </button>

                                    {selectedCategory === category.id && (
                                        <div className="space-y-2 ml-4 border-l-2 border-primary/20 pl-4 animate-in slide-in-from-top-2 duration-300">
                                            {category.customSongs?.map((songsArray: any[], idx: number) => {
                                                const mainInfo = songsArray[0];
                                                const isSelected = selectedSongVersions.some(s => s.id === mainInfo.id) || songsArray.some(s => s.id === selectedSong?.id);

                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            console.log("📂 CANCIÓN DESDE LISTA:", songsArray[0]);
                                                            handleSongSelect(songsArray, Number(category.id));
                                                        }}
                                                        className={`w-full text-left p-3.5 rounded-xl transition-all flex items-center justify-between group ${isSelected ? 'bg-primary text-white shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]'}`}
                                                    >
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-xs font-bold truncate">{mainInfo.title}</span>
                                                            <div className="flex gap-2">
                                                                {songsArray.length > 1 && (
                                                                    <span className={`text-[9px] font-black uppercase tracking-tighter ${isSelected ? 'text-white/60' : 'text-primary opacity-70'}`}>
                                                                        {songsArray.length} Versiones
                                                                    </span>
                                                                )}
                                                                {songsArray.some(s => s.user_id === userData?.user?.id) && (
                                                                    <span className="text-[9px] font-black text-secondary uppercase animate-pulse">● Tu Versión</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={12} className={`transition-transform duration-300 ${isSelected ? 'translate-x-1' : 'opacity-0'}`} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Debug info - temporal para resolver el reporte del usuario */}
                            <div className="mt-8 p-4 rounded-2xl bg-black/5 border border-dashed border-[var(--glass-border)] opacity-40">
                                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Diagnóstico Musical</p>
                                <p className="text-[9px] font-bold">User: {userData?.user?.id || '?'}</p>
                                <p className="text-[9px] font-bold">Song Owner: {selectedSong?.user_id || '?'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-[2.5rem] border border-[var(--glass-border)] p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-sm"><Video size={18} /></div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">Referencia Visual</h4>
                        </div>
                        <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
                            <Youtube />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="glass-card rounded-[3rem] border border-[var(--glass-border)] shadow-2xl overflow-hidden flex flex-col min-h-[800px] bg-[var(--glass-bg)]/30 backdrop-blur-3xl relative">

                        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border-b border-[var(--glass-border)] bg-[var(--glass-bg)]/50 gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-xl ring-4 ring-primary/10">
                                    <Music size={28} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{selectedSong?.title || 'Selecciona una canción'}</h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-80">Partitura Digital</span>
                                        {selectedSong?.user && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-accent/10 border border-accent/20 rounded-md">
                                                <UserCircle size={10} className="text-accent" />
                                                <span className="text-[9px] font-black text-accent uppercase">{selectedSong.user.name}</span>
                                            </div>
                                        )}
                                        {selectedSong?.user_id === 1 && (
                                            <span className="text-[9px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded-md uppercase">Original</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-[var(--glass-bg)] p-2 rounded-2xl border border-[var(--glass-border)]">
                                {selectedSongVersions.length > 1 && (
                                    <div className="flex gap-1 pr-4 border-r border-[var(--glass-border)] mr-2 flex-wrap">
                                        {selectedSongVersions.map((version) => (
                                            <button
                                                key={version.id}
                                                onClick={() => {
                                                    console.log("🎵 VERSIÓN SELECCIONADA:", version);
                                                    setSelectedSong(version);
                                                }}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${selectedSong?.id === version.id ? 'bg-primary text-white shadow-lg' : 'text-[var(--text-secondary)] hover:bg-[var(--glass-hover-bg)]'}`}
                                            >
                                                {selectedSong?.id === version.id && <CheckCircle2 size={12} />}
                                                {version.user?.name?.split(' ')[0] || "Version"}
                                                {(Number(version.user_id) === Number(userData?.user?.id) || Number(version.user?.id) === Number(userData?.user?.id)) && " (Tú)"}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {selectedSong && (
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all shadow-sm active:scale-95 ${isEditing ? 'bg-secondary text-white border-secondary' : 'bg-primary/20 border-primary/40 text-primary hover:bg-primary hover:text-white'}`}
                                        title={isEditing ? "Cancelar edición" : "Editar versión"}
                                    >
                                        {isEditing ? <X size={22} /> : <Edit2 size={22} />}
                                    </button>
                                )}

                                <button
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="w-12 h-12 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-primary transition-all shadow-sm active:scale-95"
                                >
                                    {isFullscreen ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-gradient-to-b from-transparent to-black/5">
                            {selectedSong ? (
                                isEditing ? (
                                    <div className="max-w-6xl mx-auto space-y-8 animate-in zoom-in-95 duration-300 pb-20">
                                        <div className="flex items-center justify-between sticky top-0 bg-[var(--background-start)] z-30 py-4 border-b border-[var(--glass-border)]">
                                            <div>
                                                <h3 className="text-xl font-black text-primary uppercase tracking-widest">Editor de Acordes</h3>
                                                <p className="text-[10px] text-[var(--text-secondary)] opacity-40 uppercase tracking-widest mt-1">Personaliza tu versión con precisión profesional</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="px-6 py-3 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={handleSaveUpdate}
                                                    disabled={isUpdating}
                                                    className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                                >
                                                    {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                    {isUpdating ? "Guardando..." : "Guardar Versión"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[700px]">
                                            {/* Panel Izquierdo: Texto */}
                                            <div className="flex flex-col space-y-4">
                                                <div className="flex items-center justify-between px-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50">Estructura de la Letra</label>
                                                    <div className="flex gap-2">
                                                        <span className="text-[8px] bg-primary/20 text-primary px-2 py-0.5 rounded">INTRO</span>
                                                        <span className="text-[8px] bg-secondary/20 text-secondary px-2 py-0.5 rounded">CORO</span>
                                                        <span className="text-[8px] bg-accent/20 text-accent px-2 py-0.5 rounded">VERSO 1</span>
                                                    </div>
                                                </div>
                                                <textarea
                                                    value={editedLyrics}
                                                    onChange={(e) => handleTextChange(e.target.value)}
                                                    className="flex-1 bg-black/40 border border-[var(--glass-border)] rounded-[2.5rem] p-8 text-sm font-mono leading-relaxed focus:ring-4 ring-primary/10 outline-none custom-scrollbar resize-none text-[var(--text-primary)]"
                                                    placeholder="Escribe la letra aquí...&#10;&#10;Ejemplo:&#10;INTRO&#10;G C D G&#10;&#10;VERSO 1&#10;Dios de bondad..."
                                                    spellCheck={false}
                                                />
                                                <div className="grid grid-cols-2 gap-4 pt-2">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-30 px-2">Tonalidad</label>
                                                        <input
                                                            type="text"
                                                            value={editedKey}
                                                            onChange={(e) => setEditedKey(e.target.value)}
                                                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-3 text-sm text-primary font-black outline-none"
                                                            placeholder="Ej: G Mayor"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-30 px-2">BPM</label>
                                                        <input
                                                            type="number"
                                                            value={editedBpm}
                                                            onChange={(e) => setEditedBpm(Number(e.target.value))}
                                                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-3 text-sm text-secondary font-black outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Panel Derecho: Previsualización Interactiva */}
                                            <div className="flex flex-col space-y-4 overflow-hidden">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50 px-2">Preview Interactiva (Haz clic para poner acordes)</label>
                                                <div className="flex-1 bg-white/5 border border-[var(--glass-border)] rounded-[2.5rem] p-8 overflow-y-auto custom-scrollbar backdrop-blur-sm">
                                                    {songComplet.map((section, sIdx) => (
                                                        <div key={sIdx} className="mb-8 last:mb-0">
                                                            <div className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
                                                                {section.type}
                                                                <div className="h-[1px] flex-1 bg-primary/20"></div>
                                                            </div>
                                                            <div className="space-y-8">
                                                                {section.lyrics.map((line: any, lIdx: number) => (
                                                                    <div key={lIdx} className="relative group/line">
                                                                        {/* Fila de Acordes Interactiva */}
                                                                        <div className="flex h-6 items-center">
                                                                            {Array.from({ length: Math.max(line.text.length, 1) }).map((_, cIdx) => (
                                                                                <div
                                                                                    key={cIdx}
                                                                                    onClick={() => handleChordClick(sIdx, lIdx, cIdx)}
                                                                                    className={`w-[11px] h-full flex items-center justify-center text-[10px] font-black cursor-pointer transition-all hover:bg-primary/20 hover:text-white rounded-t-sm
                                                                                        ${line.chords?.[cIdx] ? 'text-secondary bg-secondary/10' : 'text-transparent'}`}
                                                                                >
                                                                                    {line.chords?.[cIdx] || "·"}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        {/* Fila de Letra */}
                                                                        <div className="text-sm font-mono tracking-normal text-[var(--text-primary)] opacity-80 border-t border-white/5 pt-1">
                                                                            {line.text}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Selector de Acordes Flotante */}
                                        {chordSelector && (
                                            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-300">
                                                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-8 rounded-[3rem] shadow-2xl max-w-lg w-full scale-110">
                                                    <div className="flex items-center justify-between mb-8">
                                                        <h4 className="text-sm font-black text-primary uppercase tracking-widest">Seleccionar Acorde</h4>
                                                        <button onClick={() => setChordSelector(null)} className="text-[var(--text-secondary)] hover:text-white"><X size={20} /></button>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={customChord}
                                                                onChange={(e) => setCustomChord(e.target.value)}
                                                                onKeyDown={(e) => e.key === "Enter" && applyChord(customChord)}
                                                                className="w-full bg-black/40 border border-[var(--glass-border)] rounded-2xl p-4 text-secondary font-black focus:ring-4 ring-secondary/20 outline-none"
                                                                placeholder="Escribe acorde personalizado..."
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => applyChord(customChord)}
                                                                className="absolute right-3 top-3 px-4 py-1.5 bg-secondary text-white rounded-xl text-[9px] font-black uppercase tracking-widest"
                                                            >
                                                                Usar
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-6 gap-3">
                                                            {CHORDS.map((ch) => (
                                                                <button
                                                                    key={ch}
                                                                    onClick={() => applyChord(ch)}
                                                                    className="bg-white/5 hover:bg-primary hover:text-white text-[10px] font-bold text-[var(--text-primary)] py-2.5 rounded-xl transition-all border border-white/5"
                                                                >
                                                                    {ch}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <div className="flex gap-4 pt-4">
                                                            <button
                                                                onClick={() => applyChord(null)}
                                                                className="flex-1 bg-red-500/20 text-red-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/30 hover:bg-red-500 hover:text-white transition-all"
                                                            >
                                                                Eliminar Acorde
                                                            </button>
                                                            <button
                                                                onClick={() => setChordSelector(null)}
                                                                className="flex-1 bg-white/5 text-[var(--text-secondary)] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                                                            >
                                                                Cerrar
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="max-w-3xl mx-auto space-y-12">
                                        {parseLyrics(selectedSong.lyrics).map((section: any, sectionIdx: number) => (
                                            <div key={sectionIdx} className="space-y-6 animate-in fade-in duration-700" style={{ animationDelay: `${sectionIdx * 100}ms` }}>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary/20 to-primary/40 rounded-full"></div>
                                                    <span className="px-5 py-1.5 rounded-xl bg-primary/5 border border-primary/10 text-[10px] font-black uppercase tracking-[0.4em] text-primary shadow-sm backdrop-blur-md">{section.type}</span>
                                                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-primary/20 to-primary/40 rounded-full"></div>
                                                </div>

                                                <div className="space-y-8 pl-2 lg:pl-10">
                                                    {section.lyrics.map((lyric: any, lineIdx: number) => (
                                                        <div key={lineIdx} className="space-y-3 relative group">
                                                            <div className="flex min-h-[1.2rem] flex-wrap gap-x-[1px]">
                                                                {Array.from({ length: lyric.text.length }).map((_, charIdx) => {
                                                                    const chord = lyric.chords?.[charIdx];
                                                                    return (
                                                                        <div
                                                                            key={charIdx}
                                                                            className={`relative w-[11px] h-5 text-xs font-black text-secondary flex items-center justify-center transition-all ${chord ? 'scale-110 translate-y-[-2px] drop-shadow-[0_0_5px_rgba(var(--secondary-rgb),0.3)]' : 'opacity-10'}`}
                                                                        >
                                                                            {chord || "."}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>

                                                            <div className="text-lg md:text-xl font-bold tracking-normal text-[var(--text-primary)] leading-relaxed selection:bg-primary/30 transition-colors duration-500 group-hover:text-primary/80">
                                                                {lyric.text}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center gap-8 py-40 opacity-20">
                                    <Music size={120} className="text-[var(--text-secondary)] animate-bounce" />
                                    <p className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-[0.4em]">Selecciona una obra para ensayar</p>
                                </div>
                            )}
                        </div>

                        {selectedSong && (
                            <div className="p-8 bg-[var(--glass-bg)] border-t border-[var(--glass-border)] flex flex-wrap items-center justify-between gap-8">
                                <div className="flex gap-12">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50">Tonalidad Sugerida</p>
                                        <p className="text-xl font-black text-primary uppercase tracking-tight">{selectedSong.key || 'D Mayor'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50">Velocidad / BPM</p>
                                        <p className="text-xl font-black text-secondary uppercase tracking-tight">{selectedSong.bpm || '74'} BPM</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="px-5 py-2.5 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest shadow-inner">Compás 4/4</div>
                                    <div className="px-5 py-2.5 rounded-2xl bg-secondary/10 border border-secondary/20 text-[10px] font-black text-secondary uppercase tracking-widest shadow-inner">Estilo Worship</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
