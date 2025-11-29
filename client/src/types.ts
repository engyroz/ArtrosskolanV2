export interface UserProfile {
  uid: string;
  email: string;
  currentLevel: number;
  subscriptionStatus: 'active' | 'trialing' | 'none';
  onboardingCompleted: boolean;
  displayName?: string;
  program?: ProgramConfig; 
  
  // Progression & Gamification
  progression?: ProgressionState;
  
  // Workout Engine Data
  activePlanIds?: string[]; // The fixed list of exercises for current level
  exerciseProgress?: Record<string, ExerciseProgressEntry>; // Tracking specific stats per exercise
  
  // History
  trainingSchedule?: number[]; 
  activityHistory?: ActivityLogEntry[];
}

export interface ExerciseProgressEntry {
  exerciseId: string;
  history: ExertionLevel[]; // Keep last 3-5 sessions
  currentConfig: ExerciseConfig;
  phaseIndex: number; // 0 to 3 (matching the 4 steps in SOP)
  nextMilestone?: string; // e.g. "3x10"
}

export interface ExerciseConfig {
  sets: number;
  reps: number; // or seconds for isometric
  holdTimeSeconds?: number;
}

export interface WorkoutSession {
  id: string; // unique session ID
  type: 'rehab' | 'circulation';
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise extends Exercise {
  config: ExerciseConfig;
}

// Decoupled Assessment Data (for anonymous storage)
export interface AssessmentData {
  joint: JointType;
  painRest?: string;
  painLoad?: number;
  functionalAnswers: Record<string, string>;
  activityLevel?: string;
  goal?: string;
  level: number;
  programConfig?: ProgramConfig;
  timestamp: string;
}

export interface ProgressionState {
  currentPhase: 1 | 2 | 3 | 4; 
  consecutivePerfectSessions: number; 
  experiencePoints: number; 
  levelMaxedOut: boolean; 
}

export type ExertionLevel = 'light' | 'perfect' | 'heavy';

export interface ActivityLogEntry {
  date: string; 
  type: 'rehab' | 'light' | 'circulation';
  painScore?: number;
  completedAt: string; 
  exertion?: ExertionLevel;
  feedbackMessage?: string; 
  xpEarned?: number;
}

export interface Exercise {
  id: string;
  title: string;
  level: number;
  joint?: string; 
  category?: string; 
  imageUrl: string;
  description: string;
  instructions?: string | string[]; // Can be string (legacy) or array
  durationMinutes: number;
}

// --- Assessment & Program Types ---

export type IrritabilityLevel = 'Low' | 'Moderate' | 'High';
export type JointType = 'Knä' | 'Höft' | 'Rygg' | 'Axel' | 'Handled/Tumbas';

export interface QuestionOption {
  label: string;
  value: string | number;
}

export interface Question {
  id: string;
  text: string;
  type: 'choice' | 'scale' | 'info'; 
  options?: QuestionOption[];
}

export interface ActivityPrescription {
  type: string; 
  label: string; 
  description: string;
  durationMinutes: number;
  frequencyLabel: string;
}

export interface ProgramConfig {
  generatedAt: string; 
  joint: JointType;
  level: number; 
  irritability: IrritabilityLevel;
  rehabDaysPerWeek: number;
  circulationDaysPerWeek: number;
  activityPrescription?: ActivityPrescription; 
  focusAreas: string[]; 
}