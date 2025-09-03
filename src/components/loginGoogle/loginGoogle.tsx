import React from "react";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
import { LoginGoogle } from "@/lib/api";
import { jwtDecode } from "jwt-decode"; // 👈 usamos jwtDecode, no jwt_decode

const clientId =
  "316106480930-cib0p16f3dc3tsrft0e98p28timv1st5.apps.googleusercontent.com";

interface GooglePayload {
  email: string;
  name: string;
  sub: string; // googleId
  picture: string;
}

function App() {

   const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const tokenGoogle = credentialResponse.credential;

    try {
      // Aquí mandas el token de Google a tu backend
      const response = await LoginGoogle(tokenGoogle);

      console.log("Respuesta del backend:", response);
      localStorage.setItem("token", response.access_token);
      
    } catch (error) {
      console.error("Error enviando token al backend:", error);
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
