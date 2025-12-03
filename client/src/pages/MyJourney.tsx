
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Check, Lock, Trophy, Flag, PlayCircle, ArrowRight, Sparkles } from 'lucide-react';
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
  const size = 120;
  const center = size / 2;
  const strokeWidth = 12; 
  // Ring Radius
  // Core is 80px (w-20). Radius 40px.
  // Gap 4px. Stroke center at 40 + 4 + 6 = 50.
  const radius = 50;
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
    <div className="relative flex items-center justify-center w-[120px] h-[120px]">
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
        <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-xl shadow-blue-900/10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Nivå</span>
            <span className="text-3xl font-black text-slate-900 leading-none">{level}</span>
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
  const lifetimeSessions = userProfile?.progression?.lifetimeSessions || 0;

  const progressPct = currentXP / maxXP;
  let motivationalText = "Bra start! Fortsätt jobba.";
  if (progressPct > 0.3) motivationalText = "Första etappen snart klar!";
  if (progressPct > 0.34) motivationalText = "Bra jobbat! Etapp 2 påbörjad.";
  if (progressPct > 0.6) motivationalText = "Bara 1 pass kvar till Etapp 3!";
  if (progressPct > 0.67) motivationalText = "Sista rycket mot nästa nivå!";
  if (progressPct >= 1) motivationalText = "Du är redo för Nivåtestet!";

  const renderTimelineNode = (level: number) => {
      const status = level < currentLevel ? 'completed' : level === currentLevel ? 'active' : 'locked';
      
      const isLeft = level % 2 !== 0;
      const isActive = status === 'active';
      
      // Alignment Logic for wider distribution
      // Nodes are w-20 (80px). Center is 40px from edge.
      // SVG Paths ends are at X=40 and X=376.
      // Container is 416px wide (due to padding).
      // items-start aligns left (X=0 to X=80, center 40). Matches SVG X=40.
      // items-end aligns right (X=336 to X=416, center 376). Matches SVG X=376.
      
      // If active, node is 120px. Center is 60px.
      // We need to shift it by 20px (60-40) to align center with SVG line.
      
      let alignClass = isLeft ? 'items-start' : 'items-end';
      if (isActive) {
           alignClass += isLeft ? ' -ml-[20px]' : ' -mr-[20px]';
      }
      
      return (
          <div key={level} className={`relative flex flex-col w-full ${alignClass} mb-1 z-10 h-24 justify-center`}>
              
              {/* Node Content */}
              <div className="relative"> 
                  {status === 'completed' && (
                      <button 
                        className="w-20 h-20 rounded-full bg-green-500 flex flex-col items-center justify-center text-white shadow-xl transform transition-transform hover:scale-105 z-20"
                        onClick={() => alert(`Historik för Nivå ${level} (Kommer snart)`)}
                      >
                          <Check className="w-8 h-8 mb-1 stroke-[3]" />
                          <span className="font-bold text-[10px]">NIVÅ {level}</span>
                      </button>
                  )}

                  {status === 'locked' && (
                      <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex flex-col items-center justify-center text-slate-300 shadow-sm z-10">
                          <Lock className="w-6 h-6 mb-1" />
                          <span className="font-bold text-[10px] text-slate-400">NIVÅ {level}</span>
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

  // PATH DATA - Compact & Wide
  // X: 40 -> 376 (Width 416 container)
  // Y: Step 100.
  // Height: 400px.
  const PATHS = [
    { id: 1, d: "M 40 50 C 40 100, 376 100, 376 150" },
    { id: 2, d: "M 376 150 C 376 200, 40 200, 40 250" },
    { id: 3, d: "M 40 250 C 40 300, 376 300, 376 350" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative overflow-hidden">
      
      {/* 1. Background Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
      ></div>

      {/* 2. Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 pt-6 pb-12 px-6 text-center shadow-sm relative z-20">
          
          <div className="flex justify-center mb-8 animate-fade-in-down">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full shadow-sm hover:bg-slate-100 transition-colors cursor-default">
                <Flag className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">
                   Mot målet: <span className="text-indigo-900 ml-1">{getGoalText(userGoal)}</span>
                </span>
              </div>
          </div>

          <div className="flex flex-col items-center animate-fade-in-up">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-widest rounded-md mb-3 shadow-sm">
                  Nivå {currentLevel}
              </span>
              
              <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight leading-none uppercase">
                  {getLevelFocus(currentLevel)}
              </h1>
              
              <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto leading-relaxed">
                  {LEVEL_DESCRIPTIONS[currentLevel as keyof typeof LEVEL_DESCRIPTIONS]}
              </p>
          </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-8 relative z-10">

          {/* 3. GROUPED PROGRESS & ACTION CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-12 relative z-20">
             
             {/* Progress Bar */}
             <div className="mb-8">
                <LevelProgressBar 
                    level={currentLevel}
                    currentXP={currentXP}
                    maxXP={maxXP}
                    currentStage={currentStage}
                />
                <p className="text-center text-blue-600 font-bold text-sm mt-3">
                    {motivationalText}
                </p>
             </div>

             {/* Gamification Stats */}
             <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                    <span className="text-2xl font-black text-slate-900 mb-1">{lifetimeSessions}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pass totalt</span>
                </div>
                
                <button 
                    onClick={() => navigate('/knowledge')}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                >
                    <div className="flex items-center gap-1 mb-1 text-blue-600">
                        <PlayCircle className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Nästa Belöning</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold group-hover:text-blue-800">
                        "Låses upp om 2 pass"
                    </p>
                </button>
             </div>

             {/* Boss Fight Portal */}
             <div className="w-full">
                  {isLevelMaxed ? (
                      // UNLOCKED STATE
                      <button 
                        onClick={() => navigate('/dashboard', { state: { openBossFight: true } })}
                        className="w-full relative overflow-hidden bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] group"
                      >
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                          <div className="absolute -right-6 -bottom-6 text-yellow-600 opacity-20 rotate-12">
                              <Trophy className="w-24 h-24" />
                          </div>
                          
                          <div className="relative z-10 flex flex-col items-center">
                              <div className="bg-white/20 p-3 rounded-full mb-3 animate-pulse">
                                  <Trophy className="w-6 h-6 text-white" />
                              </div>
                              <h3 className="text-lg font-black uppercase tracking-widest mb-1 drop-shadow-sm">
                                  Gör Nivåtestet
                              </h3>
                              <p className="text-yellow-50 font-bold text-xs">
                                  Du är redo för nästa nivå!
                              </p>
                          </div>
                      </button>
                  ) : (
                      // LOCKED STATE
                      <div className="w-full bg-slate-900 rounded-xl p-1 relative overflow-hidden shadow-md border border-slate-700">
                          <div className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-3">
                                  <div className="bg-slate-700 p-2 rounded-full text-slate-400 border border-slate-600">
                                      <Lock className="w-5 h-5" />
                                  </div>
                                  <div className="text-left">
                                      <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wide">Nivåtest Låst</h3>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                          <Sparkles className="w-3 h-3 text-yellow-500" />
                                          <span className="text-[10px] font-bold text-yellow-500">
                                              Samlar kraft...
                                          </span>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="flex flex-col items-end">
                                  <span className="text-xl font-black text-slate-500 font-mono leading-none">
                                      {Math.round(progressPct * 100)}%
                                  </span>
                              </div>
                          </div>
                          
                          {/* Progress Bar at bottom */}
                          <div className="h-1 w-full bg-slate-800">
                              <div 
                                 className="h-full bg-gradient-to-r from-blue-600 to-purple-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                                 style={{ width: `${Math.min(100, progressPct * 100)}%` }}
                              ></div>
                          </div>
                      </div>
                  )}
             </div>
          </div>

          {/* 4. The Map (Compact & Wide) */}
          <div className="relative pb-12">
              
              {/* THE TRAIL SVG */}
              <svg 
                className="absolute top-0 left-0 right-0 h-[400px] w-full pointer-events-none z-0 overflow-visible" 
                viewBox="0 0 416 400" 
                preserveAspectRatio="none"
              >
                 {PATHS.map(p => (
                     <path 
                        key={`bg-${p.id}`}
                        d={p.d} 
                        fill="none" 
                        stroke="#CBD5E1" 
                        strokeWidth="4" 
                        strokeDasharray="10,10" 
                        strokeLinecap="round"
                        className="opacity-50"
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
              <div className="flex flex-col w-full relative">
                  {[1, 2, 3, 4].map(lvl => renderTimelineNode(lvl))}
              </div>

          </div>

      </div>
    </div>
  );
};

export default MyJourney;
