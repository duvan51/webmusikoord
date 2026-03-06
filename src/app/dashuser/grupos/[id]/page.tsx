"use client";

import React, { useState, useEffect } from "react";
import { getGroupByID } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { getFromStorage } from "@/utils/storage";
import Repert from "@/components/grupos/repert";
import { Users, Music, ChevronLeft, UserPlus, Calendar, LayoutGrid, Plus, Search, Filter } from "lucide-react";

type UserStorage = {
  access_token: string;
};

const GroupDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const dataToken = getFromStorage<UserStorage & { user: { id: number } }>("user");
    const token = dataToken?.access_token;
    const idGroup = params?.id as string;

    if (token && idGroup && idGroup !== "crear") {
      getGroupByID(idGroup, token)
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          console.error("Error al obtener Grupos", err);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [params?.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Sincronizando comunidad...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-[2.5rem] flex items-center justify-center text-primary shadow-inner">
          <Music size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-[var(--text-primary)] mb-3 tracking-tight">Grupo no encontrado</h2>
          <p className="text-[var(--text-secondary)] font-medium max-w-sm opacity-70">Parece que este grupo no existe o ha sido movido a otro lugar.</p>
        </div>
        <button
          onClick={() => router.push("/dashuser/grupos")}
          className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          Ir a mis grupos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Hero Community Section */}
      <div className="glass-card rounded-[3.5rem] p-8 md:p-14 border border-[var(--glass-border)] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-secondary/20 blur-[100px] rounded-full -mr-64 -mt-64 transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 blur-[80px] rounded-full -ml-40 -mb-40"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <button
              onClick={() => router.back()}
              className="w-14 h-14 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-primary)] hover:bg-primary hover:text-white transition-all shrink-0 shadow-lg active:scale-90"
            >
              <ChevronLeft size={28} />
            </button>
            <div className="text-center md:text-left space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
                  Comunidad Musical
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-accent/20">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
                  En Vivo
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] tracking-tighter leading-none">
                {data?.nombre}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                <div className="flex items-center gap-2.5 text-sm font-bold text-[var(--text-secondary)]">
                  <div className="p-1.5 bg-[var(--glass-bg)] rounded-lg border border-[var(--glass-border)]">
                    <Users size={16} className="text-primary" />
                  </div>
                  <span>{data?.users?.length || 0} Integrantes</span>
                </div>
                <div className="w-1.5 h-1.5 bg-[var(--glass-border)] rounded-full hidden sm:block"></div>
                <div className="flex items-center gap-2.5 text-sm font-bold text-[var(--text-secondary)]">
                  <div className="p-1.5 bg-[var(--glass-bg)] rounded-lg border border-[var(--glass-border)]">
                    <Music size={16} className="text-secondary" />
                  </div>
                  <span>{data?.repertorios?.length || 0} Repertorios</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end gap-6 w-full lg:w-auto">
            <div className="flex -space-x-4">
              {data?.users?.slice(0, 5).map((user: any, idx: number) => (
                <div
                  key={user.id}
                  className="h-14 w-14 rounded-2xl ring-4 ring-[var(--background-end)] bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-xl shadow-2xl relative group/avatar"
                  style={{ zIndex: 10 - idx }}
                  title={user.name}
                >
                  {user.profile_picture ? (
                    <img src={user.profile_picture} alt={user.name} className="h-full w-full object-cover rounded-2xl" />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || "?"
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[var(--background-end)] rounded-full"></div>
                </div>
              ))}
              <button
                className="h-14 w-14 rounded-2xl ring-4 ring-[var(--background-end)] bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-xl active:scale-90 group/add"
                title="Invitar nuevo miembro"
              >
                <UserPlus size={24} className="group-hover/add:scale-110 transition-transform" />
              </button>
            </div>
            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] opacity-40">Músicos activos en el grupo</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Left Column: Repertoires */}
        <div className="xl:col-span-2 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <LayoutGrid size={24} />
              </div>
              <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Repertorios <span className="text-gradient">del Grupo</span></h3>
            </div>

            <button
              onClick={() => router.push(`/dashuser/grupos/${params?.id}/repertorio/nuevo`)}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={20} />
              Nuevo Repertorio
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="px-4 flex gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre de repertorio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-sm"
              />
            </div>
            <button className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl text-[var(--text-secondary)] hover:text-primary transition-all">
              <Filter size={20} />
            </button>
          </div>

          {/* Repertoire List */}
          <div className="space-y-6">
            {data?.repertorios?.length > 0 ? (
              data.repertorios
                .filter((r: any) => r.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((repertorio: any) => (
                  <Repert key={repertorio.id} IdRepertorio={repertorio.id} />
                ))
            ) : (
              <div className="glass-card p-20 rounded-[3rem] border border-dashed border-[var(--glass-border)] flex flex-col items-center justify-center text-center gap-6">
                <div className="w-20 h-20 bg-[var(--glass-bg)] rounded-[2rem] flex items-center justify-center text-[var(--text-secondary)] opacity-20">
                  <Music size={40} />
                </div>
                <div className="space-y-2">
                  <p className="text-[var(--text-primary)] text-xl font-black">Tu biblioteca está vacía</p>
                  <p className="text-sm text-[var(--text-secondary)] font-medium max-w-xs mx-auto opacity-60">Comienza a organizar tus canciones creando tu primer repertorio comunitario.</p>
                </div>
                <button
                  onClick={() => router.push(`/dashuser/grupos/${params?.id}/repertorio/nuevo`)}
                  className="px-8 py-3 bg-primary/10 text-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                >
                  Crear ahora
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Widgets/Community Info */}
        <div className="space-y-8">
          {/* Upcoming Events Widget */}
          <div className="glass-card p-8 rounded-[2.5rem] border border-[var(--glass-border)] space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-primary)] flex items-center gap-2">
              <Calendar size={18} className="text-primary" /> Próximos Ensayos
            </h4>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-3 hover:bg-primary/10 transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Domingo, 10:00 AM</span>
                  <div className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-[9px] font-bold">Confirmado</div>
                </div>
                <p className="text-sm font-black text-[var(--text-primary)]">Ensayo General - Alabanza</p>
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] opacity-60">
                  <LayoutGrid size={12} /> Salón Principal
                </div>
              </div>
              <p className="text-center text-[10px] font-black text-primary uppercase tracking-widest cursor-pointer hover:underline py-2">Agendar nuevo ensayo</p>
            </div>
          </div>

          {/* Activity Widget */}
          <div className="glass-card p-8 rounded-[2.5rem] border border-[var(--glass-border)] space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-primary)] flex items-center gap-2">
              <Users size={18} className="text-secondary" /> Actividad Reciente
            </h4>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-[var(--glass-bg)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                    <Music size={14} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[var(--text-primary)]">Kevin actualizó un repertorio</p>
                    <p className="text-[10px] text-[var(--text-secondary)] opacity-50 font-medium italic">Hace 3 horas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailPage;
