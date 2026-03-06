import apiInstancia from '@/lib/axiosInstance'
import axios from "axios";


export const songs = async () => {
  try {
    const { data } = await apiInstancia.get('/songs')
    return data
  } catch (error) {
    console.error('❌ Error al obtener canciones:', error)
    return [] // o puedes lanzar un error con: throw new Error('...')
  }
}


export const createSong = async (data = {}) => {
  try {
    const response = await apiInstancia.post(`/songs`, data);
    // console.log("post realizado correctamente", response)
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const deleteSong = async (id = 0) => {
  try {
    const response = await apiInstancia.delete(`/songs/${id} `);
    // console.log("post realizado correctamente", response)
    return response.data;
  } catch (error) {
    console.error(error);
  }
};



type SongData = {
  song: any[]; // o puedes definir una interfaz más precisa en lugar de `any[]`
  categories: any[]; // idem, si tienes una interfaz, úsala en lugar de `any[]`
};
export const updateSong = async (id: 0, data: SongData) => {
  // console.log("data=> ", data, "id=>  ", id);

  // console.log("🌐 Llamando a:", `${CloudPhp}/category`);

  try {
    const response = await apiInstancia.put(`/songs/${id}`, {
      song: data?.song,
      categories: data?.categories,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};



export const getSongById = async (id: number) => {
  try {
    const response = await apiInstancia.get(`/songs/${id}`);
    // console.log("res=>:", response.data);
    return response.data; // Retorna la respuesta si necesitas manejarla en otro lugar
  } catch (error) {
    console.error("Error al obtener cancion:", error);
    throw error; // Puedes lanzar el error para manejarlo en el componente que llama esta función
  }
};


export const getCategorias = async () => {
  try {
    const response = await apiInstancia.get(`/category`);
    // console.log("res=>:", response.data);
    return response.data; // Retorna la respuesta si necesitas manejarla en otro lugar
  } catch (error) {
    console.error("Error al obtener categorias:", error);
    throw error; // Puedes lanzar el error para manejarlo en el componente que llama esta función
  }
};


interface Song {
  id: number;
  title: string;
  artist: string;
  // agrega más propiedades según tu backend
}

export const searchingSongs = async (query: string): Promise<Song[]> => {
  try {
    const response = await apiInstancia.get(`/multisearch?query=${query}`);
    return response.data; // asegúrate que response.data sea un array de canciones
  } catch (error) {
    console.error("Error al buscar canciones:", error);
    throw error;
  }
};

export const search = async (query: string) => {
  try {
    const response = await apiInstancia.get(`/multisearch?query=${query}`);
    return response.data; // { songs: [...], repertorios: [...] }
  } catch (error) {
    console.error("Error en searchMulti:", error);
    throw error;
  }
};



export const getGroupByID = async (id: string | number, token?: string) => {
  try {
    const response = await apiInstancia.get(`/groups/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener el grupo:", error);
    throw error;
  }
};

export const createGroup = async (data: any, token: string) => {
  try {
    const response = await apiInstancia.post(`/groups`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("❌ Error de validación del servidor (422):", error.response.data);
    }
    throw error;
  }
};

export const deleteGroup = async (id: number | string, token: string) => {
  try {
    const response = await apiInstancia.delete(`/groups/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el grupo:", error);
    throw error;
  }
};


//repertorios
export const repertorios = async () => {
  try {
    const { data } = await apiInstancia.get('/repertorios')
    return data
  } catch (error) {
    console.error('❌ Error al obtener canciones:', error)
    return [] // o puedes lanzar un error con: throw new Error('...')
  }
}


export const repertoriosById = async (id: number, token?: string) => {
  try {
    const response = await apiInstancia.get(`/repertorios/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener repertorio:", error);
    throw error;
  }
};


export const createRepertorio = async (data = {}) => {
  try {
    const response = await apiInstancia.post(`/repertorios`, data);
    // console.log("post realizado correctamente", response)
    return response.data;
  } catch (error) {
    console.error(error);
  }
};


// --- repertorio song categorys ---
export const createRepertorioSongCategory = async (data = {}) => {
  console.log("request", data)
  try {
    const response = await apiInstancia.post(`/repertoriosongcategory`, data);
    // console.log("post realizado correctamente", response)
    return response.data;
  } catch (error) {
    console.error("Error  crear la categoria del repertorio:", error);
  }
};











//login 
export const login = async (email: string, password: string) => {
  try {
    const response = await apiInstancia.post(`/login`, {
      email,
      password,
    });
    console.log("datos del user=> ", response.data)
    return response.data;
  } catch (error) {
    console.error("Error al obtener datos:", error);
    throw error;
  }
};

export const LoginGoogle = async (tokenGoogle: string) => {
  try {
    const response = await apiInstancia.post("/auth/google", {
      token: tokenGoogle,
    });
    return response.data;
  } catch (error) {
    console.error("Error al loguear con Google:", error);
  }
};



export const getUserById = async (id: number, token: string) => {
  //console.log("idUser  => ", id);
  // console.log("token id=> ", token);
  try {
    const response = await apiInstancia.get(`/user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json", // Esto también es recomendado para Laravel
      },
    });
    //console.log("res=>:", response);
    return response.data; // Retorna la respuesta si necesitas manejarla en otro lugar
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    throw error; // Puedes lanzar el error para manejarlo en el componente que llama esta función
  }
};


export const upDateUserById = async (id: number, token: string, data: {}) => {
  //console.log("idUser  => ", id);
  // console.log("token id=> ", token);
  try {
    const response = await apiInstancia.put(`/users/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json", // Esto también es recomendado para Laravel
      },
    });
    //console.log("res=>:", response);
    return response.data; // Retorna la respuesta si necesitas manejarla en otro lugar
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    throw error; // Puedes lanzar el error para manejarlo en el componente que llama esta función
  }
};




//--- custom Songs -----
export const createCustomSong = async (data: any, token: string) => {
  try {
    const response = await apiInstancia.post(`/customSong`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("❌ ERROR 422 DETAILS FROM SERVER:", error.response.data);
    }
    console.error("Error al crear la canción personalizada:", error);
    throw error;
  }
};

export const createCustomSongMultiple = async (data: any) => {
  try {
    const response = await apiInstancia.post(`/custom-songs/multiple`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("STATUS:", error.response?.status);
      console.error("DATA:", error.response?.data);
      console.error("HEADERS:", error.response?.headers);
    } else {
      console.error("ERROR DESCONOCIDO:", error);
    }
    throw error;
  }
};

export const updateCustomSong = async (id: number, data: any, token: string) => {
  try {
    const response = await apiInstancia.put(`/customSong/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("❌ ERROR UPDATE CUSTOM SONG:", error.response.data);
    }
    throw error;
  }
};



