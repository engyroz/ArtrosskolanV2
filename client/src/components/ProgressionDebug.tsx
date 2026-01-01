
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTime } from '../contexts/TimeContext';
import { db } from '../firebase';
import firebase from 'firebase/compat/app';
import { getMaxXP } from '../utils/progressionEngine';
import { Wrench, Package, Swords, RefreshCw, Loader2, Unlock, Rewind } from 'lucide-react';

const ProgressionDebug = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const { isDebugVisible } = useTime();
  const [loading, setLoading] = useState(false);

  if (!isDebugVisible || !user || !userProfile) return null;

  const currentLevel = userProfile.currentLevel;
  const maxXP = getMaxXP(currentLevel);

  const updateProgression = async (updates: any, chestsToRemove: string[] = []) => {
    setLoading(true);
    try {
      const userRef = db.collection('users').doc(user.uid);
      
      // 1. Prepare base update
      const payload: any = {
        ...updates
      };

      // 2. Handle Chest Reset (Array Remove)
      if (chestsToRemove.length > 0) {
        // We have to read current openedChests, filter them, and write back
        // because arrayRemove handles specific values, but we want to be explicit
        const currentChests = userProfile.openedChests || [];
        const newChests = currentChests.filter(c => !chestsToRemove.includes(c));
        payload.openedChests = newChests;
      }

      await userRef.update(payload);
      await refreshProfile();
    } catch (e) {
      console.error("Debug update failed", e);
      alert("Failed to update progression");
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const setStage2 = () => {
    // Stage 2 starts at ~34%
    const targetXP = Math.floor(maxXP * 0.35);
    updateProgression({
      "progression.experiencePoints": targetXP,
      "progression.currentStage": 2,
      "progression.levelMaxedOut": false
    }, [`${currentLevel}_2`]); // Remove chest lock
  };

  const setStage3 = () => {
    // Stage 3 starts at ~67%
    const targetXP = Math.floor(maxXP * 0.68);
    updateProgression({
      "progression.experiencePoints": targetXP,
      "progression.currentStage": 3,
      "progression.levelMaxedOut": false
    }, [`${currentLevel}_3`]); // Remove chest lock
  };

  const setBossReady = () => {
    updateProgression({
      "progression.experiencePoints": maxXP,
      "progression.currentStage": 3, // Technically stage 3 is finished
      "progression.levelMaxedOut": true
    });
  };

  const resetLevel = () => {
    updateProgression({
      "progression.experiencePoints": 0,
      "progression.currentStage": 1,
      "progression.levelMaxedOut": false
    }, [`${currentLevel}_2`, `${currentLevel}_3`]); // Reset all chests for this level
  };

  const goToPreviousLevel = () => {
    if (currentLevel <= 1) return;
    
    updateProgression({
        currentLevel: currentLevel - 1,
        "progression.experiencePoints": 0,
        "progression.currentStage": 1,
        "progression.levelMaxedOut": false,
        "progression.currentPhase": 1
    });
  };

  return (
    <div className="fixed bottom-4 left-4 z-[100] animate-fade-in">
      <div className="bg-slate-900/90 backdrop-blur-md text-slate-200 p-4 rounded-xl border border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] w-64">
        
        <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-indigo-400">
            <Wrench className="w-3 h-3" />
            Progression Hack
          </div>
          {loading && <Loader2 className="w-3 h-3 animate-spin text-white" />}
        </div>

        <div className="grid grid-cols-1 gap-2">
          
          <button 
            onClick={setStage2}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors text-left"
          >
            <div className="p-1 bg-yellow-500/20 text-yellow-400 rounded">
                <Package className="w-3 h-3" />
            </div>
            <div>
                <span className="block">Unlock Chest 2</span>
                <span className="text-[9px] text-slate-500 font-mono">XP: 35% | Chest Reset</span>
            </div>
          </button>

          <button 
            onClick={setStage3}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors text-left"
          >
            <div className="p-1 bg-yellow-500/20 text-yellow-400 rounded">
                <Package className="w-3 h-3" />
            </div>
            <div>
                <span className="block">Unlock Chest 3</span>
                <span className="text-[9px] text-slate-500 font-mono">XP: 68% | Chest Reset</span>
            </div>
          </button>

          <button 
            onClick={setBossReady}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors text-left"
          >
            <div className="p-1 bg-red-500/20 text-red-400 rounded">
                <Swords className="w-3 h-3" />
            </div>
            <div>
                <span className="block">Ready for Boss</span>
                <span className="text-[9px] text-slate-500 font-mono">XP: 100% | MaxedOut</span>
            </div>
          </button>

          <div className="h-px bg-slate-700 my-1"></div>

          <div className="flex gap-2">
            <button 
                onClick={resetLevel}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-2 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-200 rounded-lg text-xs font-bold transition-colors"
                title="Reset current level"
            >
                <RefreshCw className="w-3 h-3" />
                Reset
            </button>

            <button 
                onClick={goToPreviousLevel}
                disabled={loading || currentLevel <= 1}
                className="flex-1 flex items-center justify-center gap-2 px-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                title="Go to previous level"
            >
                <Rewind className="w-3 h-3" />
                Prev Lvl
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProgressionDebug;
