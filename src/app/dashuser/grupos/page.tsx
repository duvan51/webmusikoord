"use client";

import React, { useEffect } from "react";
import { getUserById } from "@/lib/api";
import { getFromStorage } from "@/utils/storage";
import { tiempoTranscurrido } from '@/utils/tiempoTranscurrido';
import { useRouter } from 'next/navigation';


type UserStorage = {
  access_token: string;
  name: string;
};

const page = () => {
  const router = useRouter();
  const [user, setUser] = React.useState(null);

  useEffect(() => {
    const data = getFromStorage<UserStorage & { user: { id: number } }>("user");

    const token = data?.access_token;
    const userId = data?.user?.id;

    if (token && userId) {
      getUserById(userId, token)
        .then((res) => {
          setUser(res);
        })
        .catch((err) => {
          console.error("Error al obtener usuario", err);
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, []);


   
   // console.log("tiempoTranscurrido:", tiempoTranscurrido('2025-07-22T04:13:00.000000Z'));

  // console.log("user en header:", user);

  return (
    <div className="p-4">
      <h1 className="text-white text-2xl font-bold mb-4">Grupos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {user?.groups?.map((group: any) => (
          <div key={group.id} className="bg-white p-4 rounded shadow"
            onClick={()=> router.push(`/dashuser/grupos/${group.id}`)}
          >
            <h2 className="text-l font-bold mb-2">{group.nombre}</h2>
            <div className="flex flex-col gap-2">
                {group?.repertorios?.map((repertorio: any) => (
                    <div key={repertorio.id} 
                        className="text-sm bg-gray-100 p-2 rounded cursor-pointer hover:bg-gray-200"
                        >
                        <div className=" flex justify-between">
                            <div>{repertorio.nombre}</div>
                            <div className="text-xs">{tiempoTranscurrido(repertorio.created_at)}</div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default page;
