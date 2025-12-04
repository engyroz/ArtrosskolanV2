import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Trophy, Flag, Info } from 'lucide-react';
import { getMaxXP } from '../utils/progressionEngine';
import { LEVEL_DESCRIPTIONS } from '../utils/contentConfig';
import LevelProgressBar from '../components/LevelProgressBar';
import MapTimeline from '../components/MapTimeline';

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

const MyJourney = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  const currentLevel = userProfile?.currentLevel || 1;
  // Determine start level from initial assessment program, defaulting to 1
  const startLevel = userProfile?.program?.level || 1;
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
  
  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      
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

          {/* 3. The Map (Wrapped in Bordered Card with Background) */}
          <div className="relative bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden mb-6">
              
              {/* Map Background Pattern (Contained) */}
              <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
              ></div>

              <div className="py-8 px-2">
                <MapTimeline 
                    currentLevel={currentLevel}
                    currentXP={currentXP}
                    maxXP={maxXP}
                    startLevel={startLevel}
                />
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