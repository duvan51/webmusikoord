"use client";

import React, { useState, useEffect } from "react";
import { songs, deleteSong } from "@/lib/api";
import { useRouter } from 'next/navigation';  




const CardSongOne = () => {
  const [data, setData] = useState([]);
  const router = useRouter(); 

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const song = await songs();
        setData(song);
        //console.log(song);
      } catch (error) {
        console.error("Error al obtener las canciones:", error);
      }
    };

    fetchSongs();
  }, []);

  
  const handleSelectSong = (id: string) => {
    router.push(`/songs/${id}`); // ✅ así navegas en Next.js
  };


  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5"

    >
      {data.slice(-8).reverse().map((song, index) => (
        <div
          key={song.id}
          onClick={() => handleSelectSong(song.id)}
          style={{
            height: 100,
            backgroundColor: "#072042",
            borderRadius: 10,
            cursor: "pointer",
            display: "flex",
            overflow: "hidden",
          }}
        >
          {/* Izquierda (Número) */}
          <div
            style={{
              backgroundColor:"#ffffff",
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderTopRightRadius: 50,
              borderBottomRightRadius: 50,
              color: "#072042",
              fontWeight: "bold",
              fontSize: 30,
            }}
          >
            {index + 1}
          </div>

          {/* Centro (Detalles canción) */}
          <div
            style={{
              color: "#ffffff",
              flex: 3,
              padding: "8px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              backgroundColor: "#072042",
              
            }}
          >
            <strong>{song.name || "Título no disponible"}</strong>
            <p style={{ fontSize: 10, margin: 0 }}>
              {song?.song?.[0]?.lyrics?.[0]?.text || "Sin letra disponible"}...
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                fontSize: 10,
              }}
            >
              <span>{song.autor || "Autor"}</span>
              <span>{song?.categories?.[0]?.name || " "}</span>
              <span>{song.instrument || "Instrumento"}</span>
            </div>
          </div>

          {/* Derecha (Acorde principal) */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: 30,
            }}
          >
            {song?.song?.[0]?.lyrics?.[0]?.chords[0] || "🎹"}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardSongOne;
