"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const tracksData = [
  { id: 1, name: "other", src: "https://res.cloudinary.com/dlkky5xuo/video/upload/v1760866305/singerApi/multitracks/No_Tengo_Miedo_Seguir-other-E_major-100bpm-441hz_ghthuo.m4a" },
  { id: 2, name: "vocals", src: "https://res.cloudinary.com/dlkky5xuo/video/upload/v1760866305/singerApi/multitracks/No_Tengo_Miedo_Seguir-vocals-E_major-100bpm-441hz_spv1wa.m4a" },
  { id: 3, name: "piano", src: "https://res.cloudinary.com/dlkky5xuo/video/upload/v1760866304/singerApi/multitracks/No_Tengo_Miedo_Seguir-piano-E_major-100bpm-441hz_qsyu8j.m4a" },
  { id: 4, name: "wind", src: "https://res.cloudinary.com/dlkky5xuo/video/upload/v1760866303/singerApi/multitracks/No_Tengo_Miedo_Seguir-wind-E_major-100bpm-441hz_guxiu1.m4a" },
  { id: 5, name: "keys", src: "https://res.cloudinary.com/dlkky5xuo/video/upload/v1760866303/singerApi/multitracks/No_Tengo_Miedo_Seguir-keys-E_major-100bpm-441hz_aemt6v.m4a" },
  { id: 6, name: "metronome", src: "https://res.cloudinary.com/dlkky5xuo/video/upload/v1760866299/singerApi/multitracks/No_Tengo_Miedo_Seguir-metronome-E_major-100bpm-441hz_xiouls.m4a" },
  { id: 7, name: "strings", src: "https://res.cloudinary.com/dlkky5xuo/video/upload/v1760866298/singerApi/multitracks/No_Tengo_Miedo_Seguir-strings-E_major-100bpm-441hz_uityzs.m4a" },
  { id: 8, name: "drums", src: "https://res.cloudinary.com/dlkky5xuo/video/upload/v1760866297/singerApi/multitracks/No_Tengo_Miedo_Seguir-drums-E_major-100bpm-441hz_doakgi.m4a" },
  { id: 9, name: "bass", src: "https://res.cloudinary.com/dlkky5xuo/video/upload/v1760866294/singerApi/multitracks/No_Tengo_Miedo_Seguir-bass-E_major-100bpm-441hz_sz3zwq.m4a" },
  { id: 10, name: "bass_alt", src: "https://res.cloudinary.com/dlkky5xuo/video/upload/v1760866203/singerApi/multitracks/No_Tengo_Miedo_Seguir-bass-E_major-100bpm-441hz_aq521h.m4a" },
  { id: 11, name: "keys_alt", src: "https://res.cloudinary.com/dlkky5xuo/video/upload/v1760866202/singerApi/multitracks/No_Tengo_Miedo_Seguir-keys-E_major-100bpm-441hz_h2qjzg.m4a" },
  { id: 12, name: "guitars", src: "https://res.cloudinary.com/dlkky5xuo/video/upload/v1760866198/singerApi/multitracks/No_Tengo_Miedo_Seguir-guitars-E_major-100bpm-441hz_ixvpfp.m4a" },
  { id: 13, name: "backing_vocals", src: "https://res.cloudinary.com/dlkky5xuo/video/upload/v1760866198/singerApi/multitracks/No_Tengo_Miedo_Seguir-backing_vocals-E_major-100bpm-441hz_csz8b5.m4a" },
];






export default function MultitrackAudioEditor() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumes, setVolumes] = useState({});
  const [muted, setMuted] = useState({});
  const [markers, setMarkers] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);
  const [isLooping, setIsLooping] = useState(false);
  const audioRefs = useRef([]);

  // 🔄 Reproducir o pausar todas las pistas
 const togglePlay = () => {
  if (isPlaying) {
    // ⏸️ Pausar todo
    audioRefs.current.forEach((audio) => {
      if (!audio.paused) audio.pause();
    });
    setIsPlaying(false);
  } else {
    // ▶️ Reproducir todo
    audioRefs.current.forEach((audio) => {
      // Si está cargado, intenta reproducir
      if (audio.readyState >= 2) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Error reproduciendo pista:", err);
          });
        }
      } else {
        // Esperar a que el audio esté listo
        audio.oncanplay = () => {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.warn("Error reproduciendo pista:", err);
            });
          }
        };
      }
    });
    setIsPlaying(true);
  }
};

  // 🎚️ Cambiar volumen individual
  const handleVolumeChange = (id, value) => {
    setVolumes((prev) => ({ ...prev, [id]: value }));
    const audio = audioRefs.current.find((a) => a.dataset.id === String(id));
    if (audio) audio.volume = value;
  };

  // 🔇 Mute individual
  const toggleMute = (id) => {
    setMuted((prev) => ({ ...prev, [id]: !prev[id] }));
    const audio = audioRefs.current.find((a) => a.dataset.id === String(id));
    if (audio) audio.muted = !muted[id];
  };

  // ⏱️ Actualiza tiempo de reproducción y duración general
  useEffect(() => {
    const audios = audioRefs.current;
    if (audios.length > 0) {
      const mainAudio = audios[0];
      const updateProgress = () => setCurrentTime(mainAudio.currentTime);
      mainAudio.addEventListener("timeupdate", updateProgress);
      setDuration(mainAudio.duration || 0);
      return () => mainAudio.removeEventListener("timeupdate", updateProgress);
    }
  }, [audioRefs]);

  // 🪄 Permitir adelantar o retroceder (seek)
  const handleSeek = (e) => {
    const value = parseFloat(e.target.value);
    setCurrentTime(value);
    audioRefs.current.forEach((audio) => {
      audio.currentTime = value;
    });
  };

  // Agregar marcador
  const addMarker = () => {
    const newMarker = {
      id: Date.now(),
      start: currentTime,
      end: null,
      name: `Marcador ${markers.length + 1}`
    };
    setMarkers([...markers, newMarker]);
    setActiveMarker(newMarker.id);
  };

  // Finalizar marcador
  const finishMarker = () => {
    if (activeMarker) {
      setMarkers(markers.map(marker => 
        marker.id === activeMarker 
          ? { ...marker, end: currentTime }
          : marker
      ));
      setActiveMarker(null);
    }
  };

  // Reproducir sección marcada
  const playMarkedSection = (marker) => {
    if (marker.start !== null && marker.end !== null) {
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.currentTime = marker.start;
          if (!isPlaying) {
            audio.play();
            setIsPlaying(true);
          }
        }
      });
    }
  };

  // Verificar si estamos en el final de un marcador
  useEffect(() => {
    if (isLooping && markers.length > 0) {
      markers.forEach(marker => {
        if (marker.end !== null && currentTime >= marker.end) {
          audioRefs.current.forEach(audio => {
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
    setMarkers(markers.filter(marker => marker.id !== markerId));
    if (activeMarker === markerId) {
      setActiveMarker(null);
    }
  };

  // Función para sincronizar todas las pistas
  const syncTracks = (time) => {
    audioRefs.current.forEach(audio => {
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
      if (isPlaying && audioRefs.current[0]) {
        const mainTrackTime = audioRefs.current[0].currentTime;
        setCurrentTime(mainTrackTime);
        
        // Verificar y corregir desincronización
        audioRefs.current.forEach((audio, index) => {
          if (audio && Math.abs(audio.currentTime - mainTrackTime) > 0.1) {
            audio.currentTime = mainTrackTime;
          }
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Modificar el event listener para actualizar el tiempo
  const handleTimeUpdate = (e) => {
    const time = e.target.currentTime;
    setCurrentTime(time);
    
    // Sincronizar otras pistas si hay desviación
    audioRefs.current.forEach(audio => {
      if (audio && audio !== e.target && Math.abs(audio.currentTime - time) > 0.1) {
        audio.currentTime = time;
      }
    });
  };

  return (
    <div className="bg-neutral-900 text-white min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-8">🎚️ Editor Multitrack estilo BandLab</h1>

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
        <div className="text-sm text-gray-400 mt-1 flex justify-between">
          <span>{currentTime.toFixed(1)}s</span>
          <span>{duration ? duration.toFixed(1) + "s" : "0.0s"}</span>
        </div>
      </div>

      {/* Botón principal Play/Pause */}
      <button
        onClick={togglePlay}
        className="mb-8 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg flex items-center gap-2"
      >
        {isPlaying ? <Pause /> : <Play />}
        {isPlaying ? "Pausar" : "Reproducir"}
      </button>

      {/* Multitrack visual */}
      <div className="space-y-4 w-full max-w-4xl">
        {tracksData.map((track, i) => (
          <div
            key={track.id}
            className="bg-neutral-800 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4 w-1/3">
              <span className="font-semibold">{track.name}</span>
            </div>

            {/* Línea que representa el audio (pista visual) */}
            <div className="relative bg-neutral-700 h-4 rounded-lg flex-grow mx-4">
              <div
                className="absolute bg-green-500 h-4 rounded-lg"
                style={{
                  width: `${(currentTime / (duration || 1)) * 100}%`,
                  transition: "width 0.1s linear",
                }}
              ></div>
            </div>

            {/* Controles individuales */}
            <div className="flex items-center gap-3 w-1/3 justify-end">
              <button
                onClick={() => toggleMute(track.id)}
                className="p-2 rounded-full hover:bg-neutral-600"
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
                className="accent-green-500 w-24"
              />
            </div>

            <audio
              ref={(el) => (audioRefs.current[i] = el)}
              data-id={track.id}
              src={track.src}
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={(e) => {
                if (i === 0) {
                  setDuration(e.target.duration);
                }
              }}
            />
          </div>
        ))}
      </div>

      {/* Nuevos controles para marcadores y loop */}
      <div className="p-4">
        <div className="mb-4 flex gap-2">
          <button 
            onClick={addMarker}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Agregar Inicio Marcador
          </button>
          <button 
            onClick={finishMarker}
            className="px-4 py-2 bg-green-500 text-white rounded"
            disabled={!activeMarker}
          >
            Marcar Final
          </button>
          <button 
            onClick={() => setIsLooping(!isLooping)}
            className={`px-4 py-2 ${isLooping ? 'bg-red-500' : 'bg-gray-500'} text-white rounded`}
          >
            {isLooping ? 'Detener Loop' : 'Activar Loop'}
          </button>
        </div>

        {/* Lista de marcadores modificada */}
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Secciones</h3>
          <div className="space-y-2">
            {markers.map((marker, index) => (
              <div key={marker.id} className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                <span className="font-semibold min-w-[30px]">#{index + 1}</span>
                <span>{marker.name}</span>
                <span className="text-gray-600">
                  {Math.floor(marker.start)}s - {marker.end ? Math.floor(marker.end) : '...'}s
                </span>
                <button 
                  onClick={() => playMarkedSection(marker)}
                  className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                  disabled={!marker.end}
                >
                  Reproducir
                </button>
                <button 
                  onClick={() => deleteMarker(marker.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
