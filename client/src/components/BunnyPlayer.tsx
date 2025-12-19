
import React, { useState, useEffect } from 'react';
import { BUNNY_LIBRARY_ID, BUNNY_PULL_ZONE } from '../utils/contentConfig';
import { AlertCircle, Lock, Play, PlayCircle, ImageOff } from 'lucide-react';

interface BunnyPlayerProps {
  videoId: string;
  title: string;
  isLocked?: boolean;
  onLoad?: () => void;
  posterUrl?: string; // Optional override for thumbnail
}

const BunnyPlayer = ({ videoId, title, isLocked = false, onLoad, posterUrl }: BunnyPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  // --- 2. THUMBNAIL GENERATION ---
  // Construct dynamic thumbnail URL if Pull Zone is configured, otherwise fallback
  const dynamicThumbnail = BUNNY_PULL_ZONE 
    ? `https://${BUNNY_PULL_ZONE}/${videoId}/thumbnail.jpg`
    : null;
  
  // Start with posterUrl, fallback to dynamicThumbnail, or use dynamic as default
  const [activePoster, setActivePoster] = useState(posterUrl || dynamicThumbnail);

  // Reset state if props change
  useEffect(() => {
    setIsPlaying(false);
    setImgError(false);
    setActivePoster(posterUrl || dynamicThumbnail);
  }, [videoId, posterUrl, dynamicThumbnail]);

  // Handle image error to try fallback
  const handleImageError = () => {
      // If we are currently using posterUrl, and it's broken, try the dynamic one
      if (activePoster === posterUrl && dynamicThumbnail && posterUrl !== dynamicThumbnail) {
          setActivePoster(dynamicThumbnail);
      } else {
          setImgError(true);
      }
  };

  // --- 1. CONFIGURATION CHECKS ---
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

  // Check for common configuration error (API Key instead of Library ID)
  const isLikelyApiKey = BUNNY_LIBRARY_ID.length > 20 && BUNNY_LIBRARY_ID.includes('-');
  if (isLikelyApiKey) {
    return (
      <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center text-slate-800 p-8 text-center border-4 border-red-100">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <h3 className="text-lg font-bold mb-2">Konfigurationsfel</h3>
        <p className="text-xs text-slate-500 mb-4 max-w-xs">
           Det ser ut som att du använder en API-nyckel istället för Library ID i din .env-fil.
        </p>
      </div>
    );
  }

  // --- 3. RENDER: LOCKED STATE ---
  if (isLocked) {
    return (
      <div className="relative w-full h-full bg-slate-900 overflow-hidden group">
        {/* Background Image (Blurred/Darkened) */}
        {activePoster && !imgError ? (
          <img 
            src={activePoster} 
            alt="Låst innehåll" 
            className="w-full h-full object-cover opacity-30 blur-sm grayscale"
            onError={handleImageError}
          />
        ) : (
          <div className="absolute inset-0 bg-slate-800 pattern-grid-lg opacity-20" />
        )}
        
        {/* Lock Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-slate-400">
          <div className="bg-slate-800/80 p-4 rounded-full mb-3 border border-slate-700 backdrop-blur-sm">
             <Lock className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm font-bold uppercase tracking-wider">Låst Innehåll</p>
        </div>
      </div>
    );
  }

  // --- 4. RENDER: CLICK-TO-PLAY (POSTER STATE) ---
  if (!isPlaying) {
    return (
      <div className="relative w-full h-full bg-black cursor-pointer group overflow-hidden" onClick={() => setIsPlaying(true)}>
        
        {/* Poster Image */}
        {activePoster && !imgError ? (
          <img 
            src={activePoster} 
            alt={title} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-900">
             <ImageOff className="w-10 h-10 mb-2 opacity-50" />
             <p className="text-xs">Ingen förhandsvisning</p>
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
           <div className="w-16 h-16 bg-blue-600/90 rounded-full flex items-center justify-center text-white shadow-2xl backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-500">
              <Play className="w-8 h-8 ml-1 fill-current" />
           </div>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">{title}</h3>
        </div>
      </div>
    );
  }

  // --- 5. RENDER: ACTIVE PLAYER (IFRAME) ---
  // Construct URL internally
  const embedUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=true&preload=true`;

  return (
    <div className="relative w-full h-full bg-black shadow-lg overflow-hidden">
      <iframe
        src={embedUrl}
        loading="eager"
        className="absolute inset-0 w-full h-full border-0 animate-fade-in"
        allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
        allowFullScreen={true}
        title={title}
        onLoad={onLoad}
      />
    </div>
  );
};

export default BunnyPlayer;
