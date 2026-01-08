"use client";
import React, { useEffect, useState } from "react";
import Buscador from "@/components/buscador/buscador";
import { songs, repertorios } from "@/lib/api";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";

const filters = {
  categorías: ["Cristiana", "Infantil", "Adoración", "Alabanza"],
  tono: ["C", "D", "E", "F", "G", "A", "B"],
  dificultad: ["Fácil", "Media", "Difícil"],
};

const Page = () => {
  const router = useRouter();

  const [searchResults, setSearchResults] = useState([]);
  const [repertorioResults, setRepertorioResults] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [allRepertorios, setAllRepertorios] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ Cargar canciones generales al iniciar
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await songs();
        setAllSongs(res);
      } catch (err) {
        console.error("Error cargando canciones iniciales:", err);
      }
    };

    fetchSongs();
  }, []);

  // ✅ Cargar canciones generales al iniciar
  useEffect(() => {
    const fetchRepertorios = async () => {
      try {
        const res = await repertorios();
        setAllRepertorios(res);
      } catch (err) {
        console.error("Error cargando canciones iniciales:", err);
      }
    };

    fetchRepertorios();
  }, []);

  // ✅ Manejador de búsqueda en vivo
  const handleSearchTermSubmit = (term: string) => {
  setHasSearched(true);

  // 🔒 Seguridad
  if (!term || term.trim().length === 0) {
    setSearchResults([]);
    setRepertorioResults([]);
    return;
  }

  // 🔍 Filtrar canciones
  const filteredSongs = allSongs.filter((song) =>
    (song.title || song.name)
      ?.toLowerCase()
      .includes(term.toLowerCase())
  );

  // 🔍 Filtrar repertorios
  const filteredRepertorios = allRepertorios.filter((rep) =>
    (rep.nombre || rep.titulo)
      ?.toLowerCase()
      .includes(term.toLowerCase())
  );

  setSearchResults(filteredSongs);
  setRepertorioResults(filteredRepertorios);
};

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleGoToRepertorio = (id: number) => {
    router.push(`/repertorios/${id}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Filtros */}
      <aside className="w-64 bg-white p-4 border-r">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>

        {Object.entries(filters).map(([key, values]) => (
          <div className="mb-4" key={key}>
            <h3 className="font-medium mb-2 capitalize">{key}</h3>
            {values.map((v) => (
              <label key={v} className="block text-sm">
                <input type="checkbox" className="mr-2" />
                {v}
              </label>
            ))}
          </div>
        ))}
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6">
        <div className="mb-4">
          <Breadcrumbs />
        </div>

        <Buscador onSearchTermSubmit={handleSearchTermSubmit} />

        {hasSearched && (
          <>
            <h1 className="text-2xl font-bold mt-4 mb-2">
              Resultados de búsqueda
            </h1>

            {/* Canciones */}
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {searchResults.map((cancion) => (
                  <SongCard
                    key={cancion.id}
                    cancion={cancion}
                    onClick={() => router.push(`/songs/${cancion.id}`)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-4">No se encontraron canciones.</p>
            )}

            {/* Repertorios */}
            <h2 className="text-xl font-semibold mb-2">Repertorios</h2>
            {repertorioResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {repertorioResults.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                  >
                    <h2 className="text-lg font-semibold">{rep.nombre}</h2>
                    <p className="text-sm text-gray-600">Fecha: {rep.fecha}</p>
                    <p className="text-sm text-gray-600">
                      Privado: {rep.privado ? "Sí" : "No"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-4">
                No se encontraron repertorios.
              </p>
            )}
          </>
        )}

        {/* Mostrar canciones generales (siempre) */}
        <h2 className="text-xl font-semibold mb-2 py-2">
          {hasSearched ? "Otras canciones disponibles" : "Todas las canciones"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allSongs.map((cancion) => (
            <SongCard
              key={cancion.id}
              cancion={cancion}
              onClick={() =>
                router.push(`/songs/${slugify(cancion.name)}-${cancion.id}`)
              }
            />
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-2 py-2">Repertorios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allRepertorios.map((rep) => (
            <div
              onClick={() => handleGoToRepertorio(rep.id)}
              key={rep.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
            >
              <h2 className="text-lg font-semibold">{rep.nombre}</h2>
              <p className="text-sm text-gray-600">Fecha: {rep.fecha}</p>
              <p className="text-sm text-gray-600">
                Privado: {rep.privado ? "Sí" : "No"}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const SongCard = ({ cancion, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
  >
    <h2 className="text-lg font-semibold">{cancion.name}</h2>
    <p className="text-sm text-gray-600">{cancion.autor}</p>
    <p className="text-sm">
      Categoría: {cancion?.categories?.[0]?.name || "N/A"}
    </p>
    <p className="text-sm">Tono: {cancion.tono || "N/A"}</p>
    <button className="mt-2 text-blue-500 hover:underline text-sm">
      Ver canción
    </button>
  </div>
);

export default Page;
