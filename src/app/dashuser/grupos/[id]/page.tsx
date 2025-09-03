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

  //console.log("data:", data);

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
                <div className="w-10 h-10 rounded-full bg-white">1</div>
                <div className="w-10 h-10 rounded-full bg-white">2</div>
                <div className="w-10 h-10 rounded-full bg-white">3</div>
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
