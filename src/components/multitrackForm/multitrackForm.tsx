"use client";
import React, { useState, useEffect } from "react";

const UploadMultitrackForm = ({ dataSong, onRefresh }) => {
  const [songName, setSongName] = useState("");
  const [tracks, setTracks] = useState([]);
  const [existingTracks, setExistingTracks] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Cargar presets existentes
  useEffect(() => {
    if (dataSong?.tracks) {
      setExistingTracks(dataSong.tracks);
    }
  }, [dataSong]);

  // 🔥 Eliminar un track existente  songs/{song}/tracks/{track}
  const handleDeleteTrack = async (trackId) => {
    if (!confirm("¿Seguro que deseas eliminar este preset?")) return;
    try {
      const res = await fetch(`https://api.musikoord.com/api/songs/${dataSong.id}/tracks/${trackId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar preset");
      setExistingTracks((prev) => prev.filter((t) => t.id !== trackId));
      alert("✅ Preset eliminado correctamente");
    } catch (err) {
      console.error(err);
      alert("❌ No se pudo eliminar el preset");
    }
  };



  // 👉 Manejo de archivos seleccionados o arrastrados
  const handleFiles = (files) => {
    const newTracks = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name.replace(/\.[^/.]+$/, ""), // Quita extensión
      type: file.type,
      previewUrl: URL.createObjectURL(file),
    }));
    setTracks((prev) => [...prev, ...newTracks]);
  };

  // 👉 Cambiar nombre del track
  const handleNameChange = (id, newName) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: newName } : t))
    );
  };

  // 👉 Eliminar pista nueva (no guardada aún)
  const handleDelete = (id) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  };

  // 👉 Manejadores de drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // 👉 Guardar todas las pistas en Cloudinary + Laravel
  const handleSaveAll = async () => {
    if (!dataSong?.id || tracks.length === 0) {
      alert("Selecciona una canción y agrega al menos una pista antes de guardar.");
      return;
    }

    setUploading(true);
    setLoading(true);

    try {
      const uploadedTracks = [];

      // 1️⃣ Subir cada pista a Cloudinary
      for (let i = 0; i < tracks.length; i++) {
        const t = tracks[i];
        const formData = new FormData();
        formData.append("file", t.file);
        formData.append("upload_preset", "SingerApi"); // 👈 tu preset Cloudinary
        formData.append("folder", "singerApi/multitracks");

        const cloudRes = await fetch(
          "https://api.cloudinary.com/v1_1/dlkky5xuo/auto/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const cloudData = await cloudRes.json();
        if (!cloudData.secure_url) throw new Error("Error en subida Cloudinary");

        uploadedTracks.push({
          name: t.name || `Track ${i + 1}`,
          file_url: cloudData.secure_url,
          order: i + 1,
        });
      }

      // 2️⃣ Guardar en backend Laravel
      for (const track of uploadedTracks) {
        const res = await fetch(
          `https://api.musikoord.com/api/songs/${dataSong.id}/tracks`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: track.name,
              file_url: track.file_url,
              order: track.order,
              volume: 1,
              muted: false,
            }),
          }
        );

        if (!res.ok) throw new Error("Error al guardar pista en backend");
      }

      alert("✅ Todas las pistas se guardaron correctamente!");
      setTracks([]);
      setSongName("");

      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert("❌ Error al guardar las pistas");
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex w-full min-h-screen bg-gray-100">
      {/* LOADING OVERLAY */}
      {loading && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
          <p className="text-white mt-4 text-lg font-medium">
            Subiendo presets... por favor espera ⏳
          </p>
        </div>
      )}

      {/* IZQUIERDA - Carga de pistas */}
      <div className="w-1/2 p-6 bg-white shadow-lg border-r border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          🎧 Cargar Pistas Individuales o en Grupo
        </h2>

        {/* Nombre del multitrack */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del multitrack:
          </label>
          <input
            type="text"
            value={dataSong ? dataSong.name : songName}
            onChange={(e) => setSongName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="Ej: Mi canción de prueba"
          />
        </div>

        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
            isDragging
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <p className="text-gray-600">
            Arrastra tus pistas aquí o{" "}
            <label
              htmlFor="fileInput"
              className="text-blue-600 font-semibold cursor-pointer hover:underline"
            >
              selecciona archivos
            </label>
          </p>
          <input
            id="fileInput"
            type="file"
            accept="audio/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Lista de pistas nuevas */}
        <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-3">
          🎶 Vista previa:
        </h3>
        {tracks.length === 0 ? (
          <p className="text-gray-500 italic">Aún no has agregado pistas...</p>
        ) : (
          <ul className="space-y-3">
            {tracks.map((track) => (
              <li
                key={track.id}
                className="flex flex-col bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={track.name}
                    onChange={(e) => handleNameChange(track.id, e.target.value)}
                    className="text-gray-800 font-medium border-b border-gray-300 focus:outline-none bg-transparent w-3/4"
                  />
                  <button
                    onClick={() => handleDelete(track.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold"
                  >
                    Eliminar
                  </button>
                </div>
                <audio
                  controls
                  className="w-full mt-2 rounded-lg"
                  src={track.previewUrl}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* DERECHA - Controles globales */}
      <div className="w-1/2 p-6 bg-gray-50 overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          🎚️ Ajustes y guardar
        </h2>

        {/* 🎧 Presets existentes */}
        {existingTracks.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Presets actuales de esta canción
            </h3>
            <div className="flex flex-col gap-4">
              {existingTracks.map((track) => (
                <div
                  key={track.id}
                  className="flex flex-col border border-gray-200 p-3 rounded shadow-sm bg-white"
                >
                  <span className="font-medium text-blue-700">{track.name}</span>
                  <audio controls src={track.file_url} className="w-full mt-2"></audio>
                  <button
                    onClick={() => handleDeleteTrack(track.id)}
                    className="mt-3 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tracks.length > 0 ? (
          <div className="">
            <div className="bg-white rounded-xl p-4 shadow-md border">
              <p className="text-gray-700 mb-3">
                Total de pistas nuevas:{" "}
                <span className="font-semibold">{tracks.length}</span>
              </p>
              <ul className="text-sm text-gray-600 list-disc pl-5">
                {tracks.map((track) => (
                  <li key={track.id}>{track.name}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleSaveAll}
              disabled={uploading}
              className={`mt-6 w-full py-3 font-semibold rounded-lg shadow-md transition ${
                uploading
                  ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {uploading ? "⏳ Subiendo..." : "💾 Guardar Multitrack"}
            </button>
          </div>
        ) : (
          <div className="text-gray-500 italic">
            Esperando pistas para guardar...
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadMultitrackForm;
