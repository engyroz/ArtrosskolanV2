import { Exercise, WorkoutSession, WorkoutExercise, ExerciseConfig, UserProfile, ExerciseProgressEntry } from '../types';

// Default configs per level (SOP)
const DEFAULT_CONFIGS: Record<number, ExerciseConfig> = {
  1: { sets: 1, reps: 10, holdTimeSeconds: 5 }, // Isometric focus
  2: { sets: 2, reps: 10 },
  3: { sets: 2, reps: 12 },
  4: { sets: 3, reps: 8 }
};

/**
 * GENERATE LEVEL PLAN
 * Runs once when a user enters a new level.
 * Selects specific exercises from the DB to "Lock" into their plan.
 */
export const generateLevelPlan = (
  allExercises: Exercise[], 
  level: number, 
  joint: string
): string[] => {
  const candidates = allExercises.filter(e => e.level === level && (e.joint === joint || e.joint?.includes(joint)));
  const selectedIds: string[] = [];

  // Group by category
  const byCategory: Record<string, Exercise[]> = {};
  candidates.forEach(e => {
    const cat = e.category || 'general';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(e);
  });

  // Selection Logic (SOP)
  const pickOne = (category: string) => {
    const list = byCategory[category];
    if (list && list.length > 0) {
      // Simple randomizer for now, could be smarter
      const random = list[Math.floor(Math.random() * list.length)];
      selectedIds.push(random.id);
    }
  };

  if (level === 1) {
    // 1 Flexor, 1 Extensor, 1 Mobility
    if (joint === 'knee') {
        pickOne('knee_extensor');
        pickOne('knee_flexor');
        pickOne('mobility');
    } else if (joint === 'hip') {
        pickOne('hip_abductor');
        pickOne('hip_extensor');
        pickOne('mobility');
    } else {
        // Fallback: Pick 3 random
        candidates.slice(0, 3).forEach(e => selectedIds.push(e.id));
    }
  } else {
    // Level 2+: Pick one from each available category to form a routine of 3-5 exercises
    Object.keys(byCategory).forEach(cat => pickOne(cat));
  }

  // Ensure we don't have too many (cap at 5)
  return selectedIds.slice(0, 5);
};

/**
 * ASSEMBLE WORKOUT SESSION
 * Combines the locked plan (IDs) with the user's current progress (Reps/Sets).
 */
export const getWorkoutSession = (
  userProfile: UserProfile,
  exercisesDB: Exercise[],
  type: 'rehab' | 'circulation'
): WorkoutSession => {
  
  let sessionExercises: WorkoutExercise[] = [];

  if (type === 'rehab') {
    const planIds = userProfile.activePlanIds || [];
    
    sessionExercises = planIds.map(id => {
      const exercise = exercisesDB.find(e => e.id === id);
      if (!exercise) return null;

      // Get progress or default
      const progress = userProfile.exerciseProgress?.[id];
      const config = progress ? progress.currentConfig : DEFAULT_CONFIGS[userProfile.currentLevel || 1];

      return {
        ...exercise,
        config
      };
    }).filter(Boolean) as WorkoutExercise[];
  
  } else {
    // Circulation: Level 1 Mobility exercises
    // Usually these don't progress in reps, they are time/feeling based
    const circExercises = exercisesDB.filter(e => e.level === 1 && e.category === 'mobility' && e.joint === userProfile.program?.joint);
    sessionExercises = circExercises.map(e => ({
        ...e,
        config: { sets: 1, reps: 10 } // Standard circulation dose
    }));
  }

  return {
    id: `session_${Date.now()}`,
    type,
    exercises: sessionExercises
  };
};