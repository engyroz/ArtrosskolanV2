import React from 'react';
import { Check, Lock } from 'lucide-react';

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
  const size = 90; // Slightly reduced from 100
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
        <div className="w-14 h-14 bg-white rounded-full flex flex-col items-center justify-center shadow-xl shadow-blue-900/10">
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Nivå</span>
            <span className="text-xl font-black text-slate-900 leading-none">{level}</span>
        </div>
      </div>
    </div>
  );
};

interface MapTimelineProps {
  currentLevel: number;
  currentXP: number;
  maxXP: number;
}

const MapTimeline = ({ currentLevel, currentXP, maxXP }: MapTimelineProps) => {
    // Compact coordinates
    // Width assumed approx 416px in viewbox (matches container max-w-md padding)
    // Y Step: 65px
    // Y Positions: 30, 95, 160, 225
    // X Range: 10 to 406 (Wider spread)
    
    const PATHS = [
      { id: 1, d: "M 10 30 C 10 65, 406 65, 406 95" },
      { id: 2, d: "M 406 95 C 406 130, 10 130, 10 160" },
      { id: 3, d: "M 10 160 C 10 195, 406 195, 406 225" }
    ];

    const renderTimelineNode = (level: number) => {
        const status = level < currentLevel ? 'completed' : level === currentLevel ? 'active' : 'locked';
        const isLeft = level % 2 !== 0; 
        
        // Alignment classes - reduced padding for wider spread
        let alignClass = isLeft ? 'items-start pl-2' : 'items-end pr-2';
        
        return (
            <div key={level} className={`relative flex flex-col w-full ${alignClass} mb-0 z-10 h-[65px] justify-center`}>
                <div className="relative"> 
                    {status === 'completed' && (
                        <div 
                          className="w-14 h-14 rounded-full bg-green-500 flex flex-col items-center justify-center text-white shadow-xl transform transition-transform hover:scale-105 z-20"
                        >
                            <Check className="w-5 h-5 mb-0.5 stroke-[3]" />
                            <span className="font-bold text-[8px]">NIVÅ {level}</span>
                        </div>
                    )}

                    {status === 'locked' && (
                        <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-200 flex flex-col items-center justify-center text-slate-300 shadow-sm z-10">
                            <Lock className="w-4 h-4 mb-0.5" />
                            <span className="font-bold text-[8px] text-slate-400">NIVÅ {level}</span>
                        </div>
                    )}

                    {status === 'active' && (
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
        <div className="relative pb-4 mb-4">
            <svg 
              className="absolute top-0 left-0 right-0 h-[260px] w-full pointer-events-none z-0 overflow-visible" 
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
                   if (currentLevel < (p.id + 1)) return null;
                   return (
                       <path 
                          key={`active-${p.id}`}
                          d={p.d} 
                          fill="none" 
                          stroke="#22C55E" 
                          strokeWidth="4" 
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-draw"
                       />
                   );
               })}
            </svg>

            <div className="flex flex-col w-full relative pt-0">
                {[1, 2, 3, 4].map(lvl => renderTimelineNode(lvl))}
            </div>
        </div>
    );
};

export default MapTimeline;