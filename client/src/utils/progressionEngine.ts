import { ExertionLevel, ExerciseConfig, ExerciseProgressEntry, UserProfile } from '../types';

interface ProgressionResult {
  updatedProgress: Record<string, ExerciseProgressEntry>;
  xpEarned: number;
  message: string;
  levelMaxedOut: boolean;
}

const XP_BASE = 100;
const XP_BONUS = 50;
export const MAX_XP_PER_LEVEL = 1200; // SOP: Trigger Boss Fight after ~12 sessions

// SOP Progression Steps (Volume First)
// [Sets, Reps]
const PROGRESSION_STEPS = [
    { sets: 2, reps: 10 }, // Phase 0 (Start)
    { sets: 2, reps: 12 }, // Phase 1
    { sets: 3, reps: 10 }, // Phase 2 (Volume Jump)
    { sets: 3, reps: 12 }, // Phase 3 (Max)
];

const getNextConfig = (currentPhase: number): ExerciseConfig => {
    const nextIndex = Math.min(currentPhase + 1, PROGRESSION_STEPS.length - 1);
    const step = PROGRESSION_STEPS[nextIndex];
    return { sets: step.sets, reps: step.reps };
};

export const calculateSessionProgression = (
  userProfile: UserProfile,
  completedExerciseIds: string[],
  sessionExertion: ExertionLevel, // Global feedback for simplicity (as per spec)
  painScore: number
): ProgressionResult => {

  const progressMap = { ...(userProfile.exerciseProgress || {}) };
  let xp = XP_BASE;
  let message = "Bra jobbat!";
  let levelMaxedOut = false;
  let exercisesUpgraded = 0;

  // Criteria: "Easy" session (<3 pain, Light exertion)
  const isEasy = painScore < 3 && sessionExertion === 'light';
  const isHard = painScore > 5 || sessionExertion === 'heavy';

  if (isEasy) xp += XP_BONUS;

  // Calculate new Total XP locally to check trigger
  const currentTotalXP = (userProfile.progression?.experiencePoints || 0) + xp;

  completedExerciseIds.forEach(exId => {
    // Init if missing
    if (!progressMap[exId]) {
      progressMap[exId] = {
        exerciseId: exId,
        history: [],
        currentConfig: { sets: 2, reps: 10 }, // Default start
        phaseIndex: 0
      };
    }

    const entry = progressMap[exId];

    // Update History
    if (isEasy) entry.history.push('light');
    else if (isHard) entry.history.push('heavy');
    else entry.history.push('perfect');

    // Keep history manageable
    if (entry.history.length > 5) entry.history.shift();

    // CHECK 3-STRIKES RULE
    // Look at last 3 entries. If all are 'light', trigger upgrade.
    const last3 = entry.history.slice(-3);
    const threeEasyInARow = last3.length === 3 && last3.every(h => h === 'light');

    if (threeEasyInARow) {
        if (entry.phaseIndex < PROGRESSION_STEPS.length - 1) {
            // Upgrade!
            const newConfig = getNextConfig(entry.phaseIndex);
            entry.currentConfig = newConfig;
            entry.phaseIndex += 1;
            entry.history = []; // Reset streak after upgrade
            exercisesUpgraded++;
        }
    }
  });

  // CHECK TRIGGER: Level Maxed Out?
  // Condition A: XP Threshold reached ("Time Served")
  if (currentTotalXP >= MAX_XP_PER_LEVEL) {
      levelMaxedOut = true;
      message = "Du har nått XP-målet! Du är redo för nästa nivå.";
  } 
  else {
      // Condition B: Exercises Difficulty Maxed (Performance)
      // Simplification: If >50% of active exercises are at max phase
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