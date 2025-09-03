"use client";

import React, { useState, useEffect } from "react";
import { songs, deleteSong } from "@/lib/api";

const CardSongOne = () => {
  const [data, setData] = useState([]);
  //const navigate = useNavigate();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const song = await songs();
        setData(song);
        console.log(song);
      } catch (error) {
        console.error("Error al obtener las canciones:", error);
      }
    };

    fetchSongs();
  }, []);

  {
    /*
  const handleSelectSong = (song) => {
    navigate(`/song/${song.id}`);
  };
  */
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
      {data.slice(0, 8).map((song, index) => (
        <div
          key={song.id}
          onClick={() => console.log(song)}
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

export default CardSongOne;
