import React from "react";

type LyricLine = {
  text: string;
  chords?: (string | null)[];
};

type Section = {
  type: string;
  lyrics: LyricLine[];
};

const generateImageFromSong = (
  name: string,
  author: string,
  song: Section[]
): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No se pudo obtener el contexto del canvas.");
    }

    // Fondo blanco
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const logo = new Image();
    logo.src = "/logo.png";

    logo.onload = () => {
      const logoWidth = 200;
      const logoHeight = 200;
      ctx.drawImage(logo, (width - logoWidth) / 2, 40, logoWidth, logoHeight);

      // Título
      ctx.fillStyle = "#000000";
      ctx.font = "bold 60px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(name, width / 2, 280);

      ctx.font = "30px sans-serif";
      ctx.fillText("Autor: " + author, width / 2, 340);

      // Letras
      ctx.textAlign = "left";
      let y = 400;

      song.forEach((section) => {
        // Título de sección
        ctx.fillStyle = "#111111";
        ctx.font = "bold 40px Arial";
        ctx.fillText(section.type, 60, y);
        y += 60;

        section.lyrics.forEach((line) => {
          const words = line.text.trim().split(/\s+/);
          const chords = line.chords || [];

          let x = 60;

          // Dibuja acordes
          ctx.font = "italic 28px Arial";
          ctx.fillStyle = "#007700";

          words.forEach((word, i) => {
            const chord = chords[i];
            const wordWidth = ctx.measureText(word).width;
            const chordWidth = chord ? ctx.measureText(chord).width : 0;

            if (chord) {
              const chordX = x + (wordWidth - chordWidth) / 2;
              ctx.fillText(chord, chordX, y);
            }

            x += wordWidth + ctx.measureText(" ").width;
          });

          // Dibuja texto
          x = 60;
          ctx.font = "36px Arial";
          ctx.fillStyle = "#000000";

          words.forEach((word) => {
            ctx.fillText(word, x, y + 40);
            x += ctx.measureText(word).width + ctx.measureText(" ").width;
          });

          y += 100; // Espaciado entre líneas
        });

        y += 40; // Espaciado entre secciones
      });

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          }
        },
        "image/jpeg",
        0.95
      );
    };

    // En caso de error de carga del logo
    logo.onerror = () => {
      console.error("No se pudo cargar el logo, generando sin él.");

      ctx.fillStyle = "#000000";
      ctx.font = "bold 60px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(name, width / 2, 150);

      ctx.font = "30px sans-serif";
      ctx.fillText("Autor: " + author, width / 2, 200);

      // Puedes repetir aquí el mismo forEach de arriba si quieres seguir sin logo...
    };
  });
};


type Props = {
  name: string;
  author: string;
  song: Section[];
};

const SongImageDownloadButton: React.FC<Props> = ({ name, author, song }) => {
  const handleDownloadImage = async () => {
    try {
      const blob = await generateImageFromSong(name, author, song);
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${name}.jpg`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar la imagen:", error);
    }
  };

  return (
    <button
      onClick={handleDownloadImage}
      className="ml-4 inline-block px-4 bg-green-600 py-2 hover:bg-green-700 rounded text-white text-sm"
    >
      Descargar Imagen
    </button>
  );
};

export default SongImageDownloadButton;
