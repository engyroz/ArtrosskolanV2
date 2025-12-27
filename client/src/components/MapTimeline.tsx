
import React from 'react';
import { Check, Lock, Swords, Flag, Star, Gift, PackageOpen } from 'lucide-react';

interface MapTimelineProps {
  currentLevel: number;
  currentXP: number;
  maxXP: number;
  startLevel?: number;
  onLevelClick?: (level: number) => void; // Used for Boss Fight trigger
  onChestClick?: (stage: number, status: 'locked' | 'unlocked') => void;
}

const MapTimeline = ({ 
  currentLevel, 
  currentXP, 
  maxXP, 
  startLevel = 1, 
  onLevelClick,
  onChestClick 
}: MapTimelineProps) => {
    
    // --- LAYOUT CONFIGURATION ---
    const LEVEL_GAP = 360; // Huge vertical gap for scrolling feel
    const START_Y = 80;
    const CENTER_X = '50%';
    
    // Calculate precise progress
    // If level is maxed (ready for boss), fill is 100%
    const progressRatio = Math.min(Math.max(currentXP / maxXP, 0), 1);
    const activeFillHeight = progressRatio * LEVEL_GAP;

    const NODES = [
        { id: 1, label: "Start", desc: "Smärtlindring", icon: Flag },
        { id: 2, label: "Fas 2", desc: "Grundstyrka", icon: Star },
        { id: 3, label: "Fas 3", desc: "Uppbyggnad", icon: Star },
        { id: 4, label: "Mål", desc: "Prestation", icon: Star } // Icon handles Trophy logic internally
    ];

    // Determine total height based on nodes
    const TOTAL_HEIGHT = START_Y + ((NODES.length - 1) * LEVEL_GAP) + 150;

    // --- RENDER HELPERS ---

    const renderPath = () => {
        // We render segments between nodes
        const segments = [];

        for (let i = 0; i < NODES.length - 1; i++) {
            const startNodeY = START_Y + (i * LEVEL_GAP);
            const endNodeY = START_Y + ((i + 1) * LEVEL_GAP);
            const levelIndex = i + 1; // 1-based level for logic

            // Logic for this segment
            const isCompletedSegment = levelIndex < currentLevel;
            const isActiveSegment = levelIndex === currentLevel;
            
            // 1. Background Line (Grey Dashed)
            segments.push(
                <line 
                    key={`bg-${i}`}
                    x1={CENTER_X} y1={startNodeY} 
                    x2={CENTER_X} y2={endNodeY} 
                    stroke="#E2E8F0" 
                    strokeWidth="4" 
                    strokeDasharray="8 8" 
                    strokeLinecap="round" 
                />
            );

            // 2. Completed Line (Solid Blue) - for past levels
            if (isCompletedSegment) {
                segments.push(
                    <line 
                        key={`comp-${i}`}
                        x1={CENTER_X} y1={startNodeY} 
                        x2={CENTER_X} y2={endNodeY} 
                        stroke="#2563EB" 
                        strokeWidth="4" 
                        strokeLinecap="round" 
                    />
                );
            }

            // 3. Active Progress Fill (Solid Blue) - current level only
            if (isActiveSegment) {
                const fillEndY = startNodeY + activeFillHeight;
                segments.push(
                    <line 
                        key={`active-${i}`}
                        x1={CENTER_X} y1={startNodeY} 
                        x2={CENTER_X} y2={fillEndY} 
                        stroke="#2563EB" 
                        strokeWidth="4" 
                        strokeLinecap="round" 
                        className="transition-all duration-1000 ease-out"
                    />
                );

                // Render Footsteps only on the filled path
                // We create steps every 40px
                const steps = [];
                for (let y = startNodeY + 20; y < fillEndY - 20; y += 40) {
                     // Check if close to chest areas (avoid overlap)
                     const distToChest1 = Math.abs(y - (startNodeY + LEVEL_GAP * 0.33));
                     const distToChest2 = Math.abs(y - (startNodeY + LEVEL_GAP * 0.66));
                     if (distToChest1 < 30 || distToChest2 < 30) continue;

                     const isRight = Math.floor(y / 40) % 2 === 0;
                     steps.push(
                        <g key={`step-${y}`} transform={`translate(${isRight ? 10 : -10}, 0)`} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
                           <path
                             transform={`translate(0, ${y}) rotate(${isRight ? 165 : 195}) scale(0.8)`}
                             d="M -2 -3 C -2 -5 2 -5 2 -3 L 2 1 C 2 4 -2 4 -2 1 Z" 
                             fill="#93C5FD" // Light blue steps
                             style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                           />
                        </g>
                     );
                }
                segments.push(<g key={`steps-${i}`} style={{ transform: 'translateX(50%)' }}>{steps}</g>);
            }
        }

        return <g>{segments}</g>;
    };

    const renderChests = () => {
        // Chests appear on the Active Level path
        // Only if we are not at the final level (no path after 4)
        if (currentLevel >= 4) return null;

        const startY = START_Y + ((currentLevel - 1) * LEVEL_GAP);
        
        // Thresholds
        const t1 = 0.33;
        const t2 = 0.66;
        
        const chests = [
            { id: 2, pos: t1, unlocked: progressRatio >= t1 },
            { id: 3, pos: t2, unlocked: progressRatio >= t2 }
        ];

        return chests.map((chest) => {
            const yPos = startY + (LEVEL_GAP * chest.pos);
            const isUnlocked = chest.unlocked;
            
            return (
                <div 
                    key={`chest-${chest.id}`}
                    onClick={() => onChestClick && onChestClick(chest.id, isUnlocked ? 'unlocked' : 'locked')}
                    className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-all duration-300 hover:scale-110
                        ${isUnlocked ? 'animate-bounce-subtle' : 'opacity-80'}
                    `}
                    style={{ top: yPos }}
                >
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg transition-colors
                        ${isUnlocked 
                            ? 'bg-yellow-100 border-yellow-400 text-yellow-600' 
                            : 'bg-slate-100 border-slate-300 text-slate-400 grayscale'
                        }
                    `}>
                        {isUnlocked ? <PackageOpen className="w-6 h-6" /> : <Gift className="w-5 h-5" />}
                    </div>
                    
                    {/* Floating Label for Unlocked */}
                    {isUnlocked && (
                         <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm whitespace-nowrap animate-fade-in">
                            Etapp {chest.id} Klar!
                         </div>
                    )}
                </div>
            );
        });
    };

    const renderNodes = () => {
        return NODES.map((node, index) => {
            const level = index + 1;
            const yPos = START_Y + (index * LEVEL_GAP);
            
            // Logic States
            const isPast = level < currentLevel;
            const isCurrent = level === currentLevel;
            const isTarget = level === currentLevel + 1; // This is the BOSS for current level
            const isFuture = level > currentLevel + 1;
            
            const isBossReady = isTarget && progressRatio >= 1; // XP is full

            // Special Case: Level 4 is the final goal
            const isFinal = level === 4;

            return (
                <div 
                    key={node.id}
                    className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center"
                    style={{ top: yPos }}
                >
                    {/* NODE CIRCLE */}
                    <div 
                        onClick={() => {
                            if (isBossReady && onLevelClick) onLevelClick(currentLevel); // Pass current level to trigger its boss
                        }}
                        className={`
                            relative w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl transition-all duration-500
                            ${isCurrent 
                                ? 'bg-blue-600 border-blue-200 scale-110 ring-4 ring-blue-100' 
                                : isPast 
                                    ? 'bg-slate-900 border-slate-700' 
                                    : isTarget
                                        ? isBossReady 
                                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-200 cursor-pointer animate-pulse scale-110'
                                            : 'bg-white border-slate-200'
                                        : 'bg-slate-50 border-slate-100 opacity-60'
                            }
                        `}
                    >
                        {isCurrent && (
                            <div className="text-white flex flex-col items-center">
                                <span className="text-[9px] uppercase tracking-widest font-bold opacity-80">Nivå</span>
                                <span className="text-3xl font-black leading-none">{level}</span>
                            </div>
                        )}

                        {isPast && <Check className="w-8 h-8 text-green-400 stroke-[3]" />}

                        {isTarget && (
                            isBossReady ? (
                                <Swords className="w-10 h-10 text-white animate-wiggle" />
                            ) : (
                                <Lock className="w-8 h-8 text-slate-300" />
                            )
                        )}
                        
                        {isFuture && (
                            <Lock className="w-6 h-6 text-slate-200" />
                        )}

                        {/* Special case: If we are AT level 4, it's the trophy */}
                        {isFinal && isCurrent && (
                             <div className="absolute inset-0 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                                 <Star className="w-10 h-10 text-yellow-900 fill-current" />
                             </div>
                        )}
                    </div>

                    {/* LABELS */}
                    <div className={`mt-4 text-center transition-all ${isFuture ? 'opacity-40' : 'opacity-100'}`}>
                        <span className={`block text-xs font-bold uppercase tracking-widest mb-1 ${isCurrent ? 'text-blue-600' : isTarget && isBossReady ? 'text-orange-600' : 'text-slate-400'}`}>
                            {isTarget && isBossReady ? "BOSS FIGHT" : node.label}
                        </span>
                        <h3 className={`text-lg font-black leading-tight ${isCurrent ? 'text-slate-900' : 'text-slate-700'}`}>
                            {node.desc}
                        </h3>
                    </div>

                    {/* Boss Ready Tooltip */}
                    {isTarget && isBossReady && (
                         <div className="absolute -top-12 bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce whitespace-nowrap">
                            Klicka för Nivåtest!
                         </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="relative w-full overflow-hidden select-none" style={{ height: TOTAL_HEIGHT }}>
            {/* SVG Layer for Paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {renderPath()}
            </svg>

            {/* DOM Layer for Interactive Elements */}
            <div className="absolute inset-0 w-full h-full">
                {renderNodes()}
                {renderChests()}
            </div>
        </div>
    );
};

export default MapTimeline;
