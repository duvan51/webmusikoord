import React, { useEffect, useState } from "react";
import { getCategorias } from "@/lib/api"; // Asegúrate de que tenga tipado si usas TS
//import imageAdoracion from "../../assets/categorias/orar.png"; // Asegúrate de que esto se procese como estático en Vite/Webpack

type Category = {
  name: string;
  image_url?: string;
};

type Props = {
  filterWrite: string;
};

const CardCategoriaOne: React.FC<Props> = ({ filterWrite }) => {
  const [categoria, setCategoria] = useState<Category | null>(null);

  useEffect(() => {
    if (!filterWrite) return;

    const fetchSongs = async () => {
      try {
        const categorias = await getCategorias();
        //console.log(categorias)
        const selected = categorias.find(
          (cat: Category) =>
            cat.name.trim().toLowerCase() === filterWrite.trim().toLowerCase()
        );
        setCategoria(selected);
      } catch (error) {
        console.error("Error al obtener las categorías:", error);
      }
    };

    fetchSongs();
  }, [filterWrite]);

  return (
    <div className="mt-5 w-full glass-card rounded-3xl h-32 flex overflow-hidden border-[var(--glass-border)] hover:border-primary/30 transition-all duration-500 shadow-xl shadow-black/5">
      {/* Imagen */}
      <div className="w-1/4 flex justify-center items-center bg-[var(--glass-bg)] p-4 border-r border-[var(--glass-border)]">
        <img
          src={categoria?.image_url || "/logo.png"}
          alt={categoria?.name || "Categoría"}
          className="w-full h-full object-contain drop-shadow-2xl brightness-110"
        />
      </div>

      {/* Información */}
      <div className="flex-1 p-6 flex flex-col justify-center gap-1">
        <strong className="text-[var(--text-primary)] text-xl font-black tracking-tight group-hover:text-primary transition-colors">
          {categoria?.name}
        </strong>
        <p className="text-xs text-[var(--text-secondary)] font-medium italic opacity-80">
          Repertorios Worship para tu congregación
        </p>
        <div className="flex gap-4 text-[9px] font-bold text-primary uppercase tracking-widest mt-2">
          <span>Worship</span>
          <span>•</span>
          <span>En vivo</span>
          <span>•</span>
          <span>Pro</span>
        </div>
      </div>

      {/* Círculo con cantidad */}
      <div className="w-32 flex justify-center items-center pr-4">
        <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl h-20 w-20 flex flex-col justify-center items-center shadow-lg shadow-primary/30 scale-90 rotate-3 group-hover:rotate-0 transition-transform duration-500">
          <span className="text-white text-2xl font-black">+100</span>
          <span className="text-[8px] text-white/70 font-bold uppercase tracking-tighter">Canciones</span>
        </div>
      </div>
    </div>
  );
};

export default CardCategoriaOne;
