"use client";

import React, { useState, useEffect } from "react";
import { createGroup } from "@/lib/api";
import { getFromStorage } from "@/utils/storage";
import { useRouter } from "next/navigation";
import { Users, Plus, ChevronLeft, Save, Calendar, Mail, X } from "lucide-react";
import { toast } from "react-toastify";

type UserStorage = {
    access_token: string;
};

export default function CrearGrupoPage() {
    const router = useRouter();
    const [nombre, setNombre] = useState("");
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [members, setMembers] = useState<string[]>([]);
    const [currentEmail, setCurrentEmail] = useState("");
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const data = getFromStorage<UserStorage & { user: { id: number } }>("user");
        if (data?.access_token) {
            setToken(data.access_token);
            setUserId(data.user.id);
        } else {
            router.push("/login");
        }
    }, [router]);

    const addMember = () => {
        if (!currentEmail.trim()) return;
        if (!currentEmail.includes("@")) {
            toast.warning("Por favor ingresa un correo válido");
            return;
        }
        if (members.includes(currentEmail.trim())) {
            toast.info("Este correo ya ha sido agregado");
            return;
        }
        setMembers([...members, currentEmail.trim()]);
        setCurrentEmail("");
    };

    const removeMember = (email: string) => {
        setMembers(members.filter(m => m !== email));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!nombre.trim()) {
            toast.error("El nombre del grupo es obligatorio");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                nombre: nombre.trim(),
                name: nombre.trim(),
                user_id: userId,
                fecha: fecha,
                members: members
            };

            await createGroup(payload, token);

            toast.success("¡Grupo creado con éxito!");
            router.push("/dashuser/grupos");
        } catch (error: any) {
            console.error("Error al crear el grupo:", error);

            if (error.code === 'ECONNABORTED') {
                toast.error("La conexión tardó demasiado. Inténtalo de nuevo.");
            } else {
                const apiError = error.response?.data;
                // Si Laravel devuelve errores de validación específicos
                if (apiError?.errors) {
                    const firstErrorKey = Object.keys(apiError.errors)[0];
                    const firstErrorMessage = apiError.errors[firstErrorKey][0];
                    toast.error(`Error: ${firstErrorMessage}`);
                } else {
                    const serverMessage = apiError?.message || apiError?.error;
                    toast.error(serverMessage ? `Error: ${serverMessage}` : "Error al crear el grupo. Revisa el nombre.");
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="w-12 h-12 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--glass-hover-bg)] transition-all"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight">
                        Crear <span className="text-gradient">Nuevo Grupo</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] font-medium">
                        Empieza tu nueva comunidad de músicos.
                    </p>
                </div>
            </div>

            <div className="glass-card rounded-[3rem] p-8 md:p-12 border border-[var(--glass-border)] shadow-2xl relative overflow-hidden">
                {/* Decoración de fondo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32"></div>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary px-2">
                            <Users size={18} />
                            Nombre de la Agrupación
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: Coro Central, Alabanza Joven..."
                                className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl px-6 py-5 text-xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                                required
                                autoFocus
                            />
                            <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] font-medium opacity-60 px-4 italic">
                            Este nombre será visible para todos los miembros que invites después.
                        </p>
                    </div>

                    {/* Fecha (Requerida por el Backend) */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary px-2">
                            <Calendar size={18} />
                            Fecha de Creación/Inicio
                        </label>
                        <input
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl px-6 py-5 text-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                            required
                        />
                    </div>

                    {/* Miembros del Equipo */}
                    <div className="space-y-4 pt-4 border-t border-[var(--glass-border)]">
                        <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary px-2">
                            <Mail size={18} />
                            Invitar Miembros (por correo)
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="email"
                                value={currentEmail}
                                onChange={(e) => setCurrentEmail(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMember(); } }}
                                placeholder="ejemplo@correo.com"
                                className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                            />
                            <button
                                type="button"
                                onClick={addMember}
                                className="px-6 py-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl hover:bg-primary hover:text-white transition-all font-black text-sm uppercase tracking-widest flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Agregar
                            </button>
                        </div>

                        {/* Lista de Miembros Agregados */}
                        <div className="flex flex-wrap gap-3 mt-4">
                            {members.map((email) => (
                                <div
                                    key={email}
                                    className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-sm font-bold animate-in zoom-in-50 duration-300"
                                >
                                    <Mail size={14} />
                                    {email}
                                    <button
                                        type="button"
                                        onClick={() => removeMember(email)}
                                        className="hover:text-red-500 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {members.length === 0 && (
                                <p className="text-xs text-[var(--text-secondary)] opacity-40 italic px-2">
                                    Aún no has agregado miembros para invitar.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-xl active:scale-95 ${isSubmitting
                                ? "bg-[var(--glass-bg)] text-[var(--text-secondary)] cursor-not-allowed"
                                : "bg-gradient-to-r from-primary to-secondary text-white shadow-primary/20 hover:scale-105 hover:shadow-primary/40"
                                }`}
                        >
                            {isSubmitting ? (
                                <>Creando...</>
                            ) : (
                                <>
                                    <Save size={22} />
                                    Crear Grupo
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Info adicional o tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-3xl border border-[var(--glass-border)] flex flex-col gap-2">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                        <Plus size={20} />
                    </div>
                    <h4 className="font-bold text-[var(--text-primary)]">¿Qué sigue?</h4>
                    <p className="text-xs text-[var(--text-secondary)] opacity-70">
                        Después de crear el grupo podrás añadir repertorios y concertar ensayos.
                    </p>
                </div>
                <div className="glass-card p-6 rounded-3xl border border-[var(--glass-border)] flex flex-col gap-2 opacity-50">
                    <div className="w-10 h-10 rounded-xl bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] flex items-center justify-center">
                        <Users size={20} />
                    </div>
                    <h4 className="font-bold text-[var(--text-primary)]">Invitaciones</h4>
                    <p className="text-xs text-[var(--text-secondary)] opacity-70">
                        Próximamente podrás invitar miembros mediante un enlace único.
                    </p>
                </div>
            </div>
        </div>
    );
}
