"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFromStorage } from "@/utils/storage";
import { getUserById } from "@/lib/api";

type UserData = {
  name: string;
  photo: string;
};
type UserStorage = {
  access_token: string;
  name: string;
};


const Header = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
  const data = getFromStorage<UserStorage & { user: { id: number } }>("user");

  const token = data?.access_token;
  const userId = data?.user?.id;

  if (token && userId) {
    getUserById(userId, token)
      .then((res) => {
        const userData: UserData = {
          name: res.name,
          photo: res.profile_picture || "https://static.vecteezy.com/system/resources/previews/022/123/337/original/user-icon-profile-icon-account-icon-login-sign-line-vector.jpg", // Placeholder if no photo
        };
        setUser(userData);
      })
      .catch((err) => {
        console.error("Error al obtener usuario", err);
        setUser(null);
      });
  } else {
    setUser(null);
  }
}, []);



  console.log("user en header:", user);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };



  return (
    <header className="flex justify-between items-center px-8 py-6 bg-[#251a4e]">
      <div className="text-white text-2xl font-bold">Musikoord</div>

      {user ? (
        <div className="flex items-center gap-4">
          <img
            src={user.photo}
            alt={user.name}
            className="w-10 h-10 rounded-full border border-white cursor-pointer"
            onClick={() => router.push("/dashuser/settings")}
          />
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      ) : (
        <button
          onClick={() => router.push("/login")}
          className="bg-white text-[#251a4e] px-4 py-2 rounded shadow hover:bg-gray-200 transition cursor-pointer"
        >
          Iniciar sesión
        </button>
      )}
    </header>
  );
};

export default Header;

