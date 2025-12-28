
import React from 'react';
import { Check, Lock, Swords, Star, Package, PackageOpen } from 'lucide-react';

interface MapTimelineProps {
  currentLevel: number;
  currentXP: number;
  maxXP: number;
  startLevel?: number;
  openedChests?: string[]; // Array of "level_stage" strings
  onLevelClick?: (level: number) => void;
  onChestClick?: (stage: number, status: 'locked' | 'unlocked' | 'opened') => void;
}

const MapTimeline = ({ 
  currentLevel, 
  currentXP, 
  maxXP, 
  startLevel = 1, 
  openedChests = [],
  onLevelClick,
  onChestClick 
}: MapTimelineProps) => {
    
    // --- LAYOUT CONFIGURATION ---
    const LEVEL_GAP = 240; 
    const TOP_PADDING = 60;
    const BOTTOM_PADDING = 100;
    
    // Adjusted X Coordinates for centering
    const THERMOMETER_X = 50;  
    const PATH_X = 110;
    const TEXT_LEFT_MARGIN = 170;

    // Progress calculations
    const progressRatio = Math.min(Math.max(currentXP / maxXP, 0), 1);
    
    // Nodes Data
    const NODES = [
        { id: 1, label: "Fas 1", title: "Smärtlindring", sub: "Minska irritation" },
        { id: 2, label: "Fas 2", title: "Grundstyrka", sub: "Bygg upp tålighet" },
        { id: 3, label: "Fas 3", title: "Uppbyggnad", sub: "Öka belastning" },
        { id: 4, label: "Mål", title: "Prestation", sub: "Återgång till aktivitet" }
    ];

    const TOTAL_HEIGHT = TOP_PADDING + ((NODES.length - 1) * LEVEL_GAP) + BOTTOM_PADDING;

    // --- RENDER HELPERS ---

    const renderThermometer = () => {
        const railHeight = (NODES.length - 1) * LEVEL_GAP;
        
        // 1. Calculate Fill Dimensions
        const completedLevelsHeight = (currentLevel - 1) * LEVEL_GAP;
        const currentLevelProgressHeight = progressRatio * LEVEL_GAP;
        // Total pixels filled from the top
        const totalFill = Math.min(completedLevelsHeight + currentLevelProgressHeight, railHeight);
        // The Y coordinate where the blue line ends
        const fillLimitY = TOP_PADDING + totalFill;

        const elements = [];

        // 2. TUBE BACKGROUND (Base Layer)
        elements.push(
            <line 
                key="therm-bg"
                x1={THERMOMETER_X} y1={TOP_PADDING - 10} 
                x2={THERMOMETER_X} y2={TOP_PADDING + railHeight + 10} 
                stroke="#E2E8F0" // Slate-200
                strokeWidth="12" 
                strokeLinecap="round" 
            />
        );

        // 3. SCALE LINES (Constant Grey)
        NODES.forEach((_, index) => {
            const y = TOP_PADDING + (index * LEVEL_GAP);
            elements.push(
                <line 
                    key={`major-line-bg-${index}`}
                    x1={THERMOMETER_X - 16} 
                    y1={y}
                    x2={PATH_X} 
                    y2={y}
                    stroke="#CBD5E1" // Slate-300 (Always Grey)
                    strokeWidth="2"
                />
            );
        });

        // Intermediate Lines (Stages)
        for (let i = 0; i < NODES.length - 1; i++) {
            const startY = TOP_PADDING + (i * LEVEL_GAP);
            const ticks = [0.33, 0.66]; // 33% and 66%
            
            ticks.forEach((t, idx) => {
                const y = startY + (LEVEL_GAP * t);
                elements.push(
                    <line 
                        key={`stage-line-bg-${i}-${idx}`}
                        x1={THERMOMETER_X - 10}
                        y1={y}
                        x2={PATH_X} 
                        y2={y}
                        stroke="#E2E8F0" // Slate-200 (Always Light Grey)
                        strokeWidth="1.5"
                    />
                );
            });
        }

        // 4. ACTIVE FILL (Middle Layer)
        if (totalFill > 0) {
            elements.push(
                <line 
                    key="therm-fill"
                    x1={THERMOMETER_X} y1={TOP_PADDING} 
                    x2={THERMOMETER_X} y2={fillLimitY} 
                    stroke="#3B82F6" // Blue-500
                    strokeWidth="12" 
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            );

            // PULSATING END CAP
            elements.push(
                 <circle
                    key="therm-cap-pulse"
                    cx={THERMOMETER_X}
                    cy={fillLimitY}
                    r="8"
                    className="animate-ping origin-center"
                    fill="#60A5FA" // Blue-400
                    opacity="0.75"
                />
            );
            elements.push(
                 <circle
                    key="therm-cap-solid"
                    cx={THERMOMETER_X}
                    cy={fillLimitY}
                    r="5"
                    fill="#EFF6FF" 
                    stroke="#2563EB" 
                    strokeWidth="2"
                />
            );
        }

        // 5. OVERLAY TICKS (Top Layer)
        NODES.forEach((_, index) => {
            const y = TOP_PADDING + (index * LEVEL_GAP);
            if (y <= fillLimitY) {
                 elements.push(
                    <line 
                        key={`major-tick-active-${index}`}
                        x1={THERMOMETER_X - 6} y1={y}
                        x2={THERMOMETER_X + 6} y2={y}
                        stroke="#EFF6FF" // Blue-50 (Light Mark)
                        strokeWidth="2"
                    />
                );
            }
        });

        for (let i = 0; i < NODES.length - 1; i++) {
            const startY = TOP_PADDING + (i * LEVEL_GAP);
            const ticks = [0.33, 0.66];
            ticks.forEach((t, idx) => {
                const y = startY + (LEVEL_GAP * t);
                if (y <= fillLimitY) {
                    elements.push(
                        <line 
                            key={`stage-tick-active-${i}-${idx}`}
                            x1={THERMOMETER_X - 4} y1={y}
                            x2={THERMOMETER_X + 4} y2={y}
                            stroke="#BFDBFE" // Blue-200 (Light Mark)
                            strokeWidth="1.5"
                        />
                    );
                }
            });
        }

        // C. Minor Decorative Ticks (On tube only)
        for (let y = 20; y < railHeight; y += 20) {
             const tickY = TOP_PADDING + y;
             const isMajor = y % LEVEL_GAP === 0;
             const isStage1 = Math.abs((y % LEVEL_GAP) - (LEVEL_GAP * 0.33)) < 10;
             const isStage2 = Math.abs((y % LEVEL_GAP) - (LEVEL_GAP * 0.66)) < 10;

             if (!isMajor && !isStage1 && !isStage2) {
                 const isActive = tickY <= fillLimitY;
                 const color = isActive ? "#93C5FD" : "#CBD5E1"; 

                 elements.push(
                    <line 
                        key={`minor-tick-${y}`}
                        x1={THERMOMETER_X - 3} 
                        y1={tickY} 
                        x2={THERMOMETER_X + 3} 
                        y2={tickY} 
                        stroke={color}
                        strokeWidth="1"
                    />
                );
             }
        }

        return <g>{elements}</g>;
    };

    const renderPathWithFootsteps = () => {
        const segments = [];

        for (let i = 0; i < NODES.length - 1; i++) {
            const startY = TOP_PADDING + (i * LEVEL_GAP);
            const endY = TOP_PADDING + ((i + 1) * LEVEL_GAP);
            const levelIndex = i + 1;

            const isCompletedSegment = levelIndex < currentLevel;
            const isActiveSegment = levelIndex === currentLevel;
            
            segments.push(
                <line 
                    key={`path-bg-${i}`}
                    x1={PATH_X} y1={startY} 
                    x2={PATH_X} y2={endY} 
                    stroke="#CBD5E1" 
                    strokeWidth="2" 
                    strokeDasharray="4 6"
                />
            );

            const stepSpacing = 24;
            const totalSteps = LEVEL_GAP / stepSpacing;
            
            let filledStepsCount = 0;
            if (isCompletedSegment) filledStepsCount = totalSteps;
            else if (isActiveSegment) filledStepsCount = Math.floor(totalSteps * progressRatio);

            for (let s = 1; s < filledStepsCount; s++) { 
                const stepY = startY + (s * stepSpacing);
                if (stepY > endY - 20) continue;

                const isRight = s % 2 === 0;
                const offsetX = isRight ? 4 : -4;
                
                segments.push(
                    <g key={`step-${i}-${s}`} className="animate-fade-in">
                        <path 
                            d="M-1.5 -2.5 C-1.5 -4 1.5 -4 1.5 -2.5 L 1.5 1.5 C 1.5 3 -1.5 3 -1.5 1.5 Z"
                            fill="#60A5FA" // Blue-400
                            transform={`translate(${PATH_X + offsetX}, ${stepY})`}
                            opacity={0.8}
                        />
                    </g>
                );
            }
        }
        return <g>{segments}</g>;
    };

    const renderChests = () => {
        // Only show chests for levels the user is currently traversing or has passed
        // But the design implies chests exist at 33% and 66% of ANY level.
        // For simplicity, we render chests for the CURRENT level and MAYBE past ones? 
        // Let's stick to current logic: render for the current level primarily.
        
        // Actually, chests should appear on the path for the current level being traversed.
        const startY = TOP_PADDING + ((currentLevel - 1) * LEVEL_GAP);
        const chests = [
            { stage: 2, pos: 0.33 },
            { stage: 3, pos: 0.66 }
        ];

        return chests.map((chest) => {
            if (currentLevel >= 4) return null; // No chests in level 4 (Goal level)

            const yPos = startY + (LEVEL_GAP * chest.pos);
            const isUnlocked = progressRatio >= chest.pos;
            const chestId = `${currentLevel}_${chest.stage}`;
            const isOpened = openedChests.includes(chestId);
            
            let status: 'locked' | 'unlocked' | 'opened' = 'locked';
            if (isUnlocked) status = isOpened ? 'opened' : 'unlocked';

            return (
                <div 
                    key={`chest-${chest.stage}`}
                    onClick={() => onChestClick && onChestClick(chest.stage, status)}
                    className="absolute z-20 cursor-pointer group"
                    style={{ left: PATH_X, top: yPos, transform: 'translate(-50%, -50%)' }}
                >
                    {/* Glow effect for unlocked but unopened */}
                    {status === 'unlocked' && (
                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md animate-pulse opacity-60"></div>
                    )}

                    <div className={`
                        relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm
                        ${status === 'unlocked' 
                            ? 'bg-yellow-100 border-yellow-500 text-yellow-600 scale-110 shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                            : status === 'opened'
                                ? 'bg-white border-yellow-400 text-yellow-500'
                                : 'bg-slate-50 border-slate-200 text-slate-300'
                        }
                    `}>
                        {status === 'opened' ? (
                            <PackageOpen size={16} />
                        ) : (
                            <Package size={16} className={status === 'unlocked' ? 'animate-bounce-subtle' : ''} />
                        )}
                    </div>
                </div>
            );
        });
    };

    const renderNodes = () => {
        return NODES.map((node, index) => {
            const level = index + 1;
            const yPos = TOP_PADDING + (index * LEVEL_GAP);
            
            const isPast = level < currentLevel;
            const isCurrent = level === currentLevel;
            const isTarget = level === currentLevel + 1;
            const isFuture = level > currentLevel + 1;
            
            const isBossReady = isTarget && progressRatio >= 1;
            const isFinal = level === 4;

            return (
                <div 
                    key={node.id}
                    className="absolute w-full flex items-center z-30"
                    style={{ top: yPos, transform: 'translateY(-50%)' }}
                >
                    {/* 1. THE NODE (On the Path) */}
                    <div 
                        onClick={() => {
                            if (isBossReady && onLevelClick) onLevelClick(currentLevel);
                        }}
                        className="absolute flex items-center justify-center cursor-default"
                        style={{ left: PATH_X, transform: 'translateX(-50%)' }}
                    >
                        {isCurrent && (
                            <div className="absolute w-12 h-12 bg-blue-100 rounded-full animate-pulse"></div>
                        )}

                        <div className={`
                            relative rounded-full flex items-center justify-center border-2 transition-all duration-300
                            ${isCurrent 
                                ? 'w-10 h-10 bg-blue-600 border-blue-100 shadow-md text-white' 
                                : isPast 
                                    ? 'w-8 h-8 bg-slate-800 border-slate-800 text-white' 
                                    : isTarget && isBossReady
                                        ? 'w-12 h-12 bg-orange-500 border-white ring-2 ring-orange-200 text-white shadow-lg animate-bounce-subtle cursor-pointer'
                                        : 'w-8 h-8 bg-white border-slate-200 text-slate-300'
                            }
                        `}>
                            {isCurrent && <span className="text-sm font-bold">{level}</span>}
                            {isPast && <Check size={14} strokeWidth={3} />}
                            
                            {isTarget && isBossReady && <Swords size={20} />}
                            {isTarget && !isBossReady && <Lock size={12} />}
                            
                            {isFuture && <Lock size={12} />}
                            
                            {isFinal && isCurrent && <Star className="fill-current text-yellow-400" size={18} />}
                        </div>
                    </div>

                    {/* 2. THE TEXT (Right Aligned) */}
                    <div 
                        className={`absolute pr-4 transition-all duration-500 ${
                            isFuture ? 'opacity-30 grayscale' : 'opacity-100'
                        }`}
                        style={{ left: TEXT_LEFT_MARGIN }}
                    >
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${
                                isCurrent ? 'text-blue-600' : 'text-slate-400'
                            }`}>
                                {node.label}
                            </span>
                             {isPast && (
                                <span className="text-slate-400 text-[9px] font-bold px-1.5 py-0.5 border border-slate-200 rounded-full">
                                    Klar
                                </span>
                            )}
                        </div>
                        
                        <h3 className={`text-base font-bold leading-tight mb-0.5 ${
                            isCurrent ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                            {node.title}
                        </h3>
                        
                        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px]">
                            {node.sub}
                        </p>

                        {isTarget && isBossReady && (
                            <button 
                                onClick={() => onLevelClick && onLevelClick(currentLevel)}
                                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold shadow-md animate-pulse hover:bg-orange-600 transition-colors"
                            >
                                <Swords size={12} /> Starta Nivåtest
                            </button>
                        )}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="relative w-full max-w-lg mx-auto select-none" style={{ height: TOTAL_HEIGHT }}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {renderThermometer()}
                {renderPathWithFootsteps()}
            </svg>

            <div className="absolute inset-0 w-full h-full">
                {renderNodes()}
                {renderChests()}
            </div>
        </div>
    );
};

export default MapTimeline;
