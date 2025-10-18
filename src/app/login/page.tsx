"use client";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {login} from "@/lib/api"; // Asegúrate de que esta ruta sea correcta
import {saveToStorage} from "@/utils/storage"; // Asegúrate de que esta ruta sea correcta
import { useRouter } from "next/navigation"; 

import LoginGoogle from "@/components/loginGoogle/loginGoogle";
import { toast } from "react-toastify";



type LoginFormInputs = {
  email: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();



  const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
    //console.log("Login Data:", data);
    login(data.email, data.password)
      .then(response => {
        console.log("Login successful:", response);
        
        saveToStorage("user", response);
        router.push("/");
        toast.success("✅ Inicio de sesión exitoso");
      })
      .catch(error => {
      if (error.response && error.response.status === 401) {
        toast.error("Contraseña incorrecta");
      } else {
        toast.error("Ocurrió un error en el inicio de sesión");
      }
      console.error("Login error:", error);
    });
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email"
              {...register("email", { required: "Este campo es obligatorio" })}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: { value: 6, message: "Mínimo 6 caracteres" },
              })}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition cursor-pointer"
          >
            Iniciar sesión
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿No tienes cuenta? <a href="/register" className="text-blue-600">Regístrate</a>
        </p>

        <LoginGoogle />
      </div>
    </div>
  );
};

export default LoginPage;
