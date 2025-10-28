"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { saveTrack, getTrack, clearTracks } from "@/utils/useIdexDBTracks";

// First, improve the interface definition
interface Track {
  id: number;
  song_id: number;
  name: string;
  file_url: string;
  volume: number;
  muted: number;
  order: number;
  created_at: string;
  updated_at: string;
}

interface MultiTrackProps {
  tracks?: Track[];
}

const MultitrackAudioEditor: React.FC<MultiTrackProps> = ({ tracks }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumes, setVolumes] = useState({});
  const [muted, setMuted] = useState({});
  const [markers, setMarkers] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);
  const [isLooping, setIsLooping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedTracks, setLoadedTracks] = useState(0);
  const [trackErrors, setTrackErrors] = useState({});
  const audioRefs = useRef<HTMLAudioElement[]>([]);
  const loadedCountRef = useRef(0); // contador persistente para cargas
  const [sources, setSources] = useState<Record<number, string>>({});
  const createdUrlsRef = useRef<string[]>([]);

  // devuelve el audio "master" (primero válido) o null
  const getMasterAudio = (): HTMLAudioElement | null => {
    const valids = getValidAudios();
    return valids && valids.length > 0 ? valids[0] : null;
  };
  const masterIdRef = useRef<number | null>(null);

  // evita log repetido: useEffect si necesitas debug
  // console.log("multiytrack==> ", tracks);

  useEffect(() => {
    const loadTracks = async () => {
      const map: Record<number, string> = {};
      const created: string[] = [];
      for (const track of tracks || []) {
        try {
          const existing = await getTrack(track.id);
          if (existing) {
            const url = URL.createObjectURL(existing.blob);
            map[track.id] = url;
            created.push(url);
          } else {
            const res = await fetch(track.file_url);
            if (!res.ok) throw new Error(`Error fetching track: ${res.statusText}`);
            const blob = await res.blob();
            await saveTrack(track.id, blob);
            const localUrl = URL.createObjectURL(blob);
            map[track.id] = localUrl;
            created.push(localUrl);
          }
        } catch (error) {
          console.error(`Failed to load track ${track.id}:`, error);
          setTrackErrors((prev) => ({ ...prev, [track.id]: true }));
        }
      }
      createdUrlsRef.current = created;
      setSources(map);
    };

    loadTracks();

    // 🧹 limpiamos cuando el usuario salga del componente
    return () => {
      // revocar objectURLs creadas
      createdUrlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch (e) {}
      });
      clearTracks();
    };
  }, [tracks]);



  // helper: devuelve solo audios válidos y no marcados como error
  const getValidAudios = () =>
    audioRefs.current.filter(
      (a) =>
        a &&
        a instanceof HTMLMediaElement &&
        !trackErrors[Number(a.dataset?.id ?? (a as any).__trackId)]
    ) as HTMLAudioElement[];

  // 🔄 Reproducir o pausar todas las pistas (usa solo audios válidos)
  const togglePlay = () => {
    const validAudios = getValidAudios();
    if (isPlaying) {
      validAudios.forEach((audio) => {
        try {
          if (!audio.paused) audio.pause();
        } catch (e) {}
      });
      setIsPlaying(false);
    } else {
      validAudios.forEach((audio) => {
        try {
          if (audio.readyState >= 2) {
            const playPromise = audio.play();
            if (playPromise !== undefined) playPromise.catch(() => {});
          } else {
            const onCanPlayHandler = () => {
              const playPromise = audio.play();
              if (playPromise !== undefined) playPromise.catch(() => {});
              audio.removeEventListener("canplay", onCanPlayHandler);
            };
            audio.addEventListener("canplay", onCanPlayHandler);
          }
        } catch (err) {}
      });
      setIsPlaying(true);
    }
  };

  // 🎚️ Cambiar volumen individual (solo si existe audio válido)
  const handleVolumeChange = (id, value) => {
    setVolumes((prev) => ({ ...prev, [id]: value }));
    const audio = getValidAudios().find((a) => a.dataset?.id === String(id));
    if (audio) audio.volume = value;
  };

  // 🔇 Mute individual (solo si existe audio válido)
  const toggleMute = (id) => {
    setMuted((prev) => ({ ...prev, [id]: !prev[id] }));
    const audio = getValidAudios().find((a) => a.dataset?.id === String(id));
    if (audio) audio.muted = !muted[id];
  };

  // ⏱️ Usar audio "master" para tiempo/duración y re-enganchar cuando cambie valid set
  useEffect(() => {
    const master = getMasterAudio();
    // si cambió el master, quitar el anterior
    if (
      masterIdRef.current !==
      (master?.dataset?.id ? Number(master.dataset.id) : null)
    ) {
      masterIdRef.current = master?.dataset?.id
        ? Number(master.dataset.id)
        : null;
    }

    if (!master) {
      setDuration(0);
      return;
    }

    const updateProgress = () => setCurrentTime(master.currentTime);
    master.addEventListener("timeupdate", updateProgress);
    if (
      master.duration &&
      !Number.isNaN(master.duration) &&
      master.duration > 0
    ) {
      setDuration((prev) => Math.max(prev, master.duration));
    }
    return () => {
      master.removeEventListener("timeupdate", updateProgress);
    };
  }, [tracks, trackErrors, audioRefs.current.length, isPlaying]); // re-evalúa si cambian audios válidos

  // 🪄 Permitir adelantar o retroceder (seek)
  const handleSeek = (e) => {
    const value = parseFloat(e.target.value);
    setCurrentTime(value);
    getValidAudios().forEach((audio) => {
      try {
        audio.currentTime = value;
      } catch (err) {}
    });
  };

  // Agregar marcador
  const addMarker = () => {
    const newMarker = {
      id: Date.now(),
      start: currentTime,
      end: null,
      name: `Marcador ${markers.length + 1}`,
    };
    setMarkers([...markers, newMarker]);
    setActiveMarker(newMarker.id);
  };

  // Finalizar marcador
  const finishMarker = () => {
    if (activeMarker) {
      setMarkers(
        markers.map((marker) =>
          marker.id === activeMarker ? { ...marker, end: currentTime } : marker
        )
      );
      setActiveMarker(null);
    }
  };

  // Reproducir sección marcada (solo audios válidos)
  const playMarkedSection = (marker) => {
    if (marker.start !== null && marker.end !== null) {
      const validAudios = getValidAudios();
      validAudios.forEach((audio) => {
        try {
          audio.currentTime = marker.start;
          if (!isPlaying) {
            const p = audio.play();
            if (p) p.catch(() => {});
          }
        } catch (e) {}
      });
      if (!isPlaying) setIsPlaying(true);
    }
  };

  // Verificar si estamos en el final de un marcador
  useEffect(() => {
    if (isLooping && markers.length > 0) {
      markers.forEach((marker) => {
        if (marker.end !== null && currentTime >= marker.end) {
          audioRefs.current.forEach((audio) => {
            if (audio) {
              audio.currentTime = marker.start;
            }
          });
        }
      });
    }
  }, [currentTime, markers, isLooping]);

  // Agregar función para eliminar marcador
  const deleteMarker = (markerId) => {
    setMarkers(markers.filter((marker) => marker.id !== markerId));
    if (activeMarker === markerId) {
      setActiveMarker(null);
    }
  };

  // Función para sincronizar todas las pistas
  const syncTracks = (time) => {
    audioRefs.current.forEach((audio) => {
      if (audio) {
        audio.currentTime = time;
      }
    });
  };

  // Modificar el manejador del control deslizante de tiempo
  const handleTimeSliderChange = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    syncTracks(time);
  };

  // Modificar el efecto que actualiza el tiempo
  useEffect(() => {
    const interval = setInterval(() => {
      const valid = getValidAudios();
      if (isPlaying && valid[0]) {
        const mainTrackTime = valid[0].currentTime;
        setCurrentTime(mainTrackTime);

        valid.forEach((audio) => {
          if (Math.abs(audio.currentTime - mainTrackTime) > 0.1) {
            try {
              audio.currentTime = mainTrackTime;
            } catch (e) {}
          }
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, trackErrors]); // re-evalúa si cambian errores

  // Modificar el event listener para actualizar el tiempo
  const handleTimeUpdate = (e) => {
    const time = e.target.currentTime;
    setCurrentTime(time);

    // Sincronizar otras pistas si hay desviación
    audioRefs.current.forEach((audio) => {
      if (
        audio &&
        audio !== e.target &&
        Math.abs(audio.currentTime - time) > 0.1
      ) {
        audio.currentTime = time;
      }
    });
  };

  // Agregar este useEffect al inicio del componente
  useEffect(() => {
    if (tracks) {
      const initialVolumes = {};
      const initialMuted = {};
      tracks.forEach((track) => {
        initialVolumes[track.id] = track.volume || 1;
        initialMuted[track.id] = track.muted === 1;
      });
      setVolumes(initialVolumes);
      setMuted(initialMuted);
    }
  }, [tracks]);

  // Reset de carga cuando cambian las pistas
  useEffect(() => {
    if (!tracks || tracks.length === 0) {
      setLoading(false);
      setLoadedTracks(0);
      setTrackErrors({});
      loadedCountRef.current = 0;
      return;
    }

    setLoading(true);
    setLoadedTracks(0);
    setTrackErrors({});
    loadedCountRef.current = 0;
  }, [tracks]);

  // Handlers usados por cada <audio />
  const handleCanPlay = (trackId: number) => {
    // evita contar de nuevo si ya se marcó error
    if (trackErrors[trackId]) return;
    loadedCountRef.current++;
    setLoadedTracks(loadedCountRef.current);
    if (loadedCountRef.current >= (tracks?.length || 0)) setLoading(false);
  };

  const handleAudioError = (trackId: number, ev?: any) => {
    console.error(`Error loading track ${trackId}:`, ev);
    setTrackErrors((prev) => ({ ...prev, [trackId]: true }));

    // remover la referencia al audio que falló (evita que luego intente reproducirse)
    const idx = audioRefs.current.findIndex(
      (a) =>
        a &&
        (a.dataset?.id === String(trackId) || (a as any).__trackId === trackId)
    );
    if (idx >= 0) {
      audioRefs.current[idx] = null as any;
    }

    loadedCountRef.current++;
    setLoadedTracks(loadedCountRef.current);
    if (loadedCountRef.current >= (tracks?.length || 0)) setLoading(false);
  };

  // Agrega console.log para debugging
  useEffect(() => {
  //  console.log("Loading:", loading);
  //  console.log("Loaded tracks:", loadedTracks);
  //  console.log("Total tracks:", tracks?.length);
  }, [loading, loadedTracks, tracks]);




  // Antes del return principal
  if (loading) {
    return (
      <>
        <div className="bg-neutral-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
          <h2 className="text-xl font-semibold mb-4">
            Cargando pistas... ({loadedTracks}/{tracks?.length})
          </h2>
          <div className="text-sm text-gray-400">
            {tracks?.map((track, index) => (
              <div key={track.id}>
                {track.name}:{" "}
                {audioRefs.current[index]?.readyState >= 4 ? "✅" : "⏳"}
              </div>
            ))}
          </div>
        </div>

        {/* Audios ocultos para que disparen canplay/error mientras cargan */}
        <div style={{ display: "none" }}>
          {tracks?.map((track, i) => (
            <audio
              key={track.id}
              ref={(el) => (audioRefs.current[i] = el)}
              data-id={track.id}
              src={track.file_url}
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={(e) => {
                if (i === 0) setDuration(e.target.duration);
              }}
              onCanPlay={() => handleCanPlay(track.id)}
              onError={(e) => handleAudioError(track.id, e)}
            />
          ))}
        </div>
      </>
    );
  }

  if (!tracks || tracks.length === 0) {
    return (
      <div className="bg-neutral-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-semibold mb-4">
          No hay pistas disponibles
        </h2>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 text-white min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-center">
        🎚️ Editor Multitrack estilo BandLab
      </h1>

      {/* Barra de progreso general */}
      <div className="w-full max-w-4xl mb-6">
        <input
          type="range"
          min="0"
          max={duration || 1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full accent-green-500"
        />
        <div className="text-xs sm:text-sm text-gray-400 mt-1 flex justify-between">
          <span>{currentTime.toFixed(1)}s</span>
          <span>{duration ? duration.toFixed(1) + "s" : "0.0s"}</span>
        </div>
      </div>

      {/* Botón principal Play/Pause */}
      <button
        onClick={togglePlay}
        className="mb-8 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base"
      >
        {isPlaying ? <Pause /> : <Play />}
        {isPlaying ? "Pausar" : "Reproducir"}
      </button>

      {/* Multitrack visual */}
      <div className="space-y-4 w-full max-w-4xl">
        {tracks?.map((track, i) => (
          <div
            key={track.id}
            className="bg-neutral-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            {/* Nombre del track y error si existe */}
            <div className="flex flex-col items-center sm:items-start gap-1 w-full sm:w-1/3">
              <span className="font-semibold text-sm sm:text-base text-center">
                {track.name}
              </span>
              {trackErrors[track.id] && (
                <span className="text-red-500 text-xs">
                  ⚠️ Error al cargar la pista
                </span>
              )}
            </div>

            {/* Línea que representa el audio (pista visual) */}
            <div
              className={`relative h-3 sm:h-4 rounded-lg flex-grow w-full sm:mx-4 ${
                trackErrors[track.id] ? "bg-red-900/30" : "bg-neutral-700"
              }`}
            >
              {!trackErrors[track.id] && (
                <div
                  className="absolute bg-green-500 h-3 sm:h-4 rounded-lg"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, (currentTime / (duration || 1)) * 100)
                    )}%`,
                    transition: "width 0.1s linear",
                  }}
                ></div>
              )}
            </div>

            {/* Controles individuales */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-1/3 justify-center sm:justify-end">
              <button
                onClick={() => toggleMute(track.id)}
                className={`p-1 sm:p-2 rounded-full hover:bg-neutral-600 ${
                  trackErrors[track.id] ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={trackErrors[track.id]}
              >
                {muted[track.id] ? <VolumeX /> : <Volume2 />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumes[track.id] || 1}
                onChange={(e) =>
                  handleVolumeChange(track.id, parseFloat(e.target.value))
                }
                className="accent-green-500 w-20 sm:w-24"
                disabled={trackErrors[track.id]}
              />
            </div>

            {/* Audio element */}
            {!trackErrors[track.id] && (
              <audio
                ref={(el) => (audioRefs.current[i] = el)}
                data-id={track.id}
                src={sources[track.id] || track.file_url}
                preload="auto"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={(e) => {
                  const d = e.target.duration || 0;
                  if (d && !Number.isNaN(d)) setDuration((prev) => Math.max(prev, d));
                }}
                onCanPlay={() => handleCanPlay(track.id)}
                onError={(e) => handleAudioError(track.id, e)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Nuevos controles para marcadores y loop */}
      <div className="p-4 w-full max-w-3xl">
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          <button
            onClick={addMarker}
            className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded text-sm sm:text-base"
          >
            Agregar Inicio Marcador
          </button>
          <button
            onClick={finishMarker}
            className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded text-sm sm:text-base"
            disabled={!activeMarker}
          >
            Marcar Final
          </button>
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`px-3 sm:px-4 py-2 ${
              isLooping ? "bg-red-500" : "bg-gray-500"
            } text-white rounded text-sm sm:text-base`}
          >
            {isLooping ? "Detener Loop" : "Activar Loop"}
          </button>
        </div>

        {/* Lista de marcadores */}
        <div className="mt-4 overflow-x-auto">
          <h3 className="text-lg font-bold mb-2 text-center sm:text-left">
            Secciones
          </h3>
          <div className="space-y-2">
            {markers.map((marker, index) => (
              <div
                key={marker.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 bg-gray-100 p-2 rounded text-neutral-900 text-sm sm:text-base"
              >
                <div className="flex flex-wrap items-center gap-2 justify-between w-full">
                  <span className="font-semibold">#{index + 1}</span>
                  <span>{marker.name}</span>
                  <span className="text-gray-600">
                    {Math.floor(marker.start)}s -{" "}
                    {marker.end ? Math.floor(marker.end) : "..."}s
                  </span>
                </div>
                <div className="flex gap-2 justify-center sm:justify-end w-full">
                  <button
                    onClick={() => playMarkedSection(marker)}
                    className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                    disabled={!marker.end}
                  >
                    Reproducir
                  </button>
                  <button
                    onClick={() => deleteMarker(marker.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultitrackAudioEditor;
