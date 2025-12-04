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
    
    // Fixed pixel alignment to match SVG without scaling issues
    const X_POS = 48; 

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

    // Generate ruler ticks
    const renderTicks = () => {
        const ticks = [];
        const step = 12.5; 
        
        // Iterate segments between nodes
        for (let i = 0; i < NODES.length - 1; i++) {
            const startY = NODES[i].y;
            const endY = NODES[i+1].y;
            
            for (let y = startY + step; y < endY; y += step) {
                const offset = y - startY;
                
                // Buffer around nodes
                if (offset < 20 || offset > 130) continue;

                // 33% (50px) and 66% (100px)
                const isMajor = Math.abs(offset - 50) < 0.1 || Math.abs(offset - 100) < 0.1;
                
                const width = isMajor ? 12 : 6;
                const xTick = X_POS - 20; 
                
                ticks.push(
                    <line 
                        key={y} 
                        x1={xTick - width} y1={y} x2={xTick} y2={y} 
                        stroke={isMajor ? "#CBD5E1" : "#E2E8F0"} 
                        strokeWidth={isMajor ? 2 : 1} 
                        strokeLinecap="round" 
                    />
                );
            }
        }
        return <g>{ticks}</g>;
    };

    const renderFootsteps = () => {
        const startNode = NODES[(startLevel - 1)] || NODES[0];
        const currentNode = NODES[(currentLevel - 1)] || NODES[0];
        
        const startY = startNode.y;
        const endY = currentNode.y;

        const steps = [];
        // Tighter steps (12px instead of 25px)
        const stepSize = 12; 

        // Loop through the entire timeline range
        for (let y = 60; y <= 510; y += stepSize) {
             
             // VISIBILITY FILTER: Only show steps between Start Level and Current Level
             // Add padding so steps don't overlap the nodes
             if (y < startY + 20 || y > endY - 20) continue;

             const isNearNode = NODES.some(node => Math.abs(node.y - y) < 20);
             if (isNearNode) continue;

             const stepIndex = Math.floor(y / stepSize);
             const isRight = stepIndex % 2 === 0;
             
             const xOffset = isRight ? 8 : -8;
             
             // Rotate to point downwards: 
             // Right side (x+8) points SSE (165deg)
             // Left side (x-8) points SSW (195deg)
             steps.push(
                <g key={y} transform={`translate(${X_POS + xOffset}, ${y}) rotate(${isRight ? 165 : 195})`}>
                    <path 
                        d="M -2 -3 C -2 -5 2 -5 2 -3 L 2 1 C 2 4 -2 4 -2 1 Z" 
                        fill="#CBD5E1"
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
                {/* NODE LABELS */}
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

                {isSkipped && (
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                         <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                    </div>
                )}

                {isCompleted && (
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm z-10">
                        <Check className="w-4 h-4 text-slate-400 stroke-[2.5]" />
                    </div>
                )}

                {isActive && (
                    <div className="relative cursor-pointer group">
                         <div className="w-12 h-12 bg-blue-600 rounded-full flex flex-col items-center justify-center shadow-lg shadow-blue-500/20 relative z-10 transform transition-transform group-hover:scale-105">
                             <span className="text-[7px] text-blue-100 font-bold uppercase tracking-widest mb-px">Nivå</span>
                             <span className="text-lg font-black text-white leading-none">{level}</span>
                         </div>
                    </div>
                )}

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
        <div className="relative w-full h-[600px] select-none">
            {/* SVG Overlay: Removed viewBox to ensure 1:1 pixel mapping with HTML nodes */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
            >
               {renderTicks()}
               
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