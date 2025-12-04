import React from 'react';
import { Check, Lock, Trophy, Flag, Star } from 'lucide-react';

interface MapTimelineProps {
  currentLevel: number;
  currentXP: number;
  maxXP: number;
  startLevel?: number;
  onLevelClick?: (level: number) => void;
}

const MapTimeline = ({ currentLevel, currentXP, maxXP, startLevel = 1, onLevelClick }: MapTimelineProps) => {
    
    const X_POS = 48; // Left alignment

    const NODES = [
        { id: 1, x: X_POS, y: 60, label: "Start", desc: "Smärtlindring", icon: Flag },
        { id: 2, x: X_POS, y: 210, label: "Fas 2", desc: "Grundstyrka", icon: Star },
        { id: 3, x: X_POS, y: 360, label: "Fas 3", desc: "Uppbyggnad", icon: Star },
        { id: 4, x: X_POS, y: 510, label: "Mål", desc: "Prestation", icon: Trophy }
    ];

    const PATHS = [
      { id: 1, d: `M ${X_POS} 60 L ${X_POS} 210` },
      { id: 2, d: `M ${X_POS} 210 L ${X_POS} 360` },
      { id: 3, d: `M ${X_POS} 360 L ${X_POS} 510` }
    ];

    // Generate ruler ticks - Extended to ensure visibility on mobile
    const renderTicks = () => {
        const ticks = [];
        // Loop extended to 680 to go well past the last node (510)
        for (let y = 60; y <= 680; y += 15) {
            // Avoid drawing ticks on top of nodes (roughly +/- 25px around node centers)
            const isNearNode = NODES.some(node => Math.abs(node.y - y) < 25);
            if (isNearNode) continue;
            
            const isMajor = (y - 60) % 75 === 0;
            const width = isMajor ? 12 : 6;
            const xTick = X_POS - 20; 
            
            ticks.push(
                <line 
                    key={y} 
                    x1={xTick - width} y1={y} x2={xTick} y2={y} 
                    stroke={isMajor ? "#94A3B8" : "#CBD5E1"} // Slightly darker slate for better visibility
                    strokeWidth={isMajor ? 2 : 1} 
                    strokeLinecap="round" 
                />
            );
        }
        return <g>{ticks}</g>;
    };

    const renderTimelineNode = (level: number) => {
        const node = NODES[level - 1];
        if (!node) return null;

        const isSkipped = level < startLevel;
        const isCompleted = !isSkipped && level < currentLevel;
        const isActive = level === currentLevel;
        const isLocked = level > currentLevel;
        const isGoal = level === 4;

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
                {/* NODE LABELS with Connector Line */}
                <div 
                    className={`absolute left-14 top-1/2 -translate-y-1/2 w-48 text-left transition-all duration-500 flex items-center ${isActive ? 'opacity-100 translate-x-0' : 'opacity-40 translate-x-2'}`}
                >
                    <div className="flex items-center mr-4">
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-slate-500' : 'bg-slate-300'}`}></div>
                        <div className={`w-6 h-px ${isActive ? 'bg-slate-500' : 'bg-slate-300'}`}></div>
                    </div>

                    <div>
                        <span className={`block text-[10px] font-bold uppercase tracking-widest mb-0.5 ${isActive ? 'text-slate-600' : 'text-slate-400'}`}>
                            {node.label}
                        </span>
                        <span className={`block font-bold text-lg leading-tight ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                            {node.desc}
                        </span>
                    </div>
                </div>

                {/* SKIPPED NODE */}
                {isSkipped && (
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                         <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                    </div>
                )}

                {/* COMPLETED NODE */}
                {isCompleted && (
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm z-10">
                        <Check className="w-4 h-4 text-slate-400 stroke-[2.5]" />
                    </div>
                )}

                {/* ACTIVE NODE - Blue */}
                {isActive && (
                    <div className="relative cursor-pointer group">
                         <div className="w-14 h-14 bg-blue-600 rounded-full flex flex-col items-center justify-center shadow-lg shadow-blue-900/10 relative z-10 transform transition-transform group-hover:scale-105">
                             <span className="text-[8px] text-blue-200 font-bold uppercase tracking-widest mb-0.5">Nivå</span>
                             <span className="text-xl font-black text-white leading-none">{level}</span>
                         </div>
                    </div>
                )}

                {/* LOCKED / GOAL NODE */}
                {isLocked && (
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isGoal ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-100'}`}>
                        {isGoal ? (
                            <Trophy className="w-3.5 h-3.5 text-slate-300" />
                        ) : (
                            <Lock className="w-3 h-3 text-slate-200" />
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="relative w-full min-h-[700px] select-none">
            
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              viewBox="0 0 400 720" 
              preserveAspectRatio="xMidYMin meet"
            >
               <defs>
                   <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                       <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.05)" />
                   </filter>
                   
                   <linearGradient id="gradient-hero" x1="0%" y1="0%" x2="0%" y2="100%">
                       <stop offset="0%" stopColor="#60A5FA" /> {/* Blue-400 */}
                       <stop offset="100%" stopColor="#2563EB" /> {/* Blue-600 */}
                   </linearGradient>

                   <linearGradient id="gradient-ghost" x1="0%" y1="0%" x2="0%" y2="100%">
                       <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0" />
                       <stop offset="100%" stopColor="#CBD5E1" stopOpacity="1" />
                   </linearGradient>
               </defs>

               {renderTicks()}

               {PATHS.map(p => {
                   const isSkippedPath = p.id < startLevel;
                   const isCompletedPath = !isSkippedPath && p.id < currentLevel;
                   const isHeroPath = !isSkippedPath && p.id === currentLevel;
                   
                   // Base track background
                   const renderBase = (
                       <path 
                          d={p.d} 
                          fill="none" 
                          stroke="#F8FAFC" 
                          strokeWidth="16" 
                          strokeLinecap="round"
                       />
                   );

                   if (isSkippedPath) {
                       return (
                           <g key={p.id}>
                               {renderBase}
                               <path 
                                  d={p.d} 
                                  fill="none" 
                                  stroke="#E2E8F0" 
                                  strokeWidth="2" 
                                  strokeLinecap="round"
                                  strokeDasharray="0, 8"
                               />
                           </g>
                       );
                   }

                   if (isHeroPath) {
                       return (
                           <g key={p.id}>
                               {renderBase}
                               <path 
                                  d={p.d} 
                                  fill="none" 
                                  stroke="url(#gradient-hero)" 
                                  strokeWidth="3" 
                                  strokeLinecap="round"
                                  filter="url(#shadow)"
                               />
                           </g>
                       );
                   }

                   if (isCompletedPath) {
                        return (
                           <g key={p.id}>
                               {renderBase}
                               <path 
                                  d={p.d} 
                                  fill="none" 
                                  stroke="#94A3B8" 
                                  strokeWidth="2" 
                                  strokeLinecap="round"
                               />
                           </g>
                        );
                   }

                   // Future Path
                   return (
                       <g key={p.id}>
                           {renderBase}
                           <path 
                              d={p.d} 
                              fill="none" 
                              stroke="#E2E8F0" 
                              strokeWidth="1.5" 
                              strokeLinecap="round"
                              strokeDasharray="4,6"
                           />
                       </g>
                   );
               })}
            </svg>

            <div className="absolute inset-0 pointer-events-none">
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