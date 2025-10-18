import React from "react";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
import { LoginGoogle } from "@/lib/api";
import {saveToStorage} from "@/utils/storage"; 
import { jwtDecode } from "jwt-decode"; // 👈 usamos jwtDecode, no jwt_decode

import { toast } from "react-toastify";
import { useRouter } from "next/navigation"; 



const clientId =
  "316106480930-cib0p16f3dc3tsrft0e98p28timv1st5.apps.googleusercontent.com";

interface GooglePayload {
  email: string;
  name: string;
  sub: string; // googleId
  picture: string;
}

function App() {
   const router = useRouter();

   const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const tokenGoogle = credentialResponse.credential;

    try {
        // Mandas el token de Google al backend
        const response = await LoginGoogle(tokenGoogle);
        console.log("Login successful:", response);
        console.log("Respuesta del backend:", response);



        // Guardar toda la info
        saveToStorage("user", response);

        // Redirigir al home
        router.push("/");

        // Mensaje de éxito
        toast.success("✅ Inicio de sesión con Google exitoso");
    } catch (error) {
        console.error("Error enviando token al backend:", error);
        toast.error("Ocurrió un error en el inicio de sesión con Google");
    }
};


  const handleError = () => {
    console.log("Error en el login");
  };


  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "50px",
        }}
      >
        <h2>Login con Google</h2>
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
