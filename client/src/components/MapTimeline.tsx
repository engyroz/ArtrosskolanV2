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
    // Canvas: 400w x 600h
    // Nodes aligned vertically at x=200
    // Increased gap between nodes to 150px for longer lines
    
    const NODES = [
        { id: 1, x: 200, y: 50, label: "Start", desc: "Smärtlindring" },
        { id: 2, x: 200, y: 200, label: "Fas 2", desc: "Grundstyrka" },
        { id: 3, x: 200, y: 350, label: "Fas 3", desc: "Uppbyggnad" },
        { id: 4, x: 200, y: 500, label: "Mål", desc: "Prestation" }
    ];

    const PATHS = [
      { id: 1, d: "M 200 50 L 200 200" },
      { id: 2, d: "M 200 200 L 200 350" },
      { id: 3, d: "M 200 350 L 200 500" }
    ];

    const renderTimelineNode = (level: number) => {
        const node = NODES[level - 1];
        if (!node) return null;

        const isSkipped = level < startLevel;
        const isCompleted = !isSkipped && level < currentLevel;
        const isActive = level === currentLevel;
        const isLocked = level > currentLevel;
        const isStartNode = level === startLevel;

        // Label Positioning: Alternate sides or consistent right side?
        // Let's use alternating for a balanced look, or right side for cleaner list view.
        // Given "Progress Line", right side labels are clearer.
        const labelX = node.x + 50; 

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
                {/* NODE LABELS (Right Side) */}
                <div 
                    className={`absolute left-14 top-1/2 -translate-y-1/2 w-40 text-left transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-60 translate-x-2'}`}
                >
                    <span className={`block text-xs font-bold uppercase tracking-wider mb-0.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                        {node.label}
                    </span>
                    <span className={`block font-bold text-lg leading-none ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                        {node.desc}
                    </span>
                </div>

                {/* START BADGE (Tooltip style) */}
                {isStartNode && !isActive && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center animate-bounce z-50 pointer-events-none whitespace-nowrap">
                         <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider relative">
                            Start
                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                        </div>
                    </div>
                )}

                {/* SKIPPED NODE */}
                {isSkipped && (
                    <div className="w-12 h-12 rounded-full bg-slate-50 border-2 border-slate-200 border-dashed flex items-center justify-center shadow-sm opacity-60">
                         <span className="font-bold text-xs text-slate-300">{level}</span>
                    </div>
                )}

                {/* COMPLETED NODE */}
                {isCompleted && (
                    <div className="group relative">
                        <div className="absolute inset-0 bg-emerald-400 rounded-full opacity-20 blur-md group-hover:opacity-40 transition-opacity"></div>
                        <div className="w-14 h-14 rounded-full bg-emerald-50 border-4 border-emerald-500 flex items-center justify-center shadow-md relative z-10 cursor-pointer hover:scale-110 transition-transform">
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
                         <div className="w-20 h-20 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full flex flex-col items-center justify-center shadow-xl shadow-blue-500/40 border-4 border-white relative z-10 transform scale-125 transition-transform hover:scale-[1.3]">
                             <div className="absolute inset-0 rounded-full border border-blue-400 opacity-50"></div>
                             <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/20 rounded-full blur-[2px]"></div>
                             
                             <span className="text-[9px] text-blue-100 font-bold uppercase tracking-widest mb-0.5">Nivå</span>
                             <span className="text-3xl font-black text-white leading-none drop-shadow-sm">{level}</span>
                         </div>
                    </div>
                )}

                {/* LOCKED NODE */}
                {isLocked && (
                    <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center shadow-inner">
                        <Lock className="w-4 h-4 text-slate-300" />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="relative w-full aspect-[2/3] sm:aspect-auto sm:h-[600px] select-none">
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              viewBox="0 0 400 550" 
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
                   
                   <linearGradient id="gradient-hero" x1="0%" y1="0%" x2="0%" y2="100%">
                       <stop offset="0%" stopColor="#34D399" /> {/* Emerald-400 */}
                       <stop offset="100%" stopColor="#3B82F6" /> {/* Blue-500 */}
                   </linearGradient>

                   <linearGradient id="gradient-ghost" x1="0%" y1="0%" x2="0%" y2="100%">
                       <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0" />
                       <stop offset="30%" stopColor="#CBD5E1" stopOpacity="0.5" />
                       <stop offset="100%" stopColor="#94A3B8" stopOpacity="1" />
                   </linearGradient>
               </defs>

               {/* Background Track (The "Road") */}
               {PATHS.map(p => (
                   <path 
                      key={`bg-${p.id}`}
                      d={p.d} 
                      fill="none" 
                      stroke="#F8FAFC" 
                      strokeWidth="24" 
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
                                  strokeWidth="12" 
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
                                  strokeDasharray="0, 20"
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