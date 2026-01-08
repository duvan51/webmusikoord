"use client";

import React, { useState, useEffect } from "react";
import { getGroupByID } from "@/lib/api";
import { useParams } from "next/navigation";
import { getFromStorage } from "@/utils/storage";
import Repert from "@/components/grupos/repert";

type UserStorage = {
  access_token: string;
};

const page = () => {
  const params = useParams();
  //console.log("params:", params);
  const [data, setData] = useState(null);

  useEffect(() => {
    const dataToken = getFromStorage<UserStorage & { user: { id: number } }>(
      "user"
    );

    const token = dataToken?.access_token;
    const idGroup = params?.id as string;

    //console.log(idGroup, "idGroup");

    //console.log(params, "params");

    if (token && idGroup) {
      getGroupByID(idGroup, token)
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          console.error("Error al obtener Grupos", err);
          setData(null);
        });
    } else {
      setData(null);
    }
  }, []);

  console.log("data:", data);

  return (
    <div>
      {data ? (
        <div>
          <div>
            <div></div>
            <div>
              <div className="text-white text-xl">{data?.nombre}</div>
              <div className="text-white">{data?.length} miembros</div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  {data?.users?.map((user: any) => {
                    const initial = user.name?.charAt(0).toUpperCase() || "?";

                    return (
                      <div
                        key={user.id}
                        title={user.name}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden"
                      >
                        {user.profile_picture ? (
                          <img
                            src={user.profile_picture}
                            alt={user.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-lg">{initial}</span>
                        )}
                      </div>
                    );
                  })}

                  {/* ➕ Botón agregar persona */}
                  <button
                    onClick={() => {
                      console.log("Agregar persona");
                      // aquí puedes abrir modal
                    }}
                    className="w-10 h-10 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition"
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 flex flex-col gap-4">
            {data?.repertorios?.map((repertorio: any) => (
              <Repert key={repertorio.id} IdRepertorio={repertorio.id} />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-white">Cargando grupo...</p>
      )}
    </div>
  );
};

export default page;
