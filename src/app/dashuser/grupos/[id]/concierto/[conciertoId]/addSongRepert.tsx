import React,{useEffect, useState} from "react";
import { MdFormatListBulletedAdd } from "react-icons/md";
import SongsModal from "@/components/songsModal/songsModal"

import {createCustomSongMultiple} from "@/lib/api";



const AddSongRepert = ({ idRepertorio }) => {
    const [open, setOpen] = useState(false);

    //console.log("idRepertorio", idRepertorio);





    const CreateCustomSongs = async (ids) => {
        console.log("ids selected", ids);
        console.log("ids selected", idRepertorio);
        try {
            const response = await createCustomSongMultiple({
                repertorio_id: idRepertorio,
                song_ids: ids,
            });
            console.log("Canciones creadas correctamente:", response);
            setOpen(false); // Cerrar el modal después de crear las canciones
        } catch (error) {
            console.error("Error al crear las custom Songs:", error);
        }
    }






  return (
    <div>

      <div className="flex justify-end">
        <button className="
            text-xl 
            p-2 
            rounded-lg 
            flex 
            items-center 
            justify-center 
            h-10 
            w-10
            cursor-pointer
            "

            onClick={() => setOpen(true)}
            >
            <MdFormatListBulletedAdd />
        </button>

        <SongsModal 
            open={open} 
            onClose={() => setOpen(false)}
            onSelect={(ids) => CreateCustomSongs(ids)} 
        />
      </div>



    </div>
  );
};

export default AddSongRepert;
