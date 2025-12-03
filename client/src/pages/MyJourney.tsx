
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Check, Lock, Trophy, Flag, PlayCircle, ArrowRight, Sparkles } from 'lucide-react';
import { getMaxXP } from '../utils/progressionEngine';
import { LEVEL_DESCRIPTIONS } from '../utils/contentConfig';

// Helper for dynamic level titles
const getLevelFocus = (level: number) => {
  switch (level) {
    case 1: return "Smärtlindring & Ro";
    case 2: return "Grundstyrka";
    case 3: return "Uppbyggnad";
    case 4: return "Återgång & Prestation";
    default: return "Rehab";
  }
};

const ReactorCore = ({ level, currentXP, maxXP }: { level: number, currentXP: number, maxXP: number }) => {
  const totalProgress = Math.min(1, Math.max(0, currentXP / maxXP));
  
  // Segment logic
  const seg1 = Math.min(1, totalProgress * 3);
  const seg2 = Math.min(1, Math.max(0, (totalProgress - 0.333) * 3));
  const seg3 = Math.min(1, Math.max(0, (totalProgress - 0.666) * 3));

  const size = 180;
  const center = size / 2;
  const strokeWidth = 22; 
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = 8;
  const segmentLength = (circumference / 3) - (gap * 2);
  
  // Inner core size calculation for tight fit
  // Radius of ring center = 79. Inner edge = 79 - 11 = 68.
  // Core radius should be 68. Diameter = 136.
  const coreSize = 136;

  const Segment = ({ progress, rotation, colorClass }: any) => (
    <g transform={`rotate(${rotation}, ${center}, ${center})`}>
      {/* Track */}
      <circle
        cx={center} cy={center} r={radius}
        fill="none" stroke="currentColor" strokeWidth={strokeWidth}
        strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
        className="text-slate-200" strokeLinecap="round"
      />
      {/* Indicator */}
      <circle
        cx={center} cy={center} r={radius}
        fill="none" stroke="currentColor" strokeWidth={strokeWidth}
        strokeDasharray={`${segmentLength * progress} ${circumference - (segmentLength * progress)}`}
        className={`${colorClass} transition-all duration-1000 ease-out`}
        strokeLinecap="round"
      />
    </g>
  );

  return (
    <div className="relative flex items-center justify-center filter drop-shadow-xl" style={{ width: size, height: size }}>
       {/* Outer Glow */}
       <div className="absolute inset-2 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>

       <svg width={size} height={size} className="absolute inset-0 transform -rotate-90 z-10">
         <Segment progress={seg1} rotation={2} colorClass="text-blue-400" />
         <Segment progress={seg2} rotation={122} colorClass="text-blue-500" />
         <Segment progress={seg3} rotation={242} colorClass="text-blue-600" />
       </svg>
       
       {/* The Reactor Core */}
       <div 
         className="absolute bg-white rounded-full flex flex-col items-center justify-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] z-20 border border-slate-50"
         style={{ width: coreSize, height: coreSize }}
       >
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nivå</span>
          <span className="text-6xl font-black text-slate-900 leading-none tracking-tighter">{level}</span>
       </div>
    </div>
  );
};

// Fixed Coordinates for the Map
// Using a 340px wide coordinate system
const POSITIONS = [
    { x: 80, y: 100 },  // Level 1 (Left)
    { x: 260, y: 320 }, // Level 2 (Right)
    { x: 80, y: 540 },  // Level 3 (Left)
    { x: 260, y: 760 }  // Level 4 (Right)
];

const MyJourney = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  const currentLevel = userProfile?.currentLevel || 1;
  const userGoal = userProfile?.assessmentData?.mainGoal || "Bli smärtfri";
  const currentXP = userProfile?.progression?.experiencePoints || 0;
  const maxXP = getMaxXP(currentLevel);
  const isLevelMaxed = currentXP >= maxXP; 
  const lifetimeSessions = userProfile?.progression?.lifetimeSessions || 0;
  const progressPct = currentXP / maxXP;

  const getGoalText = (val: string) => {
    const map: Record<string, string> = {
        'family': 'Leka med barnbarnen',
        'nature': 'Gå i skogen',
        'sport': 'Spela Padel igen',
        'daily_life': 'Klara vardagen',
        'work': 'Jobba utan besvär',
        'security': 'Lita på kroppen'
    };
    return map[val] || val;
  };

  let motivationalText = "Bra start! Fortsätt jobba.";
  if (progressPct > 0.3) motivationalText = "Första etappen snart klar!";
  if (progressPct > 0.6) motivationalText = "Snart dags för nästa etapp!";
  if (progressPct >= 1) motivationalText = "Du är redo för Nivåtestet!";

  const renderNode = (level: number, pos: {x: number, y: number}) => {
      const isActive = level === currentLevel;
      const isCompleted = level < currentLevel;
      const isLocked = level > currentLevel;

      // Absolute positioning based on center point
      // Active Node is 180px -> Offset 90
      // Passive Node is 128px (w-32) -> Offset 64
      const size = isActive ? 180 : 128;
      const offset = size / 2;
      
      const style = {
          top: pos.y - offset,
          left: pos.x - offset,
          width: size,
          height: size
      };

      return (
          <div key={level} className="absolute z-20 flex items-center justify-center transition-all duration-500" style={style}>
              {isActive && (
                  <ReactorCore level={level} currentXP={currentXP} maxXP={maxXP} />
              )}
              
              {isCompleted && (
                  <div className="w-full h-full rounded-full bg-green-500 flex flex-col items-center justify-center shadow-lg transform hover:scale-105 transition-transform text-white border-4 border-green-100">
                      <Check className="w-10 h-10 mb-1 stroke-[3]" />
                      <span className="font-bold text-lg leading-none">Nivå {level}</span>
                  </div>
              )}

              {isLocked && (
                  <div className="w-full h-full rounded-full bg-slate-100 border-2 border-slate-200 flex flex-col items-center justify-center text-slate-300 shadow-sm">
                      <Lock className="w-8 h-8 mb-1" />
                      <span className="font-bold text-lg text-slate-400 leading-none">Nivå {level}</span>
                  </div>
              )}
          </div>
      );
  };

  const renderPath = (startIdx: number, endIdx: number) => {
      const start = POSITIONS[startIdx];
      const end = POSITIONS[endIdx];
      const targetLevel = endIdx + 1; // 0-based index map to levels 1-4
      const isUnlocked = currentLevel >= targetLevel;

      // Create S-Curve
      // We want minimal vertical straight lines, so we curve immediately.
      // Control points vertically spaced to create the curve.
      const distY = end.y - start.y;
      const cpY1 = start.y + (distY * 0.55);
      const cpY2 = end.y - (distY * 0.55);

      const d = `M ${start.x} ${start.y} C ${start.x} ${cpY1}, ${end.x} ${cpY2}, ${end.x} ${end.y}`;

      return (
        <g key={`path-${startIdx}-${endIdx}`}>
            {/* Background Path (Dashed/Empty) */}
            <path 
                d={d} 
                fill="none" 
                stroke="#E2E8F0" 
                strokeWidth="16" 
                strokeLinecap="round"
            />
            {/* Dashed Center Line */}
            <path 
                d={d} 
                fill="none" 
                stroke="#94A3B8" 
                strokeWidth="2" 
                strokeDasharray="8 8" 
                strokeLinecap="round"
                className="opacity-30"
            />
            
            {/* Active/Completed Path */}
            {isUnlocked && (
                <path 
                    d={d} 
                    fill="none" 
                    stroke="#22C55E" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    className="drop-shadow-md animate-draw"
                />
            )}
        </g>
      );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 pt-6 pb-8 px-6 text-center sticky top-0 z-30 shadow-sm">
          <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
                <Flag className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                <span className="text-xs font-bold text-indigo-900 tracking-wide uppercase">
                   Mål: {getGoalText(userGoal)}
                </span>
              </div>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none mb-2">
              {getLevelFocus(currentLevel)}
          </h1>
          <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs mx-auto">
              {LEVEL_DESCRIPTIONS[currentLevel as keyof typeof LEVEL_DESCRIPTIONS]}
          </p>
      </div>

      {/* Map Container */}
      <div className="relative w-full max-w-[340px] mx-auto mt-8 h-[900px]">
          
          {/* SVG Layer for Paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 340 900">
              {renderPath(0, 1)}
              {renderPath(1, 2)}
              {renderPath(2, 3)}
          </svg>

          {/* Node Layer */}
          {POSITIONS.map((pos, idx) => renderNode(idx + 1, pos))}

          {/* Stats / Info floating near active node? Or at bottom */}
          <div className="absolute bottom-0 w-full text-center pb-8 z-20">
             <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl border border-slate-100 mx-4">
                 <p className="text-2xl font-black text-slate-900 font-mono mb-2">
                     {currentXP} <span className="text-slate-400 text-lg">/ {maxXP} XP</span>
                 </p>
                 <p className="text-blue-600 font-bold text-sm mb-6">
                     {motivationalText}
                 </p>

                 {isLevelMaxed ? (
                      <button 
                        onClick={() => navigate('/dashboard', { state: { openBossFight: true } })}
                        className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                      >
                          <Trophy className="w-5 h-5" /> Starta Nivåtest
                      </button>
                 ) : (
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${progressPct * 100}%` }}></div>
                    </div>
                 )}
             </div>
          </div>
      </div>
    </div>
  );
};

export default MyJourney;
