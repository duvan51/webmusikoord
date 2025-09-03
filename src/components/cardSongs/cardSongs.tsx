'use client';

import React, { useState, useEffect } from "react";
import { songs, deleteSong } from "@/lib/api";


interface CardSongsProps {
  onSelectSong: (id: number) => void;
}


const CardSongs = ({ onSelectSong }: CardSongsProps) => {
  const [data, setData] = useState([]);
  //const navigate = useNavigate();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const song = await songs();
        setData(song);
       // console.log(song)
      } catch (error) {
        console.error("Error al obtener las canciones:", error);
      }
    };

    fetchSongs();
  }, []);

  {/*
  const handleSelectSong = (song) => {
    navigate(`/song/${song.id}`);
  };
  */
  }


  return (
    <div className="flex flex-col gap-4" >
  {data.map((song, index) => (
    
    <div
      key={song.id}
      onClick={() => onSelectSong(song.id)}
      style={{
        height: 100,
        backgroundColor: "white",
        borderRadius: 10,
        cursor: "pointer",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* Izquierda (Número) */}
      <div
        style={{
          backgroundColor: "#072042",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTopRightRadius: 50,
          borderBottomRightRadius: 50,
          color: "white",
          fontWeight: "bold",
          fontSize: 30,
        }}
      >
        {index + 1}
      </div>

      {/* Centro (Detalles canción) */}
      <div
        style={{
          color: "black",
          flex: 3,
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
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
          color: "black",
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

export default CardSongs;
