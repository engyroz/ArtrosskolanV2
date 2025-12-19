
import React from 'react';
import { BUNNY_LIBRARY_ID } from '../utils/contentConfig';

interface BunnyPlayerProps {
  videoId: string;
  title: string;
  onLoad?: () => void;
}

const BunnyPlayer = ({ videoId, title, onLoad }: BunnyPlayerProps) => {
  // Check if ID is configured (empty string or undefined means missing)
  if (!BUNNY_LIBRARY_ID) {
    return (
      <div className="w-full aspect-video bg-slate-900 flex items-center justify-center text-white p-4 text-center">
        <p className="text-sm">
          Videospelaren är inte konfigurerad.<br/>
          <span className="text-xs text-slate-400 font-mono mt-1 block">VITE_BUNNY_LIBRARY_ID saknas i .env</span>
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black shadow-lg overflow-hidden">
      <iframe
        src={`https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=false`}
        loading="lazy"
        className="absolute inset-0 w-full h-full border-0"
        allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
        allowFullScreen={true}
        title={title}
        onLoad={onLoad}
      />
    </div>
  );
};

export default BunnyPlayer;
