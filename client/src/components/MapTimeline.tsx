
import React from 'react';
import { Check, Lock, Swords, Flag, Star, Gift, PackageOpen, ChevronRight } from 'lucide-react';

interface MapTimelineProps {
  currentLevel: number;
  currentXP: number;
  maxXP: number;
  startLevel?: number;
  onLevelClick?: (level: number) => void;
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
    const LEVEL_GAP = 280; // Slightly reduced vertical gap for tighter feel
    const TOP_PADDING = 60;
    const BOTTOM_PADDING = 100;
    const LINE_X = 48; // Fixed pixel position from left (The "Spine")
    
    // Calculate precise progress
    const progressRatio = Math.min(Math.max(currentXP / maxXP, 0), 1);
    const activeFillHeight = progressRatio * LEVEL_GAP;

    const NODES = [
        { id: 1, label: "Fas 1", title: "Smärtlindring", sub: "Minska irritation & hitta ro" },
        { id: 2, label: "Fas 2", title: "Grundstyrka", sub: "Bygg upp tålighet" },
        { id: 3, label: "Fas 3", title: "Uppbyggnad", sub: "Öka belastning & balans" },
        { id: 4, label: "Mål", title: "Prestation", sub: "Återgång till full aktivitet" }
    ];

    const TOTAL_HEIGHT = TOP_PADDING + ((NODES.length - 1) * LEVEL_GAP) + BOTTOM_PADDING;

    // --- RENDER HELPERS ---

    const renderPath = () => {
        const segments = [];

        for (let i = 0; i < NODES.length - 1; i++) {
            const startY = TOP_PADDING + (i * LEVEL_GAP);
            const endY = TOP_PADDING + ((i + 1) * LEVEL_GAP);
            const levelIndex = i + 1;

            const isCompletedSegment = levelIndex < currentLevel;
            const isActiveSegment = levelIndex === currentLevel;
            
            // 1. Background Rail (Subtle, thin grey)
            segments.push(
                <line 
                    key={`bg-${i}`}
                    x1={LINE_X} y1={startY} 
                    x2={LINE_X} y2={endY} 
                    stroke="#E2E8F0" // Slate-200
                    strokeWidth="2" 
                    strokeLinecap="round" 
                />
            );

            // 2. Completed Path (Solid Blue)
            if (isCompletedSegment) {
                segments.push(
                    <line 
                        key={`comp-${i}`}
                        x1={LINE_X} y1={startY} 
                        x2={LINE_X} y2={endY} 
                        stroke="#3B82F6" // Blue-500
                        strokeWidth="2" 
                    />
                );
            }

            // 3. Active Progress Fill (Animated Blue)
            if (isActiveSegment) {
                const fillEndY = startY + activeFillHeight;
                segments.push(
                    <line 
                        key={`active-${i}`}
                        x1={LINE_X} y1={startY} 
                        x2={LINE_X} y2={fillEndY} 
                        stroke="#3B82F6" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                );
                
                // Optional: A small "head" dot at the tip of the progress
                segments.push(
                    <circle 
                        key={`head-${i}`}
                        cx={LINE_X} 
                        cy={fillEndY} 
                        r="3" 
                        fill="#3B82F6"
                        className="transition-all duration-1000 ease-out"
                    />
                );
            }
        }
        return <g>{segments}</g>;
    };

    const renderChests = () => {
        if (currentLevel >= 4) return null;

        const startY = TOP_PADDING + ((currentLevel - 1) * LEVEL_GAP);
        const chests = [
            { id: 2, pos: 0.33 },
            { id: 3, pos: 0.66 }
        ];

        return chests.map((chest) => {
            const yPos = startY + (LEVEL_GAP * chest.pos);
            const isUnlocked = progressRatio >= chest.pos;
            
            return (
                <div 
                    key={`chest-${chest.id}`}
                    onClick={() => onChestClick && onChestClick(chest.id, isUnlocked ? 'unlocked' : 'locked')}
                    className="absolute z-20 cursor-pointer group"
                    style={{ left: LINE_X, top: yPos, transform: 'translate(-50%, -50%)' }}
                >
                    <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300
                        ${isUnlocked 
                            ? 'bg-white border-yellow-400 text-yellow-500 shadow-md scale-110' 
                            : 'bg-slate-50 border-slate-200 text-slate-300'
                        }
                    `}>
                        {isUnlocked ? <PackageOpen size={14} /> : <Gift size={14} />}
                    </div>
                    
                    {/* Tiny Indicator Dot if ready to open */}
                    {isUnlocked && (
                         <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                    )}
                </div>
            );
        });
    };

    const renderNodes = () => {
        return NODES.map((node, index) => {
            const level = index + 1;
            const yPos = TOP_PADDING + (index * LEVEL_GAP);
            
            // Logic States
            const isPast = level < currentLevel;
            const isCurrent = level === currentLevel;
            const isTarget = level === currentLevel + 1;
            const isFuture = level > currentLevel + 1;
            
            const isBossReady = isTarget && progressRatio >= 1;

            return (
                <div 
                    key={node.id}
                    className="absolute w-full flex items-center z-30"
                    style={{ top: yPos, transform: 'translateY(-50%)' }}
                >
                    {/* 1. THE NODE (On the Line) */}
                    <div 
                        onClick={() => {
                            if (isBossReady && onLevelClick) onLevelClick(currentLevel);
                        }}
                        className="absolute flex items-center justify-center transition-all duration-500 cursor-default"
                        style={{ left: LINE_X, transform: 'translateX(-50%)' }}
                    >
                        {/* Outer Glow for Current */}
                        {isCurrent && (
                            <div className="absolute w-16 h-16 bg-blue-500/10 rounded-full animate-pulse-slow"></div>
                        )}

                        <div className={`
                            relative rounded-full flex items-center justify-center border-2 transition-all duration-300
                            ${isCurrent 
                                ? 'w-14 h-14 bg-white border-blue-500 shadow-lg text-blue-600' 
                                : isPast 
                                    ? 'w-10 h-10 bg-blue-500 border-blue-500 text-white' 
                                    : isTarget && isBossReady
                                        ? 'w-14 h-14 bg-orange-500 border-orange-400 text-white shadow-lg animate-bounce-subtle cursor-pointer'
                                        : 'w-10 h-10 bg-white border-slate-200 text-slate-300'
                            }
                        `}>
                            {isCurrent && <span className="text-xl font-bold">{level}</span>}
                            {isPast && <Check size={18} strokeWidth={3} />}
                            
                            {isTarget && isBossReady && <Swords size={24} />}
                            {isTarget && !isBossReady && <Lock size={16} />}
                            
                            {isFuture && <Lock size={16} />}
                            
                            {/* Special Icon for Final Goal */}
                            {level === 4 && isCurrent && <Star className="fill-current text-yellow-400" size={24} />}
                        </div>
                    </div>

                    {/* 2. THE CONTENT (To the Right) */}
                    <div 
                        className={`ml-24 pr-6 transition-all duration-500 ${
                            isFuture ? 'opacity-40 grayscale' : 'opacity-100'
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                isCurrent ? 'text-blue-600' : 'text-slate-400'
                            }`}>
                                {node.label}
                            </span>
                            {isCurrent && (
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Pågår
                                </span>
                            )}
                             {isPast && (
                                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Klar
                                </span>
                            )}
                        </div>
                        
                        <h3 className={`text-lg font-bold leading-tight mb-1 ${
                            isCurrent ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                            {node.title}
                        </h3>
                        
                        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[240px]">
                            {node.sub}
                        </p>

                        {/* Boss Call to Action */}
                        {isTarget && isBossReady && (
                            <button 
                                onClick={() => onLevelClick && onLevelClick(currentLevel)}
                                className="mt-3 flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold shadow-md animate-pulse hover:bg-orange-600 transition-colors"
                            >
                                <Swords size={14} /> Starta Nivåtest <ChevronRight size={14} />
                            </button>
                        )}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="relative w-full select-none" style={{ height: TOTAL_HEIGHT }}>
            {/* SVG Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {renderPath()}
            </svg>

            {/* DOM Layer */}
            <div className="absolute inset-0 w-full h-full">
                {renderNodes()}
                {renderChests()}
            </div>
        </div>
    );
};

export default MapTimeline;
