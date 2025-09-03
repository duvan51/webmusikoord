'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { updateSong } from '@/lib/api'; // Ajusta la ruta si es distinta

const EditSong = ({idSong}) => {
  const [name, setName] = useState('');
  const [autor, setAutor] = useState('');
  const [texts, setTexts] = useState('');
  const [songComplet, setSongComplet] = useState('');
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const songId = Number(params?.id);

  useEffect(() => {
    const loadSong = async () => {
      try {
        const song = await getSong(songId);
        setName(song.name || '');
        setAutor(song.autor || '');
        setTexts(song.song || '');
        setSongComplet(song.song || '');
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar canción:', error);
        setLoading(false);
      }
    };

    if (songId) {
      loadSong();
    }
  }, [songId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSong(songId, {
        name,
        autor,
        song: songComplet,
      });
      alert('✅ Canción actualizada');
      router.push('/dashSuperUsuario'); // Ajusta la ruta si es distinta
    } catch (error) {
      console.error('Error al actualizar canción:', error);
    }
  };

  if (loading) return <p className="p-4">Cargando canción...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Canción</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="p-2 border rounded"
          type="text"
          placeholder="Nombre de la canción"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="p-2 border rounded"
          type="text"
          placeholder="Autor"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
        />

        <textarea
          className="p-2 border rounded min-h-[100px]"
          placeholder="Letra"
          value={texts}
          onChange={(e) => {
            setTexts(e.target.value);
            setSongComplet(e.target.value);
          }}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
};

export default EditSong;
