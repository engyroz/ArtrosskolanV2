
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Lock, Trophy, Flag, PlayCircle, ArrowRight, Sparkles } from 'lucide-react';
import { getMaxXP } from '../utils/progressionEngine';
import { LEVEL_DESCRIPTIONS } from '../utils/contentConfig';

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

  // SVG Configuration
  const size = 160;
  const center = size / 2;
  const radius = 70;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  // Gap size in degrees converted to dash offset roughly
  const gap = 10; 
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
          className="text-slate-200/50" // Subtler background track
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
          className={`${colorClass} transition-all duration-1000 ease-out filter drop-shadow-md`}
          strokeLinecap="round"
        />
      </g>
    );
  };

  return (
    <div className="relative flex items-center justify-center">
       {/* Pulse effect if near level up */}
       {totalProgress >= 1 && (
         <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20 scale-110"></div>
       )}

      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-sm">
        <Segment progress={seg1} rotation={2} colorClass="text-blue-400" />
        <Segment progress={seg2} rotation={122} colorClass="text-blue-500" />
        <Segment progress={seg3} rotation={242} colorClass="text-blue-600" />
      </svg>
      
      {/* Center Content - Badge Style */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-inner border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nivå</span>
            <span className="text-4xl font-black text-slate-900 leading-none">{level}</span>
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
      const showLine = level < 4;

      return (
          <div key={level} className="relative flex flex-col items-center">
              {/* The Trail (Line) */}
              {showLine && (
                  <div className="absolute top-14 bottom-[-48px] w-0.5 z-0 flex flex-col items-center justify-start">
                      {/* Future Path (Dashed) */}
                      <div className="h-full w-full border-l-2 border-dashed border-slate-300 absolute inset-0 opacity-50"></div>
                      
                      {/* Past Path (Solid & Glowing) */}
                      {level < currentLevel && (
                          <div className="absolute top-0 left-[-1px] right-0 h-full w-0.5 bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] z-10"></div>
                      )}
                  </div>
              )}

              {/* Node Content */}
              <div className="z-10 py-2"> 
                  {status === 'completed' && (
                      <button 
                        className="w-12 h-12 rounded-full bg-white border-2 border-green-500 flex items-center justify-center text-green-600 shadow-md transition-transform hover:scale-110"
                        onClick={() => alert(`Historik för Nivå ${level} (Kommer snart)`)}
                      >
                          <CheckCircle className="w-6 h-6 fill-green-50" />
                      </button>
                  )}

                  {status === 'locked' && (
                      <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-300 shadow-sm">
                          <Lock className="w-4 h-4" />
                      </div>
                  )}

                  {status === 'active' && (
                      <div className="py-2 transform scale-100 transition-all">
                          <SegmentedProgressCircle 
                              level={level} 
                              currentXP={currentXP} 
                              maxXP={maxXP} 
                          />
                      </div>
                  )}
              </div>
              
              {/* Labels */}
              {status !== 'active' && (
                  <span className={`text-xs font-bold mt-1 ${status === 'completed' ? 'text-green-700' : 'text-slate-400'}`}>
                      Nivå {level}
                  </span>
              )}
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative overflow-hidden">
      
      {/* 1. Background Texture (Topographic Map) */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
      ></div>

      {/* 2. Header: "Hierarkisk Vision" */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 pt-6 pb-12 px-6 text-center shadow-sm relative z-20">
          
          {/* Destination Banner */}
          <div className="flex justify-center mb-8 animate-fade-in-down">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full shadow-sm hover:bg-slate-100 transition-colors cursor-default">
                <Flag className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">
                   Mot målet: <span className="text-indigo-900 ml-1">{getGoalText(userGoal)}</span>
                </span>
              </div>
          </div>

          {/* Level & Focus */}
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

      {/* 3. Main Content: The Map */}
      <div className="max-w-md mx-auto px-4 mt-8 flex flex-col items-center relative z-10">
          
          {/* Render Timeline Nodes */}
          <div className="flex flex-col items-center w-full space-y-2">
              {[1, 2, 3, 4].map(lvl => renderTimelineNode(lvl))}
          </div>

          {/* XP Status Text */}
          <div className="w-full text-center mt-4 mb-8 animate-fade-in">
             <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                 {currentXP} <span className="text-slate-400 text-lg font-bold">/ {maxXP} XP</span>
             </p>
             <p className="text-blue-600 font-bold text-sm mt-1">
                 {motivationalText}
             </p>
          </div>

          {/* 4. Boss Fight Portal */}
          <div className="w-full mb-12">
              {isLevelMaxed ? (
                  // UNLOCKED STATE
                  <button 
                    onClick={() => navigate('/dashboard', { state: { openBossFight: true } })}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-2xl shadow-xl transform transition-all hover:scale-[1.02] active:scale-[0.98] group"
                  >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      <div className="absolute -right-6 -bottom-6 text-yellow-600 opacity-20 rotate-12">
                          <Trophy className="w-24 h-24" />
                      </div>
                      
                      <div className="relative z-10 flex flex-col items-center">
                          <div className="bg-white/20 p-3 rounded-full mb-3 animate-pulse">
                              <Trophy className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-xl font-black uppercase tracking-widest mb-1 drop-shadow-sm">
                              Gör Nivåtestet
                          </h3>
                          <p className="text-yellow-50 font-bold text-sm">
                              Du är redo för nästa nivå!
                          </p>
                      </div>
                  </button>
              ) : (
                  // LOCKED STATE (Dark Mode "Gate")
                  <div className="w-full bg-slate-900 rounded-2xl p-1 relative overflow-hidden shadow-lg border border-slate-700">
                      <div className="bg-slate-800/50 rounded-xl p-6 flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-4">
                              <div className="bg-slate-700 p-3 rounded-full text-slate-400 border border-slate-600">
                                  <Lock className="w-6 h-6" />
                              </div>
                              <div className="text-left">
                                  <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide">Nivåtest Låst</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                      <Sparkles className="w-3 h-3 text-yellow-500" />
                                      <span className="text-xs font-bold text-yellow-500">
                                          Samlar kraft...
                                      </span>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                              <span className="text-2xl font-black text-slate-500 font-mono leading-none">
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

          {/* 5. Gamification Stats */}
          <div className="w-full grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                  <span className="text-3xl font-black text-slate-900 mb-1">{lifetimeSessions}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pass totalt</span>
              </div>
              
              <button 
                onClick={() => navigate('/knowledge')}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:bg-blue-50 hover:border-blue-200 transition-colors group"
              >
                  <div className="flex items-center gap-1 mb-2 text-blue-600">
                      <PlayCircle className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Nästa Belöning</span>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-tight group-hover:text-blue-800">
                      "Låses upp om 2 pass"
                  </p>
                  <ArrowRight className="w-4 h-4 text-blue-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1" />
              </button>
          </div>

      </div>
    </div>
  );
};

export default MyJourney;
