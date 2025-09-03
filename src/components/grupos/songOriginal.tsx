"use client";

import React, { useState, useEffect } from "react";
import { getSongById } from "@/lib/api";

const Canciones = ({ song }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (song) {
      getSongById(song.original_song_id)
        .then((res) => {
            //console.log(res)
          setData(res);
        })
        .catch((err) => {
          console.error("Error al obtener Grupos", err);
          setData(null);
        });
    } else {
      setData(null);
    }
  }, [song]);



  return (
  <div>
    <div className=" p-2 rounded-lg">
      <div className="text-sm font-semibold"> - {data?.name}</div>
    </div>
  </div>
  );
};

export default Canciones;
