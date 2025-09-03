"use client";

import { useEffect, useState } from "react";
import { getGroupByID } from "@/lib/api";
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import CardSongOne from "@/components/cardOne/cardOne";
import { Search } from "lucide-react";
import Youtube from "@/components/videos/youtube";
import CardCategorias from "@/components/cardCategorias/cardCategorias";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [grupo, setGrupo] = useState({});
  const [selectedSong, setSelectedSong] = useState(null);

  const handleClick = () => {
    router.push("/songs");
  };

  const id = 4;
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const result = await getGroupByID(id);
        setGrupo(result);
      } catch (error) {
        console.log(error);
      }
    };

    if (id) fetchGroup();
  }, [id]);

  useEffect(() => {
    if (
      grupo?.repertorios?.length > 0 &&
      grupo.repertorios[0].custom_song?.length > 0
    ) {
      setSelectedSong(grupo.repertorios[0].custom_song[0]);
    }
  }, [grupo]);

  const options = [
    {
      screen: "/searching-songs",
      image: "/azul.png",
      title: "ENSAYA",
      description: "Musikoord te ayuda a organizar",
      rotate: "4deg",
      color: "#024583",
    },
    {
      screen: "/create-song",
      image: "/blanco.png",
      title: "CREA",
      description: "Repertorios únicos",
      rotate: "-4deg",
      color: "#0f0f0f",
    },
    {
      screen: "/create-elements",
      image: "/naranja.png",
      title: "INSPÍRATE",
      description: "Musikoord hace el resto",
      rotate: "-4deg",
      color: "#ff7014",
    },
    {
      screen: "/create-song-write",
      image: "/rojo.png",
      title: "ESCRIBE",
      description: "Tus propias versiones",
      rotate: "4deg",
      color: "#ff0000",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col px-20"
      style={{
        background: "linear-gradient(180deg, #251a4e 0%, #100929 100%)",
      }}
    >
      <Header />
      <main className="flex flex-1 flex-col items-center text-white">
        {/* opciones preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {options.map((item, index) => (
            <div
              key={index}
              className="rounded-lg overflow-hidden cursor-pointer"
              onClick={() => router.push(item.screen)}
            >
              <div
                className="flex flex-col items-center justify-center p-4"
                style={{ backgroundColor: item.color }}
              >
                <div className="mb-2 text-center">
                  <p className="font-bold">{item.title}</p>
                  <p className="text-sm">{item.description}</p>
                </div>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-32 h-24 object-contain"
                  style={{ transform: `rotate(${item.rotate})` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="w-full max-w-md mx-auto mt-10 pt-10">
          <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="text-gray-500 mr-2 w-6 h-6" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full outline-none bg-transparent text-gray-800 placeholder-gray-400"
              onFocus={handleClick}
            />
          </div>
        </div>

        <div className="py-10">
          <CardSongOne />
        </div>

        <div className="w-full px-2 py-4">
          <div>Repertorios más buscados</div>
          <div className="flex w-full gap-6">
            <div className="w-1/2 text-black">
              <div className="w-full h-[500px] bg-white p-4 rounded-lg">
                <div className="font-bold">{grupo?.nombre}</div>
                <div>
                  {grupo?.repertorios?.slice(0, 1).map((rep) => (
                    console.log("grupo==> ",grupo),
                    <div key={rep.id}>
                      <h4 className="text-xl font-bold mb-4">{rep.nombre}</h4>
                      <div className="flex gap-4 h-full">
                        {/* Parte izquierda: contenido de la canción seleccionada */}
                        <div className="w-2/3 max-h-[400px] overflow-y-auto shadow border p-4 rounded z-0 relative">
                          {selectedSong ? (
                            <div>
                              <h2 className="text-2xl font-semibold text-blue-600 mb-4">
                                {selectedSong.title}
                              </h2>

                              {JSON.parse(selectedSong.lyrics || "[]").map(
                                (section, sectionIdx) => (
                                  <div key={sectionIdx} className="mb-6">
                                    <div className="text-[#4A90E2] font-bold text-lg mb-2">
                                      {section.type}
                                    </div>

                                    {section.lyrics.map((lyric, lineIdx) => (
                                      <div key={lineIdx} className="mb-2">
                                        <div className="hidden md:flex">
                                          {Array.from({
                                            length: lyric.text.length,
                                          }).map((_, charIdx) => (
                                            <div
                                              key={charIdx}
                                              className="text-xs relative w-[10px] h-4 text-purple-700 font-semibold text-center overflow-visible"
                                            >
                                              {lyric.chords?.[charIdx] ?? ""}
                                            </div>
                                          ))}
                                        </div>

                                        {/* Aquí está el scroll si hay mucho texto */}
                                        <div className="whitespace-pre-wrap leading-5 font-sans text-xs max-h-[200px] overflow-y-auto">
                                          {lyric.text}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500">
                              Selecciona una canción para ver su contenido
                            </p>
                          )}
                        </div>

                        {/* Parte derecha: botones de canciones con scroll si son muchas */}
                        <div className="w-1/3 border p-4 rounded shadow flex flex-col gap-2 max-h-[400px] overflow-y-auto">
                          {rep.custom_song?.map((song) => (
                            <button
                              key={song.id}
                              className={`py-1 px-3 rounded text-left transition-all ${
                                selectedSong?.id === song.id
                                  ? "bg-blue-700 text-white font-bold text-xs"
                                  : "bg-blue-500 text-white hover:bg-blue-600 text-xs"
                              }`}
                              onClick={() => setSelectedSong(song)}
                            >
                              {song.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-1/2">
              <Youtube />
            </div>
          </div>
        </div>

        <div className="w-full mt-5">
          <div className="px-4">
            <h2 className="text-white text-lg font-semibold">
              Categorías Populares
            </h2>
          </div>

          <div className="px-5 mt-3 space-y-4 block gap-4 md:flex">
            <CardCategorias filterWrite="Adoracion" />
            <CardCategorias filterWrite="Alabanza" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
