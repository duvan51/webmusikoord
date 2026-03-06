"use client";

import { useState, useEffect } from "react";
import { upDateUserById } from "@/lib/api";
import { getFromStorage } from "@/utils/storage";
import { User, Mail, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

type UserStorage = {
  access_token: string;
  name: string;
};

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(
    "https://tse3.mm.bing.net/th/id/OIP.WynFp_Cjoy7LEo3JW1OBJgHaE4?cb=thfc1&rs=1&pid=ImgDetMain&o=7&rm=3"
  );
  const [info, setInfo] = useState<UserStorage & { user: { id: number, profile_picture?: string } } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const user = getFromStorage<UserStorage & { user: { id: number, name: string, email: string, profile_picture?: string } }>("user");
    if (user) {
      setInfo(user);
      if (user.user.name) setName(user.user.name);
      if (user.user.email) setEmail(user.user.email);
      if (user.user.profile_picture) setImage(user.user.profile_picture);
    }
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const id = info?.user?.id;
    if (!id) {
      toast.error("Error: ID de usuario no encontrado");
      return;
    }

    setIsSubmitting(true);
    const data = {
      name,
      email,
      profile_picture: image,
    };

    try {
      await upDateUserById(id, info?.access_token || "", data);
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-2">
          Ajustes de <span className="text-gradient">Cuenta</span>
        </h1>
        <p className="text-[var(--text-secondary)] font-medium text-lg">
          Personaliza tu perfil y gestiona tus credenciales.
        </p>
      </div>

      <div className="glass-card rounded-[3rem] p-8 md:p-12 border border-[var(--glass-border)] shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32"></div>

        <form onSubmit={handleUpdate} className="relative z-10 space-y-10">
          {/* Section: Profile Image */}
          <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-[var(--glass-border)]">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <img
                src={image}
                alt="Vista previa"
                className="relative w-32 h-32 rounded-full border-4 border-[var(--glass-border)] object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://static.vecteezy.com/system/resources/previews/022/123/337/original/user-icon-profile-icon-account-icon-login-sign-line-vector.jpg";
                }}
              />
            </div>

            <div className="flex-1 w-full space-y-3">
              <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary">
                <ImageIcon size={16} />
                Imagen de Perfil (URL)
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://ejemplo.com/foto.jpg"
                className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              />
              <p className="text-[10px] text-[var(--text-secondary)] font-bold italic opacity-60 px-2">
                Pega la URL de una imagen para actualizar tu foto.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Section: Name */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary">
                <User size={16} />
                Nombre Completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                />
              </div>
            </div>

            {/* Section: Email */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary">
                <Mail size={16} />
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-xl active:scale-95 ${isSubmitting
                  ? "bg-[var(--glass-bg)] text-[var(--text-secondary)] cursor-not-allowed"
                  : "bg-gradient-to-r from-primary to-secondary text-white shadow-primary/20 hover:scale-105 hover:shadow-primary/30"
                }`}
            >
              {isSubmitting ? (
                <>Cargando...</>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-[var(--glass-border)] flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-[var(--text-primary)]">Seguridad</h4>
            <p className="text-[10px] text-[var(--text-secondary)] font-bold opacity-60">Cambiar contraseña</p>
          </div>
        </div>
      </div>
    </div>
  );
}
