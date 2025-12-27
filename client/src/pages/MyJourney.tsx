
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Flag, X, Gift, AlertCircle, CheckCircle } from 'lucide-react';
import { getMaxXP } from '../utils/progressionEngine';
import { LEVEL_DESCRIPTIONS } from '../utils/contentConfig';
import MapTimeline from '../components/MapTimeline';
import BossFightModal from '../components/BossFightModal';

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

const MyJourney = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  // State for modals
  const [showBossModal, setShowBossModal] = useState(false);
  const [chestModal, setChestModal] = useState<{ isOpen: boolean; stage: number; status: 'locked' | 'unlocked' } | null>(null);

  const currentLevel = userProfile?.currentLevel || 1;
  const startLevel = userProfile?.program?.level || 1;
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

  // --- HANDLERS ---

  const handleLevelClick = (clickedLevel: number) => {
     // If user clicks the CURRENT level node and XP is maxed, trigger boss fight
     // Note: In MapTimeline, we pass 'currentLevel' when the *Target* node (current+1) is clicked if ready.
     // But wait, the MapTimeline logic for isBossReady was on (current+1). 
     // Let's rely on MapTimeline passing the correct signal.
     
     // Actually, if we are Level 1, we want to start the Boss Fight TO ENTER Level 2.
     // The MapTimeline calls this with `currentLevel` when the *next* node is clicked and ready.
     setShowBossModal(true);
  };

  const handleBossSuccess = () => {
      // Navigate to dashboard to trigger the level up effect logic there (or handle here if preferred)
      // For now, let's close modal and maybe the Dashboard will detect the change after DB update
      setShowBossModal(false);
      navigate('/dashboard'); 
  };

  const handleChestClick = (stage: number, status: 'locked' | 'unlocked') => {
      setChestModal({ isOpen: true, stage, status });
  };

  // --- RENDER ---
  
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* 1. Header (Sticky) */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 pt-4 pb-4 px-6 sticky top-16 z-40 shadow-sm">
          <div className="flex justify-center mb-2 animate-fade-in-down">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full cursor-default">
                <Flag className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                <span className="text-[10px] font-bold text-indigo-900 tracking-wide uppercase">
                   Mål: {getGoalText(userGoal)}
                </span>
              </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                {getLevelFocus(currentLevel)}
            </h1>
            <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto line-clamp-2">
                {LEVEL_DESCRIPTIONS[currentLevel as keyof typeof LEVEL_DESCRIPTIONS]}
            </p>
          </div>
      </div>

      <div className="max-w-md mx-auto relative z-10 overflow-hidden">
          
          {/* 2. The Map */}
          <div className="pt-10 pb-24">
            <MapTimeline 
                currentLevel={currentLevel}
                currentXP={currentXP}
                maxXP={maxXP}
                startLevel={startLevel}
                onLevelClick={handleLevelClick}
                onChestClick={handleChestClick}
            />
          </div>

      </div>

      {/* --- MODALS --- */}

      <BossFightModal
        isOpen={showBossModal}
        onClose={() => setShowBossModal(false)}
        onSuccess={handleBossSuccess}
        level={currentLevel}
      />

      {/* Chest Modal (Simple inline) */}
      {chestModal && chestModal.isOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setChestModal(null)}></div>
             <div className="relative bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in">
                 <button onClick={() => setChestModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                     <X className="w-5 h-5" />
                 </button>
                 
                 <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                     chestModal.status === 'unlocked' ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-400'
                 }`}>
                     <Gift className="w-8 h-8" />
                 </div>

                 <h3 className="text-xl font-bold text-center text-slate-900 mb-2">
                     {chestModal.status === 'unlocked' ? `Etapp ${chestModal.stage} Avklarad!` : `Etapp ${chestModal.stage}`}
                 </h3>

                 {chestModal.status === 'unlocked' ? (
                     <div className="text-center space-y-4">
                         <p className="text-slate-600 text-sm">
                             Bra jobbat! Du har låst upp nya, mer utmanande övningar i ditt träningsprogram.
                         </p>
                         <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-3 text-left">
                             <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                             <span className="text-xs font-bold text-green-800">Programmet har uppdaterats automatiskt.</span>
                         </div>
                         <button 
                            onClick={() => setChestModal(null)}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg"
                         >
                             Toppen!
                         </button>
                     </div>
                 ) : (
                     <div className="text-center space-y-4">
                         <p className="text-slate-500 text-sm">
                             Denna belöning är låst. Fortsätt samla XP genom att göra dina dagliga pass för att nå hit.
                         </p>
                         <div className="bg-slate-100 rounded-xl p-3 flex items-center gap-3 text-left">
                             <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                             <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-700">Krav:</span>
                                <span className="text-xs text-slate-500">
                                    {Math.round(chestModal.stage === 2 ? maxXP * 0.33 : maxXP * 0.66)} XP
                                </span>
                             </div>
                         </div>
                         <button 
                            onClick={() => setChestModal(null)}
                            className="w-full py-3 bg-slate-200 text-slate-600 rounded-xl font-bold"
                         >
                             Stäng
                         </button>
                     </div>
                 )}
             </div>
         </div>
      )}

    </div>
  );
};

export default MyJourney;
