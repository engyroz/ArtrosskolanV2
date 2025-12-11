
import { Exercise, WorkoutSession, WorkoutExercise, ExerciseConfig, UserProfile } from '../types';
import { db } from '../firebase';

// Default configs per level (SOP)
const DEFAULT_CONFIGS: Record<number, ExerciseConfig> = {
  1: { sets: 1, reps: 10, holdTimeSeconds: 5 }, // Isometric focus
  2: { sets: 2, reps: 10 },
  3: { sets: 2, reps: 12 },
  4: { sets: 3, reps: 8 }
};

// Helper to map UI joint names to DB keys
const mapJoint = (joint?: string): string => {
    if (!joint) return '';
    const j = joint.toLowerCase();
    if (j === 'knä' || j === 'knee') return 'knee';
    if (j === 'höft' || j === 'hip') return 'hip';
    if (j === 'axel' || j === 'shoulder') return 'shoulder';
    return j;
};

/**
 * FETCH USER PLAN (Async)
 * Retrieves the specific exercises configured for the user's Joint, Level, and Stage.
 * Accumulates exercises from current stage and all previous stages in this level.
 */
export const fetchUserPlan = async (joint: string, level: number, stage: number): Promise<string[]> => {
    const normalizedJoint = mapJoint(joint);
    const docId = `${normalizedJoint}_${level}`;

    try {
        const doc = await db.collection('levels').doc(docId).get();
        
        if (!doc.exists) {
            console.warn(`Level config ${docId} not found in 'levels' collection.`);
            return [];
        }

        const data = doc.data();
        let ids: string[] = [];
        
        // Accumulate exercises: Current Stage + Previous Stages (on this level)
        if (stage >= 1 && Array.isArray(data?.stage1_ids)) ids = [...ids, ...data.stage1_ids];
        if (stage >= 2 && Array.isArray(data?.stage2_ids)) ids = [...ids, ...data.stage2_ids];
        if (stage >= 3 && Array.isArray(data?.stage3_ids)) ids = [...ids, ...data.stage3_ids];

        // Deduplicate IDs
        return Array.from(new Set(ids));
    } catch (error) {
        console.error("Error fetching user plan:", error);
        return [];
    }
};

/**
 * GENERATE LEVEL PLAN (Legacy / Fallback)
 * Keeps mostly for reference or if used in purely client-side logic without DB access.
 */
export const generateLevelPlan = (
  allExercises: Exercise[], 
  level: number, 
  joint: string
): string[] => {
  const targetJoint = mapJoint(joint);
  
  // Filter candidates (checking mapped joint)
  const candidates = allExercises.filter(e => 
      e.level === level && (mapJoint(e.joint) === targetJoint)
  );
  
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
      const random = list[Math.floor(Math.random() * list.length)];
      selectedIds.push(random.id);
    }
  };

  if (level === 1) {
    if (targetJoint === 'knee') {
        pickOne('knee_extensor');
        pickOne('knee_flexor');
        pickOne('mobility');
    } else if (targetJoint === 'hip') {
        pickOne('hip_abductor');
        pickOne('hip_extensor');
        pickOne('mobility');
    } else {
        candidates.slice(0, 3).forEach(e => selectedIds.push(e.id));
    }
  } else {
    Object.keys(byCategory).forEach(cat => pickOne(cat));
  }

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

      const progress = userProfile.exerciseProgress?.[id];
      const config = progress ? progress.currentConfig : DEFAULT_CONFIGS[userProfile.currentLevel || 1];

      return {
        ...exercise,
        config
      };
    }).filter(Boolean) as WorkoutExercise[];
  
  } else {
    // Circulation: Level 1 Exercises (Fixed 3 distinct types)
    // Rule: 1 Flexor, 1 Extensor, 1 Mobility (regardless of user level)
    // Fixed Dose: 2 sets x 15 reps/sec
    const userJoint = mapJoint(userProfile.program?.joint);
    
    // Find candidates from Level 1
    const l1Exercises = exercisesDB.filter(e => e.level === 1 && mapJoint(e.joint) === userJoint);
    
    const selectedCirculation: Exercise[] = [];
    
    // Helper to pick one by category logic (similar to generateLevelPlan but for session)
    // Ideally we pick distinct ones to ensure variety
    if (userJoint === 'knee') {
        const ext = l1Exercises.find(e => e.category === 'knee_extensor');
        const flex = l1Exercises.find(e => e.category === 'knee_flexor');
        const mob = l1Exercises.find(e => e.category === 'mobility');
        if (ext) selectedCirculation.push(ext);
        if (flex) selectedCirculation.push(flex);
        if (mob) selectedCirculation.push(mob);
    } else if (userJoint === 'hip') {
        const abd = l1Exercises.find(e => e.category === 'hip_abductor');
        const ext = l1Exercises.find(e => e.category === 'hip_extensor');
        const mob = l1Exercises.find(e => e.category === 'mobility');
        if (abd) selectedCirculation.push(abd);
        if (ext) selectedCirculation.push(ext);
        if (mob) selectedCirculation.push(mob);
    } else {
        // Fallback: Take first 3
        l1Exercises.slice(0, 3).forEach(e => selectedCirculation.push(e));
    }

    sessionExercises = selectedCirculation.map(e => ({
        ...e,
        config: { sets: 2, reps: 15 } // Fixed dose for circulation
    }));
  }

  return {
    id: `session_${Date.now()}`,
    type,
    exercises: sessionExercises
  };
};
