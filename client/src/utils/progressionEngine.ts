
import { UserProfile } from '../types';

// --- CONFIGURATION ---

// XP Mål per Nivå (Accumulated reset per level)
export const LEVEL_XP_CAPS: Record<number, number> = {
  1: 1500,
  2: 1500,
  3: 2500,
  4: 3000
};

// Poängsystemet (Activities)
export const ACTIVITY_XP = {
  REHAB_SESSION: 100, // Stort Rehabpass
  DAILY_MEDICINE: 30, // Litet pass
  PHYSICAL_ACTIVITY: 10, // FaR
  KNOWLEDGE_ARTICLE: 50 // Läsa artikel (one-time)
};

// Etapp-systemet (Stages within a level)
// Returns stage 1-3 based on percentage of XP Cap
export const calculateStage = (currentXP: number, maxXP: number): 1 | 2 | 3 => {
  const percentage = currentXP / maxXP;
  if (percentage >= 0.67) return 3; // Expert (67-99%)
  if (percentage >= 0.34) return 2; // På väg (34-66%)
  return 1; // Nykomling (0-33%)
};

// --- CORE FUNCTIONS ---

export interface ProgressionResult {
  xpEarned: number;
  newTotalXP: number;
  newStage: 1 | 2 | 3;
  levelMaxedOut: boolean;
  message?: string;
  stageUp: boolean; // True if user crossed a stage boundary (e.g. 1->2)
}

export const getMaxXP = (level: number) => {
    return LEVEL_XP_CAPS[level] || 1500;
};

/**
 * Calculates new progression state based on activity type.
 * Note: Does not write to DB, just calculates the new state.
 */
export const calculateProgressionUpdate = (
  userProfile: UserProfile,
  activityType: 'REHAB_SESSION' | 'DAILY_MEDICINE' | 'PHYSICAL_ACTIVITY' | 'KNOWLEDGE_ARTICLE'
): ProgressionResult => {
  
  const currentXP = userProfile.progression?.experiencePoints || 0;
  const currentLevel = userProfile.currentLevel || 1;
  const maxXP = getMaxXP(currentLevel);
  const oldStage = userProfile.progression?.currentStage || 1;

  // 1. Determine XP Gain
  let xpGain = ACTIVITY_XP[activityType] || 0;
  
  // Cap XP gain so it doesn't overflow drastically (visual polish), though engine allows it
  // But logic says: "Boss Mode: 100% av XP-taket".
  
  const newTotalXP = currentXP + xpGain;
  const levelMaxedOut = newTotalXP >= maxXP;
  
  // 2. Determine New Stage
  // If maxed out, we are technically "Ready for Boss" (effectively Stage 3 completed)
  let newStage = calculateStage(newTotalXP, maxXP);
  
  // 3. Detect Stage Up Event
  const stageUp = newStage > oldStage;

  // 4. Generate Message
  let message = `+${xpGain} XP`;
  if (levelMaxedOut && !userProfile.progression?.levelMaxedOut) {
      message = "XP-taket nått! Nivåtestet är upplåst!";
  } else if (stageUp) {
      if (newStage === 2) message = "Du har nått Etapp 2! Nytt innehåll upplåst.";
      if (newStage === 3) message = "Sista rycket! Du har nått Etapp 3.";
  }

  return {
    xpEarned: xpGain,
    newTotalXP,
    newStage,
    levelMaxedOut,
    message,
    stageUp
  };
};

/**
 * Checks if a specific content module is unlocked for the user.
 */
export const isContentUnlocked = (
    userProfile: UserProfile, 
    requirements: { 
        unlockType: 'level' | 'lifetime'; 
        requiredLevel?: number; 
        requiredStage?: number; 
        requiredSessions?: number; 
    }
): boolean => {
    
    // SERIES A: LIFETIME SESSIONS
    if (requirements.unlockType === 'lifetime') {
        const totalSessions = userProfile.progression?.lifetimeSessions || 0;
        return totalSessions >= (requirements.requiredSessions || 0);
    }

    // SERIES B: LEVEL & STAGE
    if (requirements.unlockType === 'level') {
        const currentLevel = userProfile.currentLevel || 1;
        const currentStage = userProfile.progression?.currentStage || 1;
        const reqLevel = requirements.requiredLevel || 1;
        const reqStage = requirements.requiredStage || 1;

        // Rule: "Visas om Nivå > X eller (Nivå = X OCH Etapp >= Y)"
        if (currentLevel > reqLevel) return true;
        if (currentLevel === reqLevel && currentStage >= reqStage) return true;
        
        return false;
    }

    return true; // Default open
};
