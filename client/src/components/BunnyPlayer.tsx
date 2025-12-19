
import React from 'react';
import { BUNNY_LIBRARY_ID } from '../utils/contentConfig';
import { AlertCircle } from 'lucide-react';

interface BunnyPlayerProps {
  videoId: string;
  title: string;
  onLoad?: () => void;
}

const BunnyPlayer = ({ videoId, title, onLoad }: BunnyPlayerProps) => {
  // 1. Check if ID is missing
  if (!BUNNY_LIBRARY_ID) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white p-4 text-center">
        <p className="text-sm">
          Videospelaren är inte konfigurerad.<br/>
          <span className="text-xs text-slate-400 font-mono mt-1 block">VITE_BUNNY_LIBRARY_ID saknas i .env</span>
        </p>
      </div>
    );
  }

  // 2. Check for common configuration error (API Key instead of Library ID)
  const isLikelyApiKey = BUNNY_LIBRARY_ID.length > 20 && BUNNY_LIBRARY_ID.includes('-');

  if (isLikelyApiKey) {
    return (
      <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center text-slate-800 p-8 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <h3 className="text-lg font-bold mb-2">Konfigurationsfel</h3>
        <p className="text-xs text-slate-500 mb-4 max-w-xs">
           Det ser ut som att du använder en API-nyckel istället för Library ID i din .env-fil.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden group">
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
