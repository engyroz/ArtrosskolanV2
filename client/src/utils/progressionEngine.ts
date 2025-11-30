import { ExertionLevel, ExerciseConfig, ExerciseProgressEntry, UserProfile } from '../types';

interface ProgressionResult {
  updatedProgress: Record<string, ExerciseProgressEntry>;
  xpEarned: number;
  message: string;
  levelMaxedOut: boolean;
}

const XP_BASE = 100;
const XP_BONUS = 50;

// Dynamic Max XP per level (SOP: 1500 -> 1500 -> 2500 -> 3000)
export const getMaxXP = (level: number) => {
    switch (level) {
        case 1: return 1500;
        case 2: return 1500;
        case 3: return 2500;
        case 4: return 3000;
        default: return 1500;
    }
};

// Legacy constant for backwards compatibility if needed, but prefer getMaxXP
export const MAX_XP_PER_LEVEL = 1500; 

// SOP Progression Steps (Volume First)
const PROGRESSION_STEPS = [
    { sets: 2, reps: 10 }, // Phase 0
    { sets: 2, reps: 12 }, // Phase 1
    { sets: 3, reps: 10 }, // Phase 2
    { sets: 3, reps: 12 }, // Phase 3
];

const getNextConfig = (currentPhase: number): ExerciseConfig => {
    const nextIndex = Math.min(currentPhase + 1, PROGRESSION_STEPS.length - 1);
    const step = PROGRESSION_STEPS[nextIndex];
    return { sets: step.sets, reps: step.reps };
};

export const calculateSessionProgression = (
  userProfile: UserProfile,
  completedExerciseIds: string[],
  sessionExertion: ExertionLevel, 
  painScore: number
): ProgressionResult => {

  const progressMap = { ...(userProfile.exerciseProgress || {}) };
  let xp = XP_BASE;
  let message = "Bra jobbat!";
  let levelMaxedOut = false;
  let exercisesUpgraded = 0;

  const isEasy = painScore < 3 && sessionExertion === 'light';
  const isHard = painScore > 5 || sessionExertion === 'heavy';

  if (isEasy) xp += XP_BONUS;

  const currentTotalXP = (userProfile.progression?.experiencePoints || 0) + xp;
  const xpThreshold = getMaxXP(userProfile.currentLevel || 1);

  completedExerciseIds.forEach(exId => {
    if (!progressMap[exId]) {
      progressMap[exId] = {
        exerciseId: exId,
        history: [],
        currentConfig: { sets: 2, reps: 10 },
        phaseIndex: 0
      };
    }

    const entry = progressMap[exId];

    if (isEasy) entry.history.push('light');
    else if (isHard) entry.history.push('heavy');
    else entry.history.push('perfect');

    if (entry.history.length > 5) entry.history.shift();

    const last3 = entry.history.slice(-3);
    const threeEasyInARow = last3.length === 3 && last3.every(h => h === 'light');

    if (threeEasyInARow) {
        if (entry.phaseIndex < PROGRESSION_STEPS.length - 1) {
            const newConfig = getNextConfig(entry.phaseIndex);
            entry.currentConfig = newConfig;
            entry.phaseIndex += 1;
            entry.history = []; 
            exercisesUpgraded++;
        }
    }
  });

  // Check Trigger
  if (currentTotalXP >= xpThreshold) {
      levelMaxedOut = true;
      message = "Du har nått XP-målet! Du är redo för nästa nivå.";
  } 
  else {
      const activeIds = userProfile.activePlanIds || [];
      if (activeIds.length > 0) {
          const maxedCount = activeIds.filter(id => {
              const entry = progressMap[id];
              return entry && entry.phaseIndex >= PROGRESSION_STEPS.length - 1;
          }).length;
          
          if (maxedCount >= Math.ceil(activeIds.length / 2)) {
              levelMaxedOut = true;
              message = "Du har maxat dina övningar! Du är redo för nästa nivå.";
          }
      }
  }

  if (exercisesUpgraded > 0 && !levelMaxedOut) {
      message = `Starkt! Vi har ökat motståndet på ${exercisesUpgraded} övningar till nästa gång.`;
  }

  return {
    updatedProgress: progressMap,
    xpEarned: xp,
    message,
    levelMaxedOut
  };
};