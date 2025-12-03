import React from 'react';
import { Check, Lock, ChevronsRight } from 'lucide-react';

const SegmentedProgressCircle = ({ level, currentXP, maxXP }: { level: number, currentXP: number, maxXP: number }) => {
  // Calculate progress for the 3 segments (0-1 range)
  const totalProgress = Math.min(1, Math.max(0, currentXP / maxXP));
  
  // Segment 1: 0% - 33%
  const seg1 = Math.min(1, totalProgress * 3);
  // Segment 2: 33% - 66%
  const seg2 = Math.min(1, Math.max(0, (totalProgress - 0.333) * 3));
  // Segment 3: 66% - 100%
  const seg3 = Math.min(1, Math.max(0, (totalProgress - 0.666) * 3));

  // The Reactor Core Configuration
  const size = 90; 
  const center = size / 2;
  const strokeWidth = 8; 
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const gap = 5; 
  const segmentLength = (circumference / 3) - (gap * 2); 

  const Segment = ({ progress, rotation, colorClass }: any) => {
    return (
      <g transform={`rotate(${rotation}, ${center}, ${center})`}>
        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
          className="text-slate-100" 
          strokeLinecap="round"
        />
        {/* Filled Track with Glow */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={`${segmentLength * progress} ${circumference - (segmentLength * progress)}`}
          className={`${colorClass} transition-all duration-1000 ease-out`}
          strokeLinecap="round"
        />
      </g>
    );
  };

  return (
    <div className="relative flex items-center justify-center w-[90px] h-[90px]">
       {/* Pulse effect if near level up */}
       {totalProgress >= 1 && (
         <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20 scale-110"></div>
       )}

      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-sm z-0 relative">
        <Segment progress={seg1} rotation={2} colorClass="text-blue-400" />
        <Segment progress={seg2} rotation={122} colorClass="text-blue-500" />
        <Segment progress={seg3} rotation={242} colorClass="text-blue-600" />
      </svg>
      
      {/* Center Content - The Reactor Core */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div className="w-14 h-14 bg-blue-600 rounded-full flex flex-col items-center justify-center shadow-lg shadow-blue-900/20">
            <span className="text-[8px] text-blue-100 font-bold uppercase tracking-widest mb-0.5">Nivå</span>
            <span className="text-xl font-black text-white leading-none">{level}</span>
        </div>
      </div>
    </div>
  );
};

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
    
    // Narrower X-coords ensure the path starts/ends "under" the nodes visually
    const PATHS = [
      { id: 1, d: "M 53 32.5 C 153 32.5, 263 97.5, 363 97.5" },
      { id: 2, d: "M 363 97.5 C 263 97.5, 153 162.5, 53 162.5" },
      { id: 3, d: "M 53 162.5 C 153 162.5, 263 227.5, 363 227.5" }
    ];

    const renderTimelineNode = (level: number) => {
        // Status determination
        // 1. Skipped: If level is below the start level
        const isSkipped = level < startLevel;
        // 2. Completed: Not skipped, but below current level
        const isCompleted = !isSkipped && level < currentLevel;
        // 3. Active: Exactly current level
        const isActive = level === currentLevel;
        // 4. Locked: Above current level
        const isLocked = level > currentLevel;

        const isLeft = level % 2 !== 0; 
        
        // Positioning Percentages
        const topPct = [12.5, 37.5, 62.5, 87.5][level - 1];
        const leftPct = isLeft ? 12.74 : 87.26;

        const interactClasses = "cursor-pointer transform transition-transform duration-300 hover:scale-110 active:scale-95";

        return (
            <div 
                key={level} 
                className={`absolute flex items-center justify-center w-[90px] h-[90px] ${interactClasses}`}
                onClick={() => onLevelClick && onLevelClick(level)}
                style={{ 
                    top: `${topPct}%`, 
                    left: `${leftPct}%`,
                    transform: 'translate(-50%, -50%)' // Center the node on the coordinate
                }}
            >
                <div className="relative flex items-center justify-center"> 
                    
                    {isSkipped && (
                        <div className="w-14 h-14 rounded-full bg-white/50 backdrop-blur-[2px] border-2 border-dashed border-blue-300 flex flex-col items-center justify-center text-blue-400 shadow-sm z-20">
                             <ChevronsRight className="w-5 h-5 mb-0.5" />
                             <span className="font-bold text-[8px] uppercase tracking-wide">Nivå {level}</span>
                        </div>
                    )}

                    {isCompleted && (
                        <div 
                          className="w-14 h-14 rounded-full bg-green-500 flex flex-col items-center justify-center text-white shadow-xl z-20"
                        >
                            <Check className="w-5 h-5 mb-0.5 stroke-[3]" />
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
                        <div className="transform scale-100 transition-all z-30">
                            <SegmentedProgressCircle 
                                level={level} 
                                currentXP={currentXP} 
                                maxXP={maxXP} 
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="relative w-full aspect-[8/5] mb-4">
            {/* SVG Layer */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-0" 
              viewBox="0 0 416 260" 
              preserveAspectRatio="none"
            >
               {PATHS.map(p => (
                   <path 
                      key={`bg-${p.id}`}
                      d={p.d} 
                      fill="none" 
                      stroke="#CBD5E1" 
                      strokeWidth="4" 
                      strokeDasharray="8,8" 
                      strokeLinecap="round"
                      className="opacity-60"
                   />
               ))}

               {PATHS.map(p => {
                   if (currentLevel <= p.id) return null;
                   
                   const isSkippedPath = p.id < startLevel;
                   
                   return (
                       <path 
                          key={`active-${p.id}`}
                          d={p.d} 
                          fill="none" 
                          stroke={isSkippedPath ? "#93C5FD" : "#22C55E"} 
                          strokeWidth="4" 
                          strokeLinecap="round"
                          strokeDasharray={isSkippedPath ? "8,6" : "none"}
                          className="drop-shadow-[0_0_8px_rgba(0,0,0,0.05)] animate-draw"
                       />
                   );
               })}
            </svg>

            {/* Nodes Overlay Layer */}
            <div className="absolute inset-0 z-10">
                {[1, 2, 3, 4].map(lvl => renderTimelineNode(lvl))}
            </div>
        </div>
    );
};

export default MapTimeline;