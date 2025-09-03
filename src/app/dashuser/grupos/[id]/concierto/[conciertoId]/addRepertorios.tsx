"use client";
import React, { useState } from "react";
import { createRepertorioSongCategory } from "@/lib/api"


const AddRepertorios = ({idRepertorio}) => {
  const [openModal9, setOpenModal9] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

   const [nombre, setNombre] = useState("");
   const [fecha, setFecha] = useState("");

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    

    const nuevoRepertorio = {
      nombre,
      repertorio_id: idRepertorio 
    };

    try {
      // Aquí harías la llamada a tu API
      console.log("📤 Enviando repertorio:", nuevoRepertorio);

      const data = await createRepertorioSongCategory(nuevoRepertorio);
      console.log("✅ Guardado:", data);
      
      // Limpio form y cierro modal
      setNombre("");
      setOpenModal9(false);
    } catch (error) {
      console.error("❌ Error al guardar repertorio:", error);
    }
  };




  return (
    <div className="flex items-center w-full px-1">
      {/* Scroll horizontal */}
      <div className="flex overflow-x-auto space-x-2 flex-1 pr-2">
        {/*   categoriasSong?.map((x) => (
          <button
            key={x.id}
            onClick={() => handleCardPress(x.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap text-white ${
              selectedId === x.id ? "bg-[#213f69]" : "bg-[#072042]"
            }`}
          >
            {x.nombre ?? "Sin nombre"}
          </button>
        ))  */}
      </div>

      {/* Botón para abrir modal */}
      <button
        onClick={() => setOpenModal9(true)}
        className=" p-2 rounded-lg flex items-center justify-center h-10 w-10"
      >
        ➕<i className="fas fa-clone text-white text-sm"></i>
      </button>

      {/* Modal */}
      {openModal9 && (
        <div
          className="
          fixed 
          inset-0
          bg-black/50 
          flex 
          items-center 
          justify-center 
          z-50"
        >
          <div
            className="
          bg-white 
          rounded-lg 
          p-5 
          w-[50%] 
          max-h-[80%] 
          overflow-y-auto 
          relative

          "
          >
            {/* Cerrar modal */}
            <button
              onClick={() => setOpenModal9(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            {/* Lista de categorías */}
            <div className="flex flex-wrap gap-2 w-full justify-center">
              <div className="">
                <h2 className="text-xl font-semibold mb-4">
                  Agregar nuevo Repertorio
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre del repertorio"
                    className="border p-2 rounded w-full"
                    required
                  />
                  <div className="flex justify-end items-center gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setOpenModal9(false)}
                      className="bg-gray-200 px-3 py-2 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AddRepertorios;
