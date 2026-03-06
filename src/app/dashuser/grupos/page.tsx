"use client";

import React, { useEffect } from "react";
import { getUserById } from "@/lib/api";
import { getFromStorage } from "@/utils/storage";
import { tiempoTranscurrido } from "@/utils/tiempoTranscurrido";
import { useRouter } from "next/navigation";
import { Users, Plus, Calendar, ChevronRight } from "lucide-react";

type UserStorage = {
  access_token: string;
  name: string;
};

const GroupsPage = () => {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);

  useEffect(() => {
    const data = getFromStorage<UserStorage & { user: { id: number } }>("user");
    const token = data?.access_token;
    const userId = data?.user?.id;

    if (token && userId) {
      getUserById(userId, token)
        .then((res) => setUser(res))
        .catch((err) => console.error("Error al obtener usuario", err));
    }
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-2">
            Mis <span className="text-gradient">Grupos</span>
          </h1>
          <p className="text-[var(--text-secondary)] font-medium text-lg">
            Gestiona tus equipos de alabanza y sus repertorios.
          </p>
        </div>

        <button
          onClick={() => router.push("/dashuser/grupos/crear")}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95 whitespace-nowrap"
        >
          <Plus size={20} strokeWidth={3} />
          Nuevo Grupo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Crear grupo card (Empty state style) */}
        {(!user?.groups || user.groups.length === 0) && (
          <div
            onClick={() => router.push("/dashuser/grupos/crear")}
            className="group glass-card rounded-[3rem] p-12 border-2 border-dashed border-[var(--glass-border)] flex flex-col items-center justify-center text-center gap-6 cursor-pointer hover:border-primary/50 transition-all duration-500 min-h-[400px]"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
              <Plus size={48} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">Crea tu primer grupo</h3>
              <p className="text-[var(--text-secondary)] font-medium max-w-[260px] mx-auto opacity-60 text-base">Empieza a organizar tus canciones y ensayos con tu equipo hoy mismo.</p>
            </div>
          </div>
        )}

        {/* 📦 GRUPOS EXISTENTES */}
        {user?.groups?.map((group: any) => (
          <div
            key={group.id}
            className="glass-card rounded-[3rem] p-8 border border-[var(--glass-border)] hover:border-primary/30 transition-all duration-500 cursor-pointer group flex flex-col gap-8 shadow-xl shadow-black/5"
            onClick={() => router.push(`/dashuser/grupos/${group.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Users size={32} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] group-hover:text-primary transition-colors">
                    {group.nombre}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                      {group?.repertorios?.length || 0} Repertorios
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--glass-bg)] border border-[var(--glass-border)] group-hover:bg-primary group-hover:text-white transition-all">
                <ChevronRight size={20} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] opacity-50 uppercase tracking-[0.2em] mb-2 px-2">
                Últimos repertorios
              </div>

              {group?.repertorios?.slice(0, 3).map((repertorio: any) => (
                <div
                  key={repertorio.id}
                  className="flex items-center justify-between p-5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl hover:bg-[var(--glass-hover-bg)] hover:border-primary/20 transition-all group/item"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-secondary rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]"></div>
                    <span className="text-base font-bold text-[var(--text-primary)] group-hover/item:text-primary transition-colors">{repertorio.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-secondary)] opacity-60">
                    <Calendar size={14} className="text-accent" />
                    {tiempoTranscurrido(repertorio.created_at)}
                  </div>
                </div>
              ))}

              {group?.repertorios?.length > 3 && (
                <div className="flex justify-center pt-2">
                  <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em] group-hover:scale-105 transition-transform">
                    + Ver {group.repertorios.length - 3} más
                  </span>
                </div>
              )}

              {(!group?.repertorios || group.repertorios.length === 0) && (
                <div className="p-8 text-center bg-[var(--glass-bg)] rounded-3xl border border-dashed border-[var(--glass-border)] opacity-40 italic font-medium text-sm text-[var(--text-secondary)]">
                  Aún no hay repertorios en este grupo
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupsPage;
