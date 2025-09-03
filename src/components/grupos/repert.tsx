"use client";

import React, { use, useEffect } from "react";
import { repertoriosById } from "@/lib/api";
import Canciones from "./songOriginal";
import Link from "next/link";

const Repert = ({ IdRepertorio }) => {
  const [data, setData] = React.useState(null);

  useEffect(() => {
    if (IdRepertorio) {
      repertoriosById(IdRepertorio)
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          console.error("Error al obtener Grupos", err);
          setData(null);
        });
    } else {
      setData(null);
    }
  }, [IdRepertorio]);

  

  return (
    <div className="bg-white rounded-lg py-4 px-6">
      <div className="flex justify-between ">
        <div>{data?.nombre} 
      
            <Link href={`/dashuser/grupos/2/concierto/${data?.id}`}>
              👁️ Ver detalles
            </Link>

     
        </div>
        <div className="text-xs">Hace 2 días</div>
      </div>

      {data?.repertorio_song_category?.map(
        (songCategory) => (
          (
            <div
              className="bg-gray-100 p-2 rounded-lg mt-4"
              key={songCategory.id}
            >
              <div className="">
                <div className="text-xm font-semibold">
                  {songCategory?.nombre}
                </div>
                <div className="flex gap-4 mt-2">
                  <div className="w-1/2">
                    {Array.isArray(songCategory?.customSongs) &&
                    songCategory.customSongs.length > 0 ? (
                      songCategory.customSongs.map((cancionArray, index) => {
                        const firstSong = cancionArray[0]; // primer item del subarray
                        return firstSong?.original_song_id ? (
                          <Canciones
                            key={firstSong.id ?? `${songCategory.id}-${index}`}
                            song={firstSong}
                          />
                        ) : null;
                      })
                    ) : (
                      <div className="text-gray-500 text-sm italic">
                        No hay canciones
                      </div>
                    )}
                  </div>
                  <div className="w-1/2">
                    <div>video o canciones</div>
                  </div>
                </div>
              </div>
            </div>
          )
        )
      )}

      {data?.comentarios?.map((comentario) => (
        <div
          className="p-2 rounded-lg mt-2  w-full border-b-1 border-gray-100"
          key={comentario.id}
        >
          <div className="flex w-full">
            <div className="text-xm font-semibold w-1/6">
              <div className="w-12 h-12 bg-gray-300 rounded-full inline-block mr-2"></div>
            </div>
            <div className="flex flex-col gap-4  w-5/6">
              <div className="flex w-full justify-between">
                <div>{comentario?.user?.name} </div>
                <div className="text-xs text-gray-400">
                  {comentario?.created_at}{" "}
                </div>
              </div>
              <div> {comentario?.contenido} </div>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-4">
        <div className="flex flex-col gap-2">
          <textarea
            placeholder="Escribe tu comentario..."
            className="border border-gray-300 rounded-lg p-2 w-full resize-y min-h-[100px]"
          />
          <button className="bg-blue-500 text-white rounded-lg px-4 py-2 self-end">
            Comentar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Repert;
