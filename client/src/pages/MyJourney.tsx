
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Check, Lock, Trophy, Flag, Info, ArrowRight, Sparkles } from 'lucide-react';
import { getMaxXP } from '../utils/progressionEngine';
import { LEVEL_DESCRIPTIONS } from '../utils/contentConfig';
import LevelProgressBar from '../components/LevelProgressBar';

// Helper for dynamic level titles (Uppdraget)
const getLevelFocus = (level: number) => {
  switch (level) {
    case 1: return "Smärtlindring & Ro";
    case 2: return "Grundstyrka";
    case 3: return "Uppbyggnad";
    case 4: return "Återgång & Prestation";
    default: return "Rehab";
  }
};

const SegmentedProgressCircle = ({ level, currentXP, maxXP }: { level: number, currentXP: number, maxXP: number }) => {
  // Calculate progress for the 3 segments (0-1 range)
  const totalProgress = Math.min(1, Math.max(0, currentXP / maxXP));
  
  // Segment 1: 0% - 33%
  const seg1 = Math.min(1, totalProgress * 3);
  // Segment 2: 33% - 66%
  const seg2 = Math.min(1, Math.max(0, (totalProgress - 0.333) * 3));
  // Segment 3: 66% - 100%
  const seg3 = Math.min(1, Math.max(0, (totalProgress - 0.666) * 3));

  // The Reactor Core Configuration - Compact Size
  const size = 100; // Reduced size
  const center = size / 2;
  const strokeWidth = 10; 
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const gap = 6; 
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
    <div className="relative flex items-center justify-center w-[100px] h-[100px]">
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
        <div className="w-16 h-16 bg-white rounded-full flex flex-col items-center justify-center shadow-xl shadow-blue-900/10">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Nivå</span>
            <span className="text-2xl font-black text-slate-900 leading-none">{level}</span>
        </div>
      </div>
    </div>
  );
};

const MyJourney = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  const currentLevel = userProfile?.currentLevel || 1;
  const userGoal = userProfile?.assessmentData?.mainGoal || "Bli smärtfri";
  const currentStage = userProfile?.progression?.currentStage || 1;
  
  const getGoalText = (val: string) => {
      const map: Record<string, string> = {
          'family': 'Leka med barnbarnen',
          'nature': 'Gå i skogen',
          'sport': 'Spela Padel igen',
          'daily_life': 'Klara vardagen smärtfritt',
          'work': 'Jobba utan besvär',
          'security': 'Lita på kroppen'
      };
      return map[val] || val.replace(/_/g, ' ');
  };

  const currentXP = userProfile?.progression?.experiencePoints || 0;
  const maxXP = getMaxXP(currentLevel);
  const isLevelMaxed = currentXP >= maxXP; 
  
  // Compact Vertical Map Logic
  const renderTimelineNode = (level: number) => {
      const status = level < currentLevel ? 'completed' : level === currentLevel ? 'active' : 'locked';
      const isLeft = level % 2 !== 0;
      
      // Node alignment - wider spread
      // Container width max-w-md (approx 448px)
      // Left align: start
      // Right align: end
      let alignClass = isLeft ? 'items-start pl-8' : 'items-end pr-8';
      
      return (
          <div key={level} className={`relative flex flex-col w-full ${alignClass} mb-0 z-10 h-20 justify-center`}>
              {/* Node Content */}
              <div className="relative"> 
                  {status === 'completed' && (
                      <button 
                        className="w-16 h-16 rounded-full bg-green-500 flex flex-col items-center justify-center text-white shadow-xl transform transition-transform hover:scale-105 z-20"
                      >
                          <Check className="w-6 h-6 mb-1 stroke-[3]" />
                          <span className="font-bold text-[9px]">NIVÅ {level}</span>
                      </button>
                  )}

                  {status === 'locked' && (
                      <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 flex flex-col items-center justify-center text-slate-300 shadow-sm z-10">
                          <Lock className="w-5 h-5 mb-1" />
                          <span className="font-bold text-[9px] text-slate-400">NIVÅ {level}</span>
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

  // SVG PATHS - Compact Vertical, Wide Horizontal
  // Width 416. 
  // Nodes at Y: 40, 120, 200, 280 (Step 80)
  // X range: ~40 to ~376
  const PATHS = [
    { id: 1, d: "M 40 40 C 40 80, 376 80, 376 120" },
    { id: 2, d: "M 376 120 C 376 160, 40 160, 40 200" },
    { id: 3, d: "M 40 200 C 40 240, 376 240, 376 280" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-32 relative overflow-hidden">
      
      {/* 1. Background Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
      ></div>

      {/* 2. Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 pt-6 pb-12 px-6 text-center shadow-sm relative z-20">
          <div className="flex justify-center mb-6 animate-fade-in-down">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full shadow-sm hover:bg-slate-100 transition-colors cursor-default">
                <Flag className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">
                   Mot målet: <span className="text-indigo-900 ml-1">{getGoalText(userGoal)}</span>
                </span>
              </div>
          </div>

          <div className="flex flex-col items-center animate-fade-in-up">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-widest rounded-md mb-2 shadow-sm">
                  Nivå {currentLevel}
              </span>
              
              <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight leading-none uppercase">
                  {getLevelFocus(currentLevel)}
              </h1>
              
              <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto leading-relaxed">
                  {LEVEL_DESCRIPTIONS[currentLevel as keyof typeof LEVEL_DESCRIPTIONS]}
              </p>
          </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-8 relative z-10">

          {/* 3. The Map (Compact & Wide) */}
          <div className="relative pb-8 mb-4">
              {/* THE TRAIL SVG */}
              <svg 
                className="absolute top-0 left-0 right-0 h-[320px] w-full pointer-events-none z-0 overflow-visible" 
                viewBox="0 0 416 320" 
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

              {/* Render Nodes */}
              <div className="flex flex-col w-full relative pt-0">
                  {[1, 2, 3, 4].map(lvl => renderTimelineNode(lvl))}
              </div>
          </div>

          {/* 4. Progress Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg relative z-20">
             <h3 className="text-lg font-bold text-slate-900 mb-4">Dina träningspoäng</h3>
             
             <LevelProgressBar 
                level={currentLevel}
                currentXP={currentXP}
                maxXP={maxXP}
                currentStage={currentStage}
             />
             
             {/* Info Box */}
             <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mt-6 mb-6 flex gap-3">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-900 leading-relaxed font-medium">
                   Du samlar poäng genom att genomföra dina rehabpass och läsa artiklar. När mätaren är full är du redo för Nivåtestet.
                </p>
             </div>

             {/* Boss Fight Button */}
             <div className="w-full">
                  {isLevelMaxed ? (
                      // UNLOCKED STATE
                      <button 
                        onClick={() => navigate('/dashboard', { state: { openBossFight: true } })}
                        className="w-full relative overflow-hidden bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 p-5 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] animate-pulse group font-black text-lg uppercase tracking-wider flex items-center justify-center gap-3 border border-yellow-300"
                      >
                          <Trophy className="w-6 h-6" />
                          GÖR NIVÅTESTET
                      </button>
                  ) : (
                      // LOCKED STATE
                      <button 
                        disabled
                        className="w-full bg-slate-100 text-slate-400 p-5 rounded-xl font-bold text-sm border border-slate-200 flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                          <Lock className="w-4 h-4" />
                          Nivåtestet är låst (Samla fler poäng)
                      </button>
                  )}
             </div>
          </div>

      </div>
    </div>
  );
};

export default MyJourney;
