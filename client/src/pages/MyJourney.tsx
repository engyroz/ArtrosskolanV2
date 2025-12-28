
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Flag, X, Gift, AlertCircle, CheckCircle } from 'lucide-react';
import { getMaxXP } from '../utils/progressionEngine';
import { LEVEL_DESCRIPTIONS } from '../utils/contentConfig';
import MapTimeline from '../components/MapTimeline';
import BossFightModal from '../components/BossFightModal';
import StageRewardModal from '../components/StageRewardModal'; // New Import
import { db } from '../firebase';
import firebase from 'firebase/compat/app';

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
  const { userProfile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  // State for modals
  const [showBossModal, setShowBossModal] = useState(false);
  
  // New Modal State for Stage Rewards
  const [rewardModal, setRewardModal] = useState<{
    isOpen: boolean;
    stage: number;
    isNewUnlock: boolean;
  } | null>(null);

  const currentLevel = userProfile?.currentLevel || 1;
  const startLevel = userProfile?.program?.level || 1;
  const userGoal = userProfile?.assessmentData?.mainGoal || "Bli smärtfri";
  const userJoint = userProfile?.program?.joint || 'knee'; // Default fallback
  const openedChests = userProfile?.openedChests || [];

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
     setShowBossModal(true);
  };

  const handleBossSuccess = () => {
      setShowBossModal(false);
      navigate('/dashboard'); 
  };

  const handleChestClick = async (stage: number, status: 'locked' | 'unlocked' | 'opened') => {
      if (status === 'locked') {
        alert("Denna belöning är låst. Fortsätt träna för att nå hit!");
        return;
      }

      // Open Modal
      setRewardModal({
          isOpen: true,
          stage,
          isNewUnlock: status === 'unlocked' // If it was "unlocked" but not "opened", it's new
      });
  };

  const handleCloseRewardModal = async () => {
      if (!rewardModal || !user) return;
      
      const { stage, isNewUnlock } = rewardModal;
      setRewardModal(null);

      // If it was a new unlock, verify we save it to DB so it doesn't animate again
      const chestId = `${currentLevel}_${stage}`;
      if (isNewUnlock && !openedChests.includes(chestId)) {
          try {
              await db.collection('users').doc(user.uid).update({
                  openedChests: firebase.firestore.FieldValue.arrayUnion(chestId)
              });
              await refreshProfile();
          } catch (e) {
              console.error("Failed to save opened chest state", e);
          }
      }
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
                openedChests={openedChests}
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

      {/* New Stage Reward Modal */}
      {rewardModal && (
        <StageRewardModal 
            isOpen={rewardModal.isOpen}
            onClose={handleCloseRewardModal}
            level={currentLevel}
            stage={rewardModal.stage}
            joint={userJoint}
            isNewUnlock={rewardModal.isNewUnlock}
        />
      )}

    </div>
  );
};

export default MyJourney;
