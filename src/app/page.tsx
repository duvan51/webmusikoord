"use client";

import { useEffect, useState } from "react";
import { getGroupByID } from "@/lib/api";
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import CardSongOne from "@/components/cardOne/cardOne";
import CardSongTwo from "@/components/cardOne/cardTwo";
import { Search } from "lucide-react";
import Youtube from "@/components/videos/youtube";
import CardCategorias from "@/components/cardCategorias/cardCategorias";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Song {
  id: number;
  title: string;
  lyrics: string;
}

interface Repertorio {
  id: number;
  nombre: string;
  custom_song: Song[];
}

interface Grupo {
  nombre?: string;
  repertorios?: Repertorio[];
}

export default function Home() {
  const router = useRouter();
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

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
      grupo?.repertorios &&
      grupo.repertorios.length > 0 &&
      grupo.repertorios[0].custom_song &&
      grupo.repertorios[0].custom_song.length > 0
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
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto w-full">
      <Header />

      <main className="flex-1 flex flex-col items-center text-[var(--text-primary)] px-4 md:px-8 pb-20 transition-colors duration-500">
        {/* Hero Section */}
        <section className="w-full text-center py-12 md:py-20 animate-float">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Organiza tu Música <br />
            <span className="text-gradient">Como un Profesional</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg md:text-xl max-w-2xl mx-auto font-medium">
            La plataforma definitiva para músicos y directores de alabanza.
            Crea, organiza y ensaya tus repertorios en un solo lugar.
          </p>
        </section>

        {/* Action Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-16">
          {options.map((item, index) => (
            <div
              key={index}
              className="glass-card rounded-3xl p-6 cursor-pointer group flex flex-col items-center transition-all duration-500 shadow-xl shadow-black/5"
              onClick={() => router.push(item.screen)}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500"
                style={{ backgroundColor: item.color + '20', color: item.color }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-10 h-10 object-contain drop-shadow-lg"
                  style={{ transform: `rotate(${item.rotate})` }}
                />
              </div>
              <div className="text-center">
                <h3 className="font-black text-xl mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider opacity-60">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl mx-auto mb-20">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-full px-6 py-4 shadow-2xl">
              <Search className="text-primary mr-4 w-6 h-6" />
              <input
                type="text"
                placeholder="Busca canciones, artistas o géneros..."
                className="w-full outline-none bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-40 text-lg font-medium"
                onFocus={handleClick}
              />
            </div>
          </div>
        </div>

        {/* Featured Content */}
        <div className="w-full space-y-24">
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <span className="w-2 h-8 bg-primary rounded-full"></span>
                Canciones Populares
              </h2>
              <button
                onClick={() => router.push("/songs")}
                className="text-primary hover:text-white transition-colors text-sm font-semibold"
              >
                Ver todas →
              </button>
            </div>
            <CardSongOne />
          </section>

          {/* Advanced Repertorios Section */}
          <section className="w-full">
            <div className="flex items-center gap-2 mb-8">
              <span className="w-2 h-8 bg-accent rounded-full"></span>
              <h2 className="text-2xl font-bold tracking-tight">Repertorios más buscados</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="glass-card rounded-3xl p-8 overflow-hidden border border-white/5 shadow-2xl">
                {grupo?.nombre && (
                  <div className="flex items-center justify-between mb-6">
                    <div className="px-4 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
                      {grupo.nombre}
                    </div>
                  </div>
                )}

                {grupo?.repertorios?.slice(0, 1).map((rep) => (
                  <div key={rep.id} className="flex flex-col h-[500px]">
                    <h4 className="text-3xl font-black mb-8 text-[var(--text-primary)]">{rep.nombre}</h4>

                    <div className="flex flex-1 gap-6 overflow-hidden">
                      {/* Lyrics Preview */}
                      <div className="flex-1 bg-[var(--background-end)]/10 rounded-2xl p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-primary)]/20 scrollbar-track-transparent border border-[var(--glass-border)]">
                        {selectedSong ? (
                          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                              {selectedSong.title}
                            </h2>

                            {JSON.parse(selectedSong.lyrics || "[]").map((section: any, sectionIdx: number) => (
                              <div key={sectionIdx} className="mb-8 last:mb-0">
                                <div className="text-accent/60 font-black text-xs uppercase tracking-tighter mb-3">
                                  {section.type}
                                </div>

                                {section.lyrics.map((lyric: any, lineIdx: number) => (
                                  <div key={lineIdx} className="mb-4">
                                    <div className="flex flex-wrap gap-x-2 mb-1">
                                      {lyric.text.split(' ').map((word: string, wordIdx: number) => (
                                        <div key={wordIdx} className="flex flex-col">
                                          <span className="text-[10px] text-secondary font-bold h-4">
                                            {lyric.chords?.[lyric.text.indexOf(word)] || ""}
                                          </span>
                                          <span className="text-sm text-[var(--text-primary)] opacity-90">{word}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-40">
                            <p className="font-medium italic">Selecciona una música del repertorio</p>
                          </div>
                        )}
                      </div>

                      {/* Song Selector */}
                      <div className="w-48 flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[var(--glass-border)]">
                        {rep.custom_song?.map((song: any) => (
                          <button
                            key={song.id}
                            className={`p-4 rounded-xl text-left transition-all duration-300 border ${selectedSong?.id === song.id
                              ? "bg-primary border-primary shadow-lg shadow-primary/20 scale-[1.02] text-white"
                              : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--glass-hover-bg)]"
                              }`}
                            onClick={() => setSelectedSong(song)}
                          >
                            <span className="text-sm font-bold block truncate">{song.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-card rounded-3xl overflow-hidden min-h-[500px]">
                <Youtube />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-8">
              <span className="w-2 h-8 bg-secondary rounded-full"></span>
              <h2 className="text-2xl font-bold tracking-tight">Categorías Populares</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <CardCategorias filterWrite="Adoracion" />
              <CardCategorias filterWrite="Alabanza" />
            </div>
          </section>

          <section>
            <CardSongTwo />
          </section>

          <footer className="w-full">
            <div className="relative w-full h-[400px] group overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-t from-background-end to-transparent z-10"></div>
              <Image
                src="/assets/2.gif"
                alt="Más categorías"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority={false}
              />
              <div className="absolute bottom-8 left-8 z-20">
                <h3 className="text-3xl font-black mb-2">Explora más ritmos</h3>
                <p className="text-white/60">Descubre miles de canciones en nuestra biblioteca</p>
              </div>
            </div>
          </footer>
        </div>
      </main>

      <Footer />
    </div>
  );
}
