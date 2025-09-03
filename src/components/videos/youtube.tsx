import React from 'react';

export default function VideoPlayer() {
  return (
    <div
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        backgroundColor: '#000',
        position: 'relative',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        aspectRatio: '16/9',
      }}
    >
      <iframe
        src="https://www.youtube.com/embed/nfjVQkFwb9A?rel=0&modestbranding=1&controls=1"
        title="Video integrado"
        frameBorder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      ></iframe>
    </div>
  );
}
