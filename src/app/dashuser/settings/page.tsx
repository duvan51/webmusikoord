"use client";

import { useState, useEffect } from "react";
import { upDateUserById } from "@/lib/api";
import { getFromStorage } from "@/utils/storage";

type UserStorage = {
  access_token: string;
  name: string;
};

export default function DashNav() {
  const [name, setName] = useState(" ");
  const [email, setEmail] = useState(" ");
  const [image, setImage] = useState(
    "https://tse3.mm.bing.net/th/id/OIP.WynFp_Cjoy7LEo3JW1OBJgHaE4?cb=thfc1&rs=1&pid=ImgDetMain&o=7&rm=3"
  );
  const [info, setInfo] = useState<UserStorage & { user: { id: number } } | null>(null);

  useEffect(() => {
    // Solo se ejecuta en el cliente
    const user = getFromStorage<UserStorage & { user: { id: number } }>("user");
    setInfo(user);
    if (user?.user?.name) setName(user.user.name);
    if (user?.user?.email) setEmail(user.user.email);
  }, []);


  const Actualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = info?.user?.id;
    if (!id) {
      alert("ID de usuario no encontrado");
      return;
    }
    const data = {
      name,
      email,
      profile_picture: image,
    };
    try {
      await upDateUserById(id, info?.access_token || "", data);
      alert("✅ Canción actualizada");
      //  router.push('/dashSuperUsuario'); // Ajusta la ruta si es distinta
    } catch (error) {
      console.error("Error al actualizar canción:", error);
    }
  };


  //console.log(info?.user?.email)

  return (
    <div className="text-white p-6 rounded-lg shadow space-y-6 ">
      <div className="w-full">
        {/* Imagen de perfil y edición de URL */}
        <div className="flex items-center space-x-4">
          <img
            src={image}
            alt="Foto de perfil"
            className="w-30 h-30 rounded-full border-2 border-white"
          />
          <div className="flex flex-col space-y-1 w-full">
            <label className="text-sm text-gray-200 font-bold">
              URL de la foto:
            </label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="
                text-white 
                 mt-2
                px-2 py-2 
                rounded 
                w-full 
                focus:outline-none
                border 
                border-white 
                text-white 
                placeholder-white 
                p-2 
                "
            />
          </div>
        </div>

        {/* Nombre */}
        <div className="space-y-1">
          <label className="text-sm text-gray-200 font-bold">
            Nombre completo:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="
            text-white 
            mt-2 
            px-2 
            py-2 
            rounded 
            w-full 
            focus:outline-none
            border 
            border-white 
            text-white 
            placeholder-white 
            p-2 
            "
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm text-gray-200 font-bold">
            Correo electrónico:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
            text-white
            mt-2 
            px-2 
            py-2 
            rounded 
            w-full 
            focus:outline-none
            border 
                border-white 
                text-white 
                placeholder-white 
                p-2 
            "
          />
        </div>
      </div>
      <div>
        <button
          onClick={Actualizar}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
        >
          Actualizar Cambios
        </button>
      </div>
    </div>
  );
}
