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
        for (let y = 60; y <= 680; y += 15) {
            const isNearNode = NODES.some(node => Math.abs(node.y - y) < 25);
            if (isNearNode) continue;
            
            const isMajor = (y - 60) % 75 === 0;
            const width = isMajor ? 12 : 6;
            const xTick = X_POS - 20; 
            
            ticks.push(
                <line 
                    key={y} 
                    x1={xTick - width} y1={y} x2={xTick} y2={y} 
                    stroke={isMajor ? "#94A3B8" : "#E2E8F0"} 
                    strokeWidth={isMajor ? 2 : 1} 
                    strokeLinecap="round" 
                />
            );
        }
        return <g>{ticks}</g>;
    };

    const renderFootsteps = () => {
        const steps = [];
        for (let y = 85; y < 500; y += 25) {
             const isNearNode = NODES.some(node => Math.abs(node.y - y) < 30);
             if (isNearNode) continue;

             // Alternate left/right offset from the center path
             // Using modulo to alternate based on position
             const stepIndex = Math.floor((y - 85) / 25);
             const isRight = stepIndex % 2 === 0;
             
             // Distance from center line
             const xOffset = isRight ? 8 : -8;
             
             steps.push(
                <g key={y} transform={`translate(${X_POS + xOffset}, ${y}) rotate(${isRight ? 15 : -15})`}>
                    <path 
                        d="M -2 -3 C -2 -5 2 -5 2 -3 L 2 1 C 2 4 -2 4 -2 1 Z" 
                        fill="#CBD5E1" 
                        opacity="0.5"
                    />
                </g>
             );
        }
        return <g>{steps}</g>;
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
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-300' : 'bg-slate-300'}`}></div>
                        <div className={`w-6 h-px ${isActive ? 'bg-blue-300' : 'bg-slate-300'}`}></div>
                    </div>

                    <div>
                        <span className={`block text-[10px] font-bold uppercase tracking-widest mb-0.5 ${isActive ? 'text-blue-500' : 'text-slate-400'}`}>
                            {node.label}
                        </span>
                        <span className={`block font-bold text-lg leading-tight ${isActive ? 'text-blue-900' : 'text-slate-400'}`}>
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
                         <div className="w-12 h-12 bg-blue-600 rounded-full flex flex-col items-center justify-center shadow-lg shadow-blue-500/20 relative z-10 transform transition-transform group-hover:scale-105">
                             <span className="text-[7px] text-blue-100 font-bold uppercase tracking-widest mb-px">Nivå</span>
                             <span className="text-lg font-black text-white leading-none">{level}</span>
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
               {renderTicks()}
               
               {/* Faint dotted path for all segments */}
               {PATHS.map(p => (
                   <path 
                      key={p.id}
                      d={p.d} 
                      fill="none" 
                      stroke="#CBD5E1" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                      strokeDasharray="0, 7" 
                   />
               ))}

               {/* Footsteps alongside path */}
               {renderFootsteps()}
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