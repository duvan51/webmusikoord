import React, { useRef, useState } from "react";
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

export default function AudioVisualCreator() {
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleGenerate = async () => {
    if (!ffmpeg.isLoaded()) await ffmpeg.load();
    setProcessing(true);

    ffmpeg.FS("writeFile", "input.jpg", await fetchFile(imageFile));
    ffmpeg.FS("writeFile", "audio.mp3", await fetchFile(audioFile));

    await ffmpeg.run(
      "-loop", "1",
      "-i", "input.jpg",
      "-i", "audio.mp3",
      "-c:v", "libx264",
      "-tune", "stillimage",
      "-c:a", "aac",
      "-b:a", "192k",
      "-pix_fmt", "yuv420p",
      "-shortest",
      "-vf", "scale=640:480",
      "output.mp4"
    );

    const data = ffmpeg.FS("readFile", "output.mp4");
    const url = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
    setVideoURL(url);
    setProcessing(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
      <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} />
      <button onClick={handleGenerate} disabled={processing}>
        {processing ? "Procesando..." : "Generar video"}
      </button>
      {videoURL && (
        <>
          <video controls src={videoURL} width="640" height="480" />
          <a href={videoURL} download="reel.mp4" className="text-blue-500">Descargar Reel</a>
        </>
      )}
    </div>
  );
}
