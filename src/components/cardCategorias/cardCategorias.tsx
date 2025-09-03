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
        console.log(categorias)
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
    <div className="mt-5 w-full bg-[#324879] rounded-lg h-28 flex overflow-hidden">
      {/* Imagen */}
      <div className="w-1/5 flex justify-center items-center">
        <img
          src={categoria?.image_url || "@/logo.png"}
          alt={categoria?.name || "Categoría"}
          className="w-4/5 h-4/5 object-contain"
        />
      </div>

      {/* Información */}
      <div className="flex-1 text-white px-2 py-1 flex flex-col justify-around">
        <strong className="text-white text-base">{categoria?.name}</strong>
        <p className="text-xs">Repertorios Worship para tu congregación</p>
        <div className="flex justify-between text-[10px]">
          <span>Misionero</span>
          <span>Misionero</span>
          <span>Misionero</span>
          <span>Misionero</span>
        </div>
      </div>

      {/* Círculo con cantidad */}
      <div className="w-[80px] flex justify-center items-center">
        <div className="bg-white rounded-full h-[65px] w-[65px] flex flex-col justify-center items-center">
          <span className="text-[#072042] text-xl font-bold">+100</span>
          <span className="text-[8px] text-gray-400">Adoraciones</span>
        </div>
      </div>
    </div>
  );
};

export default CardCategoriaOne;
