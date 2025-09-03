"use client";
import { useEffect, useState } from "react";
import React from "react";
import { songs, deleteSong } from "@/lib/api";
import { MdEditSquare,MdDeleteForever } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import Buscador from "@/components/buscador/buscador";
import Breadcrumbs from '@/components/breadcrumbs/breadcrumbs';


const Page = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      const res = await songs();
      setData(res);
    };
    fetchSongs();
  }, []);

  const handleOpenCategories = (categories=[]) => {
    setSelectedCategories(categories);
    setShowModal(true);
  };

  const deleteSongs = async (songId) => {
  const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta canción?");
  if (!confirmDelete) return;

  const result = await deleteSong(songId);
  if (result) {
    setData(data.filter(song => song.id !== songId));
    toast.success("✅ Canción eliminada con éxito");
  } else {
    toast.error("❌ Error al eliminar la canción");
  }
};

 
 // console.log(data)


  return (
    <div className="p-4 ">
      <ToastContainer position="top-right" />
      <Breadcrumbs />
      <div className="text-white ">
        <div className="flex flex-col w-full py-4">
          <Buscador />
          <div>filtros</div>
        </div>

        <div className="w-full">
          {data?.map((x) => (
            <div className="flex gap-4 border-b border-gray-500 py-1">
              <div className="w-60">{x?.name}</div>
              <div className="w-42">
                <button
                  className="text-blue-400 underline"
                  onClick={() => handleOpenCategories(x?.categories)}
                >
                  Ver categorías
                </button>
              </div>
              <div className="w-42">{x?.autor}</div>
              <div className="flex gap-4">
                <div onClick={()=> router.push(`/dashSuperUsuario/songs/${x.id}`)} className="text-xl cursor-pointer">
                  <MdEditSquare />
                </div>

                 <div onClick={() => deleteSongs(x.id)} className="text-red-400 hover:underline text-xl">
                  <MdDeleteForever />
                 </div>
              </div>
            </div>
          ))}
        </div>
        {showModal && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center  bg-opacity-40 z-50">
            <div className="bg-white rounded-lg p-4 w-[300px] max-h-[400px] overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-lg text-black">Categorías</h2>
                <button onClick={() => setShowModal(false)}>❌</button>
              </div>
              <ul className="list-disc pl-4 text-black">
                {selectedCategories.length === 0 ? (
                  <li className="text-black">No hay categorías</li>
                ) : (
                  selectedCategories.map((cat, index) => (
                    <li key={index}>{cat.name}</li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
