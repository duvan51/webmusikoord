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


import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const Header = () => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-6 md:px-8 py-4 glass mt-4 rounded-3xl mx-4 mb-4 md:mb-8 transition-all duration-500">
      <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push("/")}>
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
          M
        </div>
        <div className="text-[var(--text-primary)] text-2xl font-black tracking-tight">
          Musikoord<span className="text-accent">.</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Toggle Theme Button */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-primary)] hover:scale-110 transition-all cursor-pointer shadow-lg active:scale-95"
          title={theme === "light" ? "Modo Oscuro" : "Modo Claro"}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {user ? (
          <div className="flex items-center gap-4 md:gap-6">
            <div
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-1 pr-4 rounded-full transition-all cursor-pointer border border-white/10"
              onClick={() => router.push("/dashuser/settings")}
            >
              <img
                src={user.photo}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-white/20 object-cover"
              />
              <span className="text-sm font-bold text-[var(--text-primary)] hidden md:block opacity-90">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-[var(--text-secondary)] hover:text-accent text-sm font-bold transition-colors cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="bg-primary text-white px-6 py-2.5 rounded-full font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all cursor-pointer active:scale-95 tracking-wide"
          >
            Iniciar sesión
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;

