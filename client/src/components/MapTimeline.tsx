import React from 'react';
import { Check, Lock, MapPin, Star, ChevronDown } from 'lucide-react';

interface MapTimelineProps {
  currentLevel: number;
  currentXP: number;
  maxXP: number;
  startLevel?: number;
  onLevelClick?: (level: number) => void;
}

const MapTimeline = ({ currentLevel, currentXP, maxXP, startLevel = 1, onLevelClick }: MapTimelineProps) => {
    // Canvas: 400w x 300h
    // Nodes at:
    // L1: (60, 50)
    // L2: (340, 116)
    // L3: (60, 183)
    // L4: (340, 250)
    
    const NODES = [
        { id: 1, x: 60, y: 50 },
        { id: 2, x: 340, y: 116 },
        { id: 3, x: 60, y: 183 },
        { id: 4, x: 340, y: 250 }
    ];

    const PATHS = [
      { id: 1, d: "M 60 50 C 200 50, 200 116, 340 116" },
      { id: 2, d: "M 340 116 C 200 116, 200 183, 60 183" },
      { id: 3, d: "M 60 183 C 200 183, 200 250, 340 250" }
    ];

    const renderTimelineNode = (level: number) => {
        const node = NODES[level - 1];
        if (!node) return null;

        const isSkipped = level < startLevel;
        const isCompleted = !isSkipped && level < currentLevel;
        const isActive = level === currentLevel;
        const isLocked = level > currentLevel;
        const isStartNode = level === startLevel;

        return (
            <div 
                key={level} 
                className={`absolute flex items-center justify-center transform transition-all duration-500 ${isActive ? 'z-30' : 'z-20'}`}
                style={{ 
                    top: node.y, 
                    left: node.x,
                    transform: 'translate(-50%, -50%)' 
                }}
                onClick={() => onLevelClick && onLevelClick(level)}
            >
                {/* START BADGE */}
                {isStartNode && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce-slow z-50 pointer-events-none">
                        <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider">
                            Start
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-900 -mt-1" />
                    </div>
                )}

                {/* SKIPPED NODE */}
                {isSkipped && (
                    <div className="w-12 h-12 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center shadow-sm opacity-60">
                         <span className="font-bold text-xs text-slate-300">{level}</span>
                    </div>
                )}

                {/* COMPLETED NODE */}
                {isCompleted && (
                    <div className="group relative">
                        <div className="absolute inset-0 bg-emerald-400 rounded-full opacity-20 blur-md group-hover:opacity-40 transition-opacity"></div>
                        <div className="w-14 h-14 rounded-full bg-white border-4 border-emerald-500 flex items-center justify-center shadow-md relative z-10 cursor-pointer hover:scale-105 transition-transform">
                            <Check className="w-6 h-6 text-emerald-600 stroke-[3]" />
                        </div>
                    </div>
                )}

                {/* ACTIVE NODE */}
                {isActive && (
                    <div className="relative cursor-pointer">
                         {/* Outer Glow Rings */}
                         <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                         <div className="absolute -inset-3 bg-blue-100/50 rounded-full blur-sm"></div>
                         
                         {/* Main Circle */}
                         <div className="w-20 h-20 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full flex flex-col items-center justify-center shadow-xl shadow-blue-500/30 border-4 border-white relative z-10 transform hover:scale-105 transition-transform">
                             <div className="absolute inset-0 rounded-full border border-blue-400 opacity-50"></div>
                             <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/20 rounded-full blur-[2px]"></div>
                             
                             <span className="text-[9px] text-blue-100 font-bold uppercase tracking-widest mb-0.5">Nivå</span>
                             <span className="text-3xl font-black text-white leading-none drop-shadow-sm">{level}</span>
                             
                             {/* Progress Ring indicator if needed, sticking to minimal clean look for now */}
                         </div>
                    </div>
                )}

                {/* LOCKED NODE */}
                {isLocked && (
                    <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center shadow-inner">
                        <Lock className="w-5 h-5 text-slate-300" />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] select-none">
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              viewBox="0 0 400 300" 
              preserveAspectRatio="xMidYMid meet"
            >
               <defs>
                   <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                       <feGaussianBlur stdDeviation="3" result="blur" />
                       <feComposite in="SourceGraphic" in2="blur" operator="over" />
                   </filter>
                   <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                       <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.1)" />
                   </filter>
                   
                   <linearGradient id="gradient-hero" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="#34D399" /> {/* Emerald-400 */}
                       <stop offset="100%" stopColor="#3B82F6" /> {/* Blue-500 */}
                   </linearGradient>

                   <linearGradient id="gradient-ghost" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0" />
                       <stop offset="50%" stopColor="#CBD5E1" stopOpacity="0.5" />
                       <stop offset="100%" stopColor="#94A3B8" stopOpacity="1" />
                   </linearGradient>
               </defs>

               {/* Background Track (The "Road") */}
               {PATHS.map(p => (
                   <path 
                      key={`bg-${p.id}`}
                      d={p.d} 
                      fill="none" 
                      stroke="#F1F5F9" 
                      strokeWidth="16" 
                      strokeLinecap="round"
                   />
               ))}

               {PATHS.map(p => {
                   const isTransitionPath = p.id === startLevel - 1;
                   const isSkippedPath = p.id < startLevel - 1;
                   const isHeroPath = (p.id === currentLevel - 1) && !isTransitionPath && !isSkippedPath;
                   const isCompletedPath = p.id < currentLevel - 1 && !isSkippedPath && !isTransitionPath;

                   if (isTransitionPath) {
                       return (
                           <path 
                              key={`trans-${p.id}`}
                              d={p.d} 
                              fill="none" 
                              stroke="url(#gradient-ghost)" 
                              strokeWidth="6" 
                              strokeLinecap="round"
                              strokeDasharray="4,6"
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
                              strokeDasharray="4,8"
                           />
                       );
                   }

                   if (isHeroPath) {
                       return (
                           <g key={`hero-${p.id}`}>
                               <path 
                                  d={p.d} 
                                  fill="none" 
                                  stroke="url(#gradient-hero)" 
                                  strokeWidth="8" 
                                  strokeLinecap="round"
                                  filter="url(#shadow)"
                                  className="animate-draw-path"
                               />
                               {/* Footprints / Dots overlay */}
                               <path 
                                  d={p.d} 
                                  fill="none" 
                                  stroke="rgba(255,255,255,0.4)" 
                                  strokeWidth="2" 
                                  strokeLinecap="round"
                                  strokeDasharray="0, 15"
                               />
                           </g>
                       );
                   }

                   if (isCompletedPath) {
                        return (
                           <path 
                              key={`comp-${p.id}`}
                              d={p.d} 
                              fill="none" 
                              stroke="#10B981" 
                              strokeWidth="6" 
                              strokeLinecap="round"
                           />
                        );
                   }

                   // Future Path
                   return (
                       <path 
                          key={`future-${p.id}`}
                          d={p.d} 
                          fill="none" 
                          stroke="#E2E8F0" 
                          strokeWidth="4" 
                          strokeLinecap="round"
                          strokeDasharray="8,8"
                       />
                   );
               })}
            </svg>

            <div className="absolute inset-0 pointer-events-none">
                {/* Render nodes via HTML overlays for easier interaction/styling */}
                {NODES.map((_, i) => (
                    <div key={i} className="pointer-events-auto">
                        {renderTimelineNode(i + 1)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MapTimeline;
