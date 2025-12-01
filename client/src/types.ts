
export interface UserProfile {
  uid: string;
  email: string;
  currentLevel: number;
  subscriptionStatus: 'active' | 'trialing' | 'none';
  onboardingCompleted: boolean;
  displayName?: string;
  program?: ProgramConfig; 
  
  assessmentData?: Record<string, any>;

  progression?: ProgressionState;
  
  activePlanIds?: string[]; 
  exerciseProgress?: Record<string, ExerciseProgressEntry>; 
  
  trainingSchedule?: number[]; 
  activityHistory?: ActivityLogEntry[];
  
  completedEducationIds?: string[]; 
}

export interface EducationModule {
  id: string;
  title: string;
  category: string; 
  readTime: string; 
  contentUrl: string; 
  requiredLevel: number; 
}

export interface ExerciseProgressEntry {
  exerciseId: string;
  history: ExertionLevel[]; 
  currentConfig: ExerciseConfig;
  phaseIndex: number; 
  nextMilestone?: string; 
}

export interface ExerciseConfig {
  sets: number;
  reps: number; 
  holdTimeSeconds?: number;
}

export interface WorkoutSession {
  id: string; 
  type: 'rehab' | 'circulation';
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise extends Exercise {
  config: ExerciseConfig;
}

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
  type: 'rehab' | 'light' | 'circulation' | 'daily_activity';
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
  instructions?: string | string[]; 
  durationMinutes: number;
}

export type IrritabilityLevel = 'Low' | 'Moderate' | 'High';
export type JointType = 'Knä' | 'Höft' | 'Rygg' | 'Axel' | 'Handled/Tumbas';

export interface QuestionOption {
  label: string;
  value: string | number;
  description?: string; // Support for detailed option text
}

export interface Question {
  id: string;
  text: string;
  subText?: string; // Support for secondary question text/instructions
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

export type SessionStatus = 'planned' | 'completed' | 'missed';

export interface WorkoutLog {
  id?: string; 
  date: string; 
  status: SessionStatus;
  workoutType: 'rehab' | 'daily_activity' | 'circulation'; 
  level?: number;
  painScore?: number;
  focusText?: string;
  userNote?: string;
  // New fields for detailed history
  exertion?: ExertionLevel;
  completedAt?: string; 
}
