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
    // Canvas dimensions
    // Width 400, Height 600
    // Central line x = 200
    
    const NODES = [
        { id: 1, x: 200, y: 60, label: "Start", desc: "Smärtlindring", icon: Flag },
        { id: 2, x: 200, y: 210, label: "Fas 2", desc: "Grundstyrka", icon: Star },
        { id: 3, x: 200, y: 360, label: "Fas 3", desc: "Uppbyggnad", icon: Star },
        { id: 4, x: 200, y: 510, label: "Mål", desc: "Prestation", icon: Trophy }
    ];

    const PATHS = [
      { id: 1, d: "M 200 60 L 200 210" },
      { id: 2, d: "M 200 210 L 200 360" },
      { id: 3, d: "M 200 360 L 200 510" }
    ];

    // Generate ruler ticks
    const renderTicks = () => {
        const ticks = [];
        for (let y = 60; y <= 510; y += 15) {
            // Avoid drawing ticks on top of nodes (roughly +/- 25px around node centers)
            const isNearNode = NODES.some(node => Math.abs(node.y - y) < 25);
            if (isNearNode) continue;
            
            const isMajor = (y - 60) % 75 === 0;
            const width = isMajor ? 12 : 6;
            const xPos = 180; // Left side of the main line
            
            ticks.push(
                <line 
                    key={y} 
                    x1={xPos - width} y1={y} x2={xPos} y2={y} 
                    stroke={isMajor ? "#94A3B8" : "#CBD5E1"} 
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
                    className={`absolute left-16 top-1/2 -translate-y-1/2 w-48 text-left transition-all duration-500 flex items-center ${isActive ? 'opacity-100 translate-x-0' : 'opacity-60 translate-x-2'}`}
                >
                    {/* Connector Dot & Line */}
                    <div className="flex items-center mr-3">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                        <div className={`w-6 h-0.5 ${isActive ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                    </div>

                    <div>
                        <span className={`block text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                            {node.label}
                        </span>
                        <span className={`block font-bold text-lg leading-tight ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                            {node.desc}
                        </span>
                    </div>
                </div>

                {/* SKIPPED NODE */}
                {isSkipped && (
                    <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center shadow-sm opacity-80">
                         <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    </div>
                )}

                {/* COMPLETED NODE */}
                {isCompleted && (
                    <div className="group relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-500 flex items-center justify-center shadow-md relative z-10 cursor-pointer hover:scale-105 transition-transform">
                            <Check className="w-6 h-6 text-emerald-600 stroke-[3]" />
                        </div>
                    </div>
                )}

                {/* ACTIVE NODE */}
                {isActive && (
                    <div className="relative cursor-pointer group">
                         {/* Pulse Ring */}
                         <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20 duration-1000"></div>
                         {/* Static Glow */}
                         <div className="absolute -inset-4 bg-blue-400/30 rounded-full blur-md"></div>
                         
                         {/* Main Body */}
                         <div className="w-20 h-20 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-full flex flex-col items-center justify-center shadow-2xl shadow-blue-900/40 border-4 border-white relative z-10 transform scale-110 transition-transform group-hover:scale-115">
                             {/* Gloss Shine */}
                             <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-full"></div>
                             
                             <span className="text-[9px] text-blue-200 font-bold uppercase tracking-widest mb-0.5">Nivå</span>
                             <span className="text-3xl font-black text-white leading-none drop-shadow-md">{level}</span>
                         </div>
                    </div>
                )}

                {/* LOCKED / GOAL NODE */}
                {isLocked && (
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-inner ${isGoal ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-200'}`}>
                        {isGoal ? (
                            <Trophy className="w-5 h-5 text-yellow-400" />
                        ) : (
                            <Lock className="w-4 h-4 text-slate-300" />
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="relative w-full aspect-[2/3] sm:aspect-auto sm:h-[600px] select-none">
            
            {/* Animation Styles */}
            <style>
            {`
              @keyframes flow {
                0% { stroke-dashoffset: 20; }
                100% { stroke-dashoffset: 0; }
              }
              .animate-flow {
                animation: flow 1s linear infinite;
              }
            `}
            </style>

            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              viewBox="0 0 400 580" 
              preserveAspectRatio="xMidYMid meet"
            >
               <defs>
                   <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                       <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.15)" />
                   </filter>
                   
                   <linearGradient id="gradient-hero" x1="0%" y1="0%" x2="0%" y2="100%">
                       <stop offset="0%" stopColor="#34D399" /> {/* Emerald-400 */}
                       <stop offset="100%" stopColor="#4F46E5" /> {/* Indigo-600 */}
                   </linearGradient>

                   <linearGradient id="gradient-ghost" x1="0%" y1="0%" x2="0%" y2="100%">
                       <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0" />
                       <stop offset="100%" stopColor="#94A3B8" stopOpacity="1" />
                   </linearGradient>
               </defs>

               {/* Ruler Ticks */}
               {renderTicks()}

               {/* Main Track Background */}
               {PATHS.map(p => (
                   <path 
                      key={`bg-${p.id}`}
                      d={p.d} 
                      fill="none" 
                      stroke="#F1F5F9" 
                      strokeWidth="20" 
                      strokeLinecap="round"
                   />
               ))}

               {PATHS.map(p => {
                   const isTransitionPath = p.id === startLevel - 1;
                   const isSkippedPath = p.id < startLevel - 1;
                   const isHeroPath = (p.id === currentLevel - 1) && !isTransitionPath && !isSkippedPath;
                   const isCompletedPath = p.id < currentLevel - 1 && !isSkippedPath && !isTransitionPath;

                   // 1. Ghost Transition (Fade In)
                   if (isTransitionPath) {
                       return (
                           <path 
                              key={`trans-${p.id}`}
                              d={p.d} 
                              fill="none" 
                              stroke="url(#gradient-ghost)" 
                              strokeWidth="4" 
                              strokeLinecap="round"
                           />
                       );
                   }

                   // 2. Skipped (Dotted)
                   if (isSkippedPath) {
                       return (
                           <path 
                              key={`skipped-${p.id}`}
                              d={p.d} 
                              fill="none" 
                              stroke="#E2E8F0" 
                              strokeWidth="3" 
                              strokeLinecap="round"
                              strokeDasharray="0, 6"
                           />
                       );
                   }

                   // 3. Hero Path (Active)
                   if (isHeroPath) {
                       return (
                           <g key={`hero-${p.id}`}>
                               {/* Base Gradient Line */}
                               <path 
                                  d={p.d} 
                                  fill="none" 
                                  stroke="url(#gradient-hero)" 
                                  strokeWidth="8" 
                                  strokeLinecap="round"
                                  filter="url(#shadow)"
                               />
                               {/* Animated Flow Overlay */}
                               <path 
                                  d={p.d} 
                                  fill="none" 
                                  stroke="rgba(255,255,255,0.4)" 
                                  strokeWidth="2" 
                                  strokeLinecap="round"
                                  strokeDasharray="0, 12"
                                  className="animate-flow"
                               />
                           </g>
                       );
                   }

                   // 4. Completed Path (Solid)
                   if (isCompletedPath) {
                        return (
                           <path 
                              key={`comp-${p.id}`}
                              d={p.d} 
                              fill="none" 
                              stroke="#10B981" 
                              strokeWidth="4" 
                              strokeLinecap="round"
                           />
                        );
                   }

                   // 5. Future Path (Technical Dashed)
                   return (
                       <path 
                          key={`future-${p.id}`}
                          d={p.d} 
                          fill="none" 
                          stroke="#E2E8F0" 
                          strokeWidth="2" 
                          strokeLinecap="round"
                          strokeDasharray="4,4"
                       />
                   );
               })}
            </svg>

            <div className="absolute inset-0 pointer-events-none">
                {/* Nodes Layer */}
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