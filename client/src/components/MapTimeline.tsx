import React from 'react';
import { Check, Lock } from 'lucide-react';

interface MapTimelineProps {
  currentLevel: number;
  currentXP: number;
  maxXP: number;
  startLevel?: number;
  onLevelClick?: (level: number) => void;
}

const MapTimeline = ({ currentLevel, currentXP, maxXP, startLevel = 1, onLevelClick }: MapTimelineProps) => {
    // Coordinate System (416 x 260)
    // Left X: 53 (12.74%)
    // Right X: 363 (87.26%)
    // Y Centers: 32.5, 97.5, 162.5, 227.5 (12.5%, 37.5%, 62.5%, 87.5%)
    
    const PATHS = [
      { id: 1, d: "M 53 32.5 C 153 32.5, 263 97.5, 363 97.5" },
      { id: 2, d: "M 363 97.5 C 263 97.5, 153 162.5, 53 162.5" },
      { id: 3, d: "M 53 162.5 C 153 162.5, 263 227.5, 363 227.5" }
    ];

    const renderTimelineNode = (level: number) => {
        const isSkipped = level < startLevel;
        const isCompleted = !isSkipped && level < currentLevel;
        const isActive = level === currentLevel;
        const isLocked = level > currentLevel;
        const isStartNode = level === startLevel;

        const isLeft = level % 2 !== 0; 
        
        const topPct = [12.5, 37.5, 62.5, 87.5][level - 1];
        const leftPct = isLeft ? 12.74 : 87.26;

        const interactClasses = "cursor-pointer transform transition-transform duration-300 active:scale-95";
        const zIndex = isActive ? "z-30" : isCompleted ? "z-20" : "z-10";

        return (
            <div 
                key={level} 
                className={`absolute flex items-center justify-center w-[90px] h-[90px] ${interactClasses} ${zIndex}`}
                onClick={() => onLevelClick && onLevelClick(level)}
                style={{ 
                    top: `${topPct}%`, 
                    left: `${leftPct}%`,
                    transform: `translate(-50%, -50%) ${isActive ? 'scale(1.25)' : 'scale(1)'}`
                }}
            >
                <div className="relative flex items-center justify-center"> 
                    
                    {/* START BADGE */}
                    {isStartNode && (
                        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 border border-slate-400 px-2 py-0.5 rounded shadow-sm z-50">
                            <span className="text-[9px] font-black text-slate-600 tracking-wider block leading-none">START</span>
                        </div>
                    )}

                    {isSkipped && (
                        <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-200 flex flex-col items-center justify-center text-slate-300 opacity-100 shadow-sm z-10">
                             <span className="font-bold text-[10px] uppercase tracking-wide text-slate-400">Nivå {level}</span>
                        </div>
                    )}

                    {isCompleted && (
                        <div 
                          className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-200 flex flex-col items-center justify-center text-emerald-700 shadow-sm z-20"
                        >
                            <Check className="w-5 h-5 mb-0.5 stroke-[2.5]" />
                            <span className="font-bold text-[8px]">NIVÅ {level}</span>
                        </div>
                    )}

                    {isLocked && (
                        <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-200 flex flex-col items-center justify-center text-slate-300 shadow-sm z-10">
                            <Lock className="w-4 h-4 mb-0.5" />
                            <span className="font-bold text-[8px] text-slate-400">NIVÅ {level}</span>
                        </div>
                    )}

                    {isActive && (
                        <div className="transform transition-all">
                             <div className="relative flex items-center justify-center w-[90px] h-[90px]">
                                {(currentXP >= maxXP) && (
                                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20 scale-110"></div>
                                )}
                                <div className="w-16 h-16 bg-blue-600 rounded-full flex flex-col items-center justify-center shadow-xl shadow-blue-900/40 z-10 ring-4 ring-white">
                                    <span className="text-[8px] text-blue-100 font-bold uppercase tracking-widest mb-0.5">Nivå</span>
                                    <span className="text-2xl font-black text-white leading-none">{level}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="relative w-full aspect-[8/5] mb-4">
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-0" 
              viewBox="0 0 416 260" 
              preserveAspectRatio="none"
            >
               <defs>
                   <linearGradient id="grad-hero-ltr" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="#10B981" />
                       <stop offset="100%" stopColor="#2563EB" />
                   </linearGradient>
                   <linearGradient id="grad-hero-rtl" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="#2563EB" />
                       <stop offset="100%" stopColor="#10B981" />
                   </linearGradient>

                   {/* Ghost Fade Gradients */}
                   <linearGradient id="grad-ghost-ltr" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0" />
                       <stop offset="100%" stopColor="#94A3B8" stopOpacity="1" />
                   </linearGradient>
                   <linearGradient id="grad-ghost-rtl" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="#94A3B8" stopOpacity="1" />
                       <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0" />
                   </linearGradient>
               </defs>

               {/* Background paths */}
               {PATHS.map(p => (
                   <path 
                      key={`bg-${p.id}`}
                      d={p.d} 
                      fill="none" 
                      stroke="#CBD5E1" 
                      strokeWidth="4" 
                      strokeDasharray="8,8" 
                      strokeLinecap="round"
                      className="opacity-30"
                   />
               ))}

               {PATHS.map(p => {
                   if (currentLevel <= p.id) return null;
                   
                   const isTransitionPath = p.id === startLevel - 1;
                   const isSkippedPath = p.id < startLevel - 1;
                   const isHeroPath = p.id === currentLevel - 1 && !isTransitionPath && !isSkippedPath;
                   
                   const isRtl = p.id % 2 === 0;

                   if (isTransitionPath) {
                       return (
                           <path 
                              key={`trans-${p.id}`}
                              d={p.d} 
                              fill="none" 
                              stroke={isRtl ? "url(#grad-ghost-rtl)" : "url(#grad-ghost-ltr)"} 
                              strokeWidth="4" 
                              strokeLinecap="round"
                           />
                       );
                   }

                   if (isSkippedPath) {
                       return (
                           <path 
                              key={`skipped-${p.id}`}
                              d={p.d} 
                              fill="none" 
                              stroke="#E2E8F0" 
                              strokeWidth="4" 
                              strokeLinecap="round"
                              strokeDasharray="6,8"
                           />
                       );
                   }

                   if (isHeroPath) {
                       return (
                           <g key={`hero-${p.id}`}>
                               <path 
                                  d={p.d} 
                                  fill="none" 
                                  stroke={isRtl ? "url(#grad-hero-rtl)" : "url(#grad-hero-ltr)"} 
                                  strokeWidth="8" 
                                  strokeLinecap="round"
                                  className="drop-shadow-md"
                               />
                               <path 
                                  d={p.d} 
                                  fill="none" 
                                  stroke="rgba(255,255,255,0.5)" 
                                  strokeWidth="3" 
                                  strokeLinecap="round"
                                  strokeDasharray="0, 15"
                               />
                           </g>
                       );
                   }

                   // Completed
                   return (
                       <path 
                          key={`completed-${p.id}`}
                          d={p.d} 
                          fill="none" 
                          stroke="#10B981" 
                          strokeWidth="4" 
                          strokeLinecap="round"
                       />
                   );
               })}
            </svg>

            <div className="absolute inset-0 z-10">
                {[1, 2, 3, 4].map(lvl => renderTimelineNode(lvl))}
            </div>
        </div>
    );
};

export default MapTimeline;